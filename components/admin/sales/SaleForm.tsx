"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash, faDollarSign } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSaleAPI } from "@/lib/api/sales";
import { SaleItem } from "@/lib/data/admin/actions/sales/types";
import { ProductSelector } from "./ProductSelector";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api/products";
import { ProductWithRelations } from "@/lib/data/admin/actions/products/types";
import { VALID_PAYMENT_METHODS } from "@/lib/constants";

// Zod schema for sale form
const saleFormSchema = z.object({
  // Customer information
  customer_first_name: z.string().min(1, "El nombre es requerido"),
  customer_last_name: z.string().min(1, "El apellido es requerido"),
  customer_phone: z.string().min(1, "El teléfono es requerido"),
  customer_email: z.string().email("Email inválido").optional().or(z.literal("")),
  customer_dni: z.string().optional(),
  
  // Shipping information
  shipping_address: z.string().optional(),
  shipping_method: z.string().min(1, "El método de envío es requerido"),
  agency_address: z.string().optional(),
  
  // Payment information
  payment_method: z.enum(VALID_PAYMENT_METHODS, {
    errorMap: () => ({ message: "Método de pago inválido" })
  }),
  whatsapp_number: z.string().min(1, "El número de WhatsApp es requerido"),
  
  // Optional notes
  order_notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // Si el método de envío es "delivery", la dirección de envío es requerida
  if (data.shipping_method === "delivery") {
    if (!data.shipping_address || data.shipping_address.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección de envío es requerida",
        path: ["shipping_address"],
      });
    }
  }
  // Si el método de envío es "MRW" o "Zoom", la dirección de agencia es requerida
  if (data.shipping_method === "MRW" || data.shipping_method === "Zoom") {
    if (!data.agency_address || data.agency_address.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La dirección de la agencia es requerida",
        path: ["agency_address"],
      });
    }
  }
});

type SaleFormData = z.infer<typeof saleFormSchema>;

interface SaleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * SaleForm component for creating admin sales
 * Includes customer info, product selection, shipping, and payment sections
 */
export function SaleForm({ onSuccess, onCancel }: SaleFormProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SaleItem[]>([]);

  // Fetch products to get names for display
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  // Create a map for quick product lookup
  const productMap = useMemo(() => {
    const map = new Map<string, ProductWithRelations>();
    products.forEach((product) => {
      map.set(product.id, product);
    });
    return map;
  }, [products]);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      customer_first_name: "",
      customer_last_name: "",
      customer_phone: "",
      customer_email: "",
      customer_dni: "",
      shipping_address: "",
      shipping_method: "",
      agency_address: "",
      payment_method: undefined,
      whatsapp_number: "",
      order_notes: "",
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: SaleFormData) => {
      if (items.length === 0) {
        throw new Error("Debe agregar al menos un producto");
      }

      // Prepare shipping address based on shipping method
      let finalShippingAddress = "";
      if (data.shipping_method === "delivery") {
        finalShippingAddress = data.shipping_address || "";
      } else if (data.shipping_method === "MRW" || data.shipping_method === "Zoom") {
        // For MRW/Zoom, use agency_address as shipping_address
        finalShippingAddress = data.agency_address || "";
      } else if (data.shipping_method === "pickup") {
        // For pickup, use a default value
        finalShippingAddress = "Recoger en tienda";
      }

      const saleData = {
        ...data,
        customer_email: data.customer_email || undefined,
        customer_dni: data.customer_dni || undefined,
        shipping_address: finalShippingAddress,
        agency_address: data.agency_address || undefined,
        order_notes: data.order_notes || undefined,
        items,
        status: "pending" as const,
      };

      return createSaleAPI(saleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Venta creada exitosamente");
      onSuccess();
    },
    onError: (error: Error) => {
      console.error("Error creating sale:", error);
      toast.error(error.message || "Error al crear la venta");
    },
  });

  const onSubmit = (data: SaleFormData) => {
    if (items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }
    createSaleMutation.mutate(data);
  };

  const handleAddProduct = (item: SaleItem) => {
    setItems([...items, item]);
    toast.success("Producto agregado al carrito");
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingMethod = form.watch("shipping_method");
  const showShippingAddress = shippingMethod === "delivery";
  const showAgencyAddress = shippingMethod === "MRW" || shippingMethod === "Zoom";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido *</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customer_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono/Celular *</FormLabel>
                    <FormControl>
                      <Input placeholder="0412-1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="customer_dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula/Identificación (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="V-12345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Products Selection Section */}
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProductSelector onAddProduct={handleAddProduct} existingItems={items} />

            {/* Selected Items List */}
            {items.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Productos Seleccionados</h4>
                <div className="border rounded-lg">
                  <div className="divide-y">
                    {items.map((item, index) => {
                      const product = productMap.get(item.product_id);
                      const variant = item.variant_id
                        ? product?.variants?.find((v) => v.id === item.variant_id)
                        : null;
                      
                      return (
                        <div
                          key={index}
                          className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {product?.name || `Producto ID: ${item.product_id}`}
                              {variant && ` - Talla: ${variant.size}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              Cantidad: {item.quantity} × ${item.price} = $
                              {(item.quantity * item.price).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <div className="text-lg font-semibold">
                    Total: ${totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="shipping_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Envío *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Limpiar campos cuando cambia el método de envío
                      if (value !== "delivery") {
                        form.setValue("shipping_address", "");
                      }
                      if (value !== "MRW" && value !== "Zoom") {
                        form.setValue("agency_address", "");
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un método de envío" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="delivery">Entrega a Domicilio</SelectItem>
                      <SelectItem value="MRW">MRW</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="pickup">Recoger en Tienda</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showShippingAddress && (
              <FormField
                control={form.control}
                name="shipping_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Envío *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dirección completa de envío"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {showAgencyAddress && (
              <FormField
                control={form.control}
                name="agency_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de la Agencia *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Dirección de la agencia MRW/Zoom"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Payment Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un método de pago" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                      <SelectItem value="zelle">Zelle</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de WhatsApp *</FormLabel>
                  <FormControl>
                    <Input placeholder="0412-1234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="order_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre la orden"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de la Orden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total:</span>
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDollarSign} />
                  {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createSaleMutation.isPending || items.length === 0}
          >
            {createSaleMutation.isPending ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Venta"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

