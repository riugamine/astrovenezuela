"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/useCartStore";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useCustomerStore } from "@/lib/store/useCustomerStore";
import { PlacesAutocomplete } from "@/components/ui/places-autocomplete";
import { createOrder } from "@/lib/data/orders";
import {
  ShippingMethod,
} from "@/lib/types/database.types";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { redirect } from "next/navigation";
import { CustomerInfo } from "@/lib/types/database.types";
// Importar el tipo de método de pago desde constants
import { VALID_PAYMENT_METHODS } from "@/lib/constants";

// Actualizar la interfaz para usar el tipo literal
type PaymentMethod = typeof VALID_PAYMENT_METHODS[number];

interface PaymentMethodUI {
  id: PaymentMethod;
  name: string;
  description: string;
}
const shippingMethods: ShippingMethod[] = [
  {
    id: "pickup",
    name: "Retirar en tienda",
    description: "Retira tu pedido en nuestra tienda en Maracay",
    price: 0,
  },
  {
    id: "delivery_maracay",
    name: "Delivery en Maracay",
    description: "Entrega a domicilio solo en Maracay",
    price: 5,
  },
  {
    id: "mrw",
    name: "Envío MRW",
    description: "Envío a toda Venezuela (Cobro en destino)",
    price: 0,
  },
  {
    id: "zoom",
    name: "Envío Zoom",
    description: "Envío a toda Venezuela (Cobro en destino)",
    price: 0,
  },
];

