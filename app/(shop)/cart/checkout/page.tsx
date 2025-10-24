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
import { createGuestOrder } from "@/lib/data/orders";
import {
  ShippingMethod,
} from "@/lib/types/database.types";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
// import { useAuthStore } from "@/lib/store/useAuthStore"; // Removed unused import
import { CustomerInfo } from "@/lib/types/database.types";
// Importar el tipo de método de pago desde constants
import { VALID_PAYMENT_METHODS } from "@/lib/constants";
import { useActiveExchangeRate } from "@/lib/store/useExchangeRateStore";
import { calculateDualPrices, formatDualPrice, calculatePriceByPaymentMethod } from "@/lib/utils/currency-converter";

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
    description: "Entrega a domicilio solo en Maracay (Costo por definir)",
    price: 0, // Mantener en 0 para el cálculo
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
  // const { user } = useAuthStore(); // Removed unused variable
  const { orderNotes, setOrderNotes } = useCartStore();
  const { items, clearCart } = useCartStore();
  const [shippingMethod, setShippingMethod] = useState<string>(initialFormFields.shippingMethod);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(initialFormFields.paymentMethod);
  const { customerInfo, setCustomerInfo } = useCustomerStore();
  const activeRate = useActiveExchangeRate();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping =
    shippingMethods.find((m) => m.id === shippingMethod)?.price || 0;
  const total = subtotal + shipping;

  // Calculate dual prices for display based on payment method
  const getPriceDisplay = (price: number, usePaymentMethod: boolean = false) => {
    if (!activeRate) {
      return `REF ${price.toFixed(2)}`;
    }
    
    try {
      if (usePaymentMethod && paymentMethod) {
        const pricing = calculatePriceByPaymentMethod(price, paymentMethod, activeRate);
        return formatDualPrice(pricing.usdPrice, pricing.vesPrice);
      } else {
        const { usdPrice, vesPrice } = calculateDualPrices(price, activeRate);
        return formatDualPrice(usdPrice, vesPrice);
      }
    } catch (error) {
      console.error('Error calculating dual prices:', error);
      return `REF ${price.toFixed(2)}`;
    }
  };

  // Get discount information for current payment method
  const getDiscountInfo = (price: number) => {
    if (!activeRate || !paymentMethod) return null;
    
    try {
      return calculatePriceByPaymentMethod(price, paymentMethod, activeRate);
    } catch (error) {
      console.error('Error calculating discount info:', error);
      return null;
    }
  };
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

      // Create guest order with proper error handling
      createdOrder = await createGuestOrder({
        total_amount: total,
        shipping_address: customerInfo.address || customerInfo.agencyAddress || "retiro en tienda",
        payment_method: paymentMethod,
        whatsapp_number: customerInfo.phone,
        customer_email: customerInfo.email,
        customer_first_name: customerInfo.name,
        customer_last_name: customerInfo.lastName,
        customer_dni: customerInfo.dni,
        customer_phone: customerInfo.phone,
        shipping_method: shippingMethod,
        order_notes: orderNotes,
        agency_address: customerInfo.agencyAddress,
        items: items.map((item) => ({
          product_id: item.id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      // Format WhatsApp message with payment method pricing
      const formattedItems = items
        .map(
          (item) =>
            `• ${item.quantity}x ${item.name}\n` +
            `  Talla: ${item.size}\n` +
            `  Precio: ${getPriceDisplay(item.price, true)}`
        )
        .join("\n\n");

      const selectedPayment = paymentMethods.find((m) => m.id === paymentMethod)?.name;
      const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod)?.name;
      
      // Store phone number in environment variable or configuration
      const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      
      // Get discount information
      const discountInfo = getDiscountInfo(subtotal);
      
      // Create a more structured message
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
        `Subtotal: ${getPriceDisplay(subtotal, true)}`,
        shippingMethod === "delivery_maracay"
          ? "Envío: Por definir"
          : shipping > 0
          ? `Envío: ${getPriceDisplay(shipping, true)}`
          : "Envío: A calcular según zona",
        discountInfo?.hasDiscount ? `✨ Descuento aplicado: ${discountInfo.discountPercentage}%` : "",
        `Total: ${getPriceDisplay(total, true)}`,
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
      
      // Store WhatsApp data for iOS-compatible redirect
      localStorage.setItem('pending_whatsapp', JSON.stringify({
        phoneNumber,
        message,
        orderId: createdOrder.id
      }));
      
      // Navigate to success page first (maintains user context for iOS)
      window.location.href = `/cart/success?order_id=${createdOrder.id}&auto_whatsapp=true`;
    } catch (error) {
      toast.error("Error al crear el pedido. Por favor intente nuevamente." + error);
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
                        {method.id === "delivery_maracay"
                          ? "Por definir"
                          : method.price > 0
                          ? `REF${method.price.toLocaleString("es-VE")}`
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
                <p className="font-medium text-sm">
                  {getPriceDisplay(item.price * item.quantity, true)}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="text-xs">{getPriceDisplay(subtotal, true)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span className="text-xs">
                {shippingMethod === "delivery_maracay"
                  ? "Por definir"
                  : shipping > 0
                  ? getPriceDisplay(shipping, true)
                  : "A calcular según zona"}
              </span>
            </div>
            {getDiscountInfo(subtotal)?.hasDiscount && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>✨ Descuento aplicado</span>
                <span className="text-xs">{getDiscountInfo(subtotal)?.discountPercentage}%</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span className="text-sm">{getPriceDisplay(total, true)}</span>
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
