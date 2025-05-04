'use client';

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/useCartStore";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { useCustomerStore } from "@/lib/store/useCustomerStore";

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface CustomerInfo {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  dni: string; // Cédula de identidad
  agencyAddress?: string; // Dirección de la agencia
}

const shippingMethods: ShippingMethod[] = [
  {
    id: 'pickup',
    name: 'Retirar en tienda',
    description: 'Retira tu pedido en nuestra tienda en Maracay',
    price: 0
  },
  {
    id: 'delivery_maracay',
    name: 'Delivery en Maracay',
    description: 'Entrega a domicilio solo en Maracay',
    price: 5
  },
  {
    id: 'mrw',
    name: 'Envío MRW',
    description: 'Envío a toda Venezuela (Cobro en destino)',
    price: 0
  },
  {
    id: 'zoom',
    name: 'Envío Zoom',
    description: 'Envío a toda Venezuela (Cobro en destino)',
    price: 0
  }
];

const paymentMethods: PaymentMethod[] = [
  { id: 'pago_movil', name: 'Pago Móvil', description: 'Transferencia bancaria móvil' },
  { id: 'zelle', name: 'Zelle', description: 'Pago con Zelle' },
  { id: 'binance', name: 'Binance', description: 'Pago con criptomonedas' },
  { id: 'efectivo', name: 'Efectivo $', description: 'Pago en efectivo (USD)' },
  { id: 'paypal', name: 'PayPal', description: 'Pago con PayPal' }
];

export default function CheckoutPage() {
  const { items, totalItems } = useCartStore();
  const [shippingMethod, setShippingMethod] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const { customerInfo, setCustomerInfo } = useCustomerStore();

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = shippingMethods.find(m => m.id === shippingMethod)?.price || 0;
  const total = subtotal + shipping;

  const handleSubmit = () => {
    // Formatear el mensaje para WhatsApp
    const formattedItems = items.map(item => 
      `(${item.quantity}) ${item.name}\n` +
      `Talla: ${item.size}\n` +
      `Precio: $${item.price.toLocaleString('es-VE')}`
    ).join('\n\n');

    const selectedPayment = paymentMethods.find(m => m.id === paymentMethod)?.name;
    const selectedShipping = shippingMethods.find(m => m.id === shippingMethod)?.name;

    const message = `
🛍️ *NUEVO PEDIDO*

*Cliente:*
Nombre: ${customerInfo.name}
Teléfono: ${customerInfo.phone}
Email: ${customerInfo.email}
${customerInfo.address ? `Dirección: ${customerInfo.address}` : ''}

*Pedido:*
${formattedItems}

*Resumen:*
Subtotal: $${subtotal.toLocaleString('es-VE')}
Envío: $${shipping.toLocaleString('es-VE')}
Total: $${total.toLocaleString('es-VE')}

Método de envío: ${selectedShipping}
Método de pago: ${selectedPayment}
`;

    // Número de WhatsApp de la tienda (reemplazar con el número real)
    const phoneNumber = '584144881964';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
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
              onChange={(e) => setCustomerInfo({ email: e.target.value })}
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
                onChange={(e) => setCustomerInfo({ name: e.target.value })}
                required
              />
              <Input
                placeholder="Apellidos"
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({ lastName: e.target.value })}
                required
              />
            </div>
            <Input
              placeholder="Cédula de Identidad"
              value={customerInfo.dni}
              onChange={(e) => setCustomerInfo({ dni: e.target.value })}
              required
            />
            <Input
              placeholder="Número de celular"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ phone: e.target.value })}
              required
            />

            {/* Campo de dirección condicional */}
            {shippingMethod === 'delivery_maracay' && (
              <Input
                placeholder="Dirección de entrega"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ address: e.target.value })}
                required
              />
            )}

            {/* Campo de agencia condicional */}
            {(shippingMethod === 'mrw' || shippingMethod === 'zoom') && (
              <div className="space-y-2">
                <Label>Dirección de la agencia</Label>
                {/* <PlacesAutocomplete
                  value={customerInfo.agencyAddress}
                  onChange={(address) => handleAgencySelect(address)}
                  searchOptions={{
                    componentRestrictions: { country: 'VE' },
                    types: ['establishment']
                  }}
                  required
                /> */}
                <p className="text-sm text-muted-foreground">
                  Busca la agencia {shippingMethod === 'mrw' ? 'MRW' : 'Zoom'} más cercana
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Métodos de envío */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Métodos de envío</h2>
            <RadioGroup
              value={shippingMethod}
              onValueChange={setShippingMethod}
              className="space-y-2"
            >
              {shippingMethods.map((method) => (
                <Card key={method.id} className={`border ${shippingMethod === method.id ? 'border-primary' : 'border-gray-200'}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={`shipping-${method.id}`} />
                      <Label htmlFor={`shipping-${method.id}`}>
                        <span className="font-medium">{method.name}</span>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </Label>
                    </div>
                    <span className="font-medium">${method.price.toLocaleString('es-VE')}</span>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Métodos de pago */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Pago</h2>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-2"
            >
              {paymentMethods.map((method) => (
                <Card key={method.id} className={`border ${paymentMethod === method.id ? 'border-primary' : 'border-gray-200'}`}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                      <Label htmlFor={`payment-${method.id}`}>
                        <span className="font-medium">{method.name}</span>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-6">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Talla: {item.size}</p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toLocaleString('es-VE')}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-VE')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Envío</span>
              <span>${shipping.toLocaleString('es-VE')}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${total.toLocaleString('es-VE')}</span>
          </div>

          <Button 
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={!shippingMethod || !paymentMethod || !customerInfo.name || !customerInfo.phone}
          >
            <FontAwesomeIcon icon={faWhatsapp} className="mr-2" />
            Hacer pedido por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente para la búsqueda de lugares con Google Places
interface PlacesAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  searchOptions?: any;
  required?: boolean;
}

function PlacesAutocomplete({ value, onChange, searchOptions, required }: PlacesAutocompleteProps) {
  return (
    <Input
      type="text"
      placeholder="Buscar agencia..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      // Aquí se integraría la API de Google Places
      // Por ahora es un input normal
    />
  );
}