const paymentMethods: PaymentMethodUI[] = [
  {
    id: "pago_movil",
    name: "Pago Móvil",
    description: "Transferencia bancaria móvil",
  },
  { id: "zelle", name: "Zelle", description: "Pago con Zelle" },
  { id: "binance", name: "Binance", description: "Pago con criptomonedas" },
  { id: "efectivo", name: "Efectivo $", description: "Pago en efectivo (USD)" },
  { id: "paypal", name: "PayPal", description: "Pago con PayPal" },
];
const initialFormFields = {
  customerInfo: {
    name: "",
    lastName: "",
    phone: "",
    address: "",
    agencyAddress: "",
    dni: "",
    email: "" // Mantenemos el email pero lo inicializamos vacío
  } satisfies CustomerInfo,
  shippingMethod: "",
  paymentMethod: "" as PaymentMethod | "",
  orderNotes: ""
};
export default function CheckoutPage() {
  const { user }= useAuthStore();
  const { orderNotes, setOrderNotes } = useCartStore();
  const { items, totalItems, clearCart } = useCartStore();
  const [shippingMethod, setShippingMethod] = useState<string>(initialFormFields.shippingMethod);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(initialFormFields.paymentMethod);
  const { customerInfo, setCustomerInfo } = useCustomerStore();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping =
    shippingMethods.find((m) => m.id === shippingMethod)?.price || 0;
  const total = subtotal + shipping;
  const cleanupForm = () => {
    setCustomerInfo({
      ...customerInfo,
      name: "",
      lastName: "",
      phone: "",
      address: "",
      agencyAddress: "",
      dni: ""
      // No limpiamos el email
    });
    setShippingMethod(initialFormFields.shippingMethod);
    setPaymentMethod(initialFormFields.paymentMethod);
    setOrderNotes(initialFormFields.orderNotes);
  };
  const handleSubmit = async () => {
    let createdOrder = null;
    try {
      // Validate required fields
      if (!customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.lastName) {
        toast.error("Por favor complete todos los campos requeridos");
        return;
      }

      // Validate phone number
      if (!isValidPhoneNumber(customerInfo.phone)) {
        toast.error("Por favor ingrese un número de teléfono válido");
        return;
      }

      // Validate shipping method and payment method
      if (!shippingMethod || !paymentMethod) {
        toast.error("Por favor seleccione un método de envío y pago");
        return;
      }

      // Validate shipping address based on shipping method
      if (shippingMethod === "delivery_maracay" && !customerInfo.address) {
        toast.error("Por favor ingrese una dirección de entrega");
        return;
      }

      if ((shippingMethod === "mrw" || shippingMethod === "zoom") && !customerInfo.agencyAddress) {
        toast.error("Por favor ingrese la dirección de la agencia");
        return;
      }

      // Create order with proper error handling
      // Update the order creation part in handleSubmit function
      createdOrder = await createOrder({
        user_id: user?.id || "",
        total_amount: total,
        shipping_address: customerInfo.address || customerInfo.agencyAddress || "retiro en tienda",
        payment_method: paymentMethod,
        whatsapp_number: customerInfo.phone,
        items: items.map((item) => ({
          product_id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      // Format WhatsApp message
      const formattedItems = items
        .map(
          (item) =>
            `• ${item.quantity}x ${item.name}\n` +
            `  Talla: ${item.size}\n` +
            `  Precio: $${item.price.toFixed(2)}`
        )
        .join("\n\n");

      const selectedPayment = paymentMethods.find((m) => m.id === paymentMethod)?.name;
      const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod)?.name;
      
      // Store phone number in environment variable or configuration
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      
      // Create a more structured message
      // In the handleSubmit function, update the message formatting:

      const message = [
        "🛍️ NUEVO PEDIDO",
        "",
        "👤 INFORMACIÓN DEL CLIENTE",
        `Nombre: ${customerInfo.name} ${customerInfo.lastName}`,
        `Teléfono: ${customerInfo.phone}`,
        `Email: ${customerInfo.email}`,
        customerInfo.agencyAddress ? `Agencia: ${customerInfo.agencyAddress}` : "",
        customerInfo.address ? `Dirección: ${customerInfo.address}` : "",
        "",
        "📦 PRODUCTOS",
        formattedItems,
        "",
        "💭 NOTAS ESPECIALES",
        orderNotes ? orderNotes : "Sin notas especiales",
        "",
        "💰 RESUMEN",
        `Subtotal: $${subtotal.toFixed(2)}`,
        shipping > 0 ? `Envío: $${shipping.toFixed(2)}` : "Envío: A calcular según zona",
        `Total: $${total.toFixed(2)}`,
        "",
        "📋 DETALLES DE ENVÍO Y PAGO",
        `Envío: ${selectedShipping}`,
        `Pago: ${selectedPayment}`,
        "",
        `ID de Orden: ${createdOrder.id}`
      ].filter(Boolean).join("\n");

      // Clear cart after successful order creation
      clearCart();
      cleanupForm();
      // Show success message
      toast.success("Pedido creado exitosamente");
      
      // Handle long messages
      const encodedMessage = encodeURIComponent(message);
      if (encodedMessage.length > 4000) {
        const summaryMessage = [
          "🛍️ RESUMEN DE PEDIDO",
          `Cliente: ${customerInfo.name} ${customerInfo.lastName}`,
          `Productos: ${totalItems}`,
          `Total: $${total.toFixed(2)}`,
          "",
          "Por favor, contáctenos para ver los detalles completos.",
          `ID de Orden: ${createdOrder.id}`
        ].join("\n");

        window.open(
          `https://wa.me/${phoneNumber}?text=${encodeURIComponent(summaryMessage)}`,
          "_blank"
        );
      } else {
        window.open(
          `https://wa.me/${phoneNumber}?text=${encodedMessage}`,
          "_blank"
        );
      }
    } catch (error) {
      toast.error("Error al crear el pedido. Por favor intente nuevamente." + error);
    }
    finally{
      // Redirect to success page
      redirect(`/cart/success?order_id=${createdOrder?.id}`);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de contacto */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Contacto</h2>
            <Input
              placeholder="Correo electrónico"
              value={customerInfo.email}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, email: e.target.value })
              }
              required
            />
            {/* Selector de país */}
            <div className="space-y-2">
              <Label>País</Label>
              <Select disabled defaultValue="VE">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VE">Venezuela</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Información de entrega */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Información Personal</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nombre"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Apellidos"
                value={customerInfo.lastName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                }
                required
              />
            </div>
            <Input
              placeholder="Cédula de Identidad"
              value={customerInfo.dni}
              onChange={(e) =>
                setCustomerInfo({ ...customerInfo, dni: e.target.value })
              }
              required
            />
            <PhoneInput
              placeholder="Número de celular"
              value={customerInfo.phone || "+58"}
              onChange={(value) =>
                setCustomerInfo({
                  ...customerInfo,
                  phone: value?.startsWith("+58") ? value : "+58" + (value?.replace(/^\+58/, "") || "")
                })
              }
              defaultCountry="VE"
              required
              international={false}
              countrySelectProps={{ disabled: true }}
            />
            {customerInfo.phone && !isValidPhoneNumber(customerInfo.phone) && (
              <p className="text-sm text-destructive">
                Número de teléfono inválido
              </p>
            )}
            <Separator />
            {/* Métodos de pago */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Método de pago</h2>
              <div className="grid grid-cols-1 sm: grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Métodos de envío */}
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Método de envío</h2>
              <div className="grid grid-cols-1 gap-3">
                {shippingMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      shippingMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setShippingMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            shippingMethod === method.id
                              ? "border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {shippingMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {method.price > 0
                          ? `$${method.price.toLocaleString("es-VE")}`
                          : "Gratis"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Campo de dirección condicional */}
            {shippingMethod === "delivery_maracay" && (
              <Input
                placeholder="Dirección de entrega"
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
                required
              />
            )}

            {/* Campo de agencia condicional */}
            {(shippingMethod === "mrw" || shippingMethod === "zoom") && (
              <div className="space-y-2">
                <Label>Dirección de la agencia</Label>
                <PlacesAutocomplete
                  value={customerInfo.agencyAddress || ""}
                  onChange={(address) =>
                    setCustomerInfo({ ...customerInfo, agencyAddress: address })
                  }
                  required
                  agencyType={shippingMethod as "mrw" | "zoom"}
                  placeholder={`Buscar agencia ${shippingMethod.toUpperCase()}...`}
                />
                <p className="text-sm text-muted-foreground">
                  Busca la agencia {shippingMethod === "mrw" ? "MRW" : "Zoom"}{" "}
                  más cercana
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-6 text-secondary">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.variant_id} className="flex gap-4">
                <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    priority
                    blurDataURL={item.image_url}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="absolute top-1 right-1 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Talla: {item.size}
                  </p>
                </div>
                <p className="font-medium">
                  ${(item.price * item.quantity).toLocaleString("es-VE")}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-VE")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>${shipping.toLocaleString("es-VE")}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${total.toLocaleString("es-VE")}</span>
          </div>

          <Button
            className="w-full dark:text-secondary"
            size="lg"
            onClick={handleSubmit}
            disabled={
              !shippingMethod ||
              !paymentMethod ||
              !customerInfo.name ||
              !customerInfo.phone
            }
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2 " />
            Hacer pedido por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
