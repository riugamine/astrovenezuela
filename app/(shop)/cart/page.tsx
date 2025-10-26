"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/useCartStore";
// import { useAuthStore } from "@/lib/store/useAuthStore"; // Removed unused import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus, faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Meteors } from "@/components/magicui/meteors";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
// import { toast } from "sonner"; // Removed unused import
import { useRouter } from "next/navigation";
import { useActiveExchangeRateSafe } from "@/lib/store/useExchangeRateStore";
import { calculateDualPrices, formatDualPrice } from "@/lib/utils/currency-converter";
import { getActiveExchangeRate } from "@/lib/data/exchange-rates";

export default function CartPage() {
  const { items, removeItem, updateQuantity, orderNotes, setOrderNotes } = useCartStore();
  // const { user } = useAuthStore(); // Removed unused variable
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const activeRate = useActiveExchangeRateSafe();
  const [exchangeRate, setExchangeRate] = useState(activeRate);

  // Fetch exchange rate once on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const rate = await getActiveExchangeRate();
        setExchangeRate(rate);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };
    
    if (!exchangeRate) {
      fetchRate();
    }
  }, [exchangeRate]);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calculate dual prices for total if exchange rate is available
  const getTotalDisplay = () => {
    if (!exchangeRate) {
      return `REF ${total.toLocaleString("es-VE")}`;
    }
    
    try {
      const { usdPrice, vesPrice } = calculateDualPrices(total, exchangeRate);
      return formatDualPrice(usdPrice, vesPrice);
    } catch (error) {
      console.error('Error calculating dual prices:', error);
      return `REF ${total.toLocaleString("es-VE")}`;
    }
  };

  // Calculate dual prices for individual items
  const getItemPriceDisplay = (price: number) => {
    if (!exchangeRate) {
      return `$${price.toLocaleString('es-VE')}`;
    }
    
    try {
      const { usdPrice, vesPrice } = calculateDualPrices(price, exchangeRate);
      return formatDualPrice(usdPrice, vesPrice);
    } catch (error) {
      console.error('Error calculating dual prices:', error);
      return `$${price.toLocaleString('es-VE')}`;
    }
  };

  const handleCheckout = () => {
    setIsLoading(true);
    router.push("/cart/checkout");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      {items.length === 0 ? (
        // Empty cart state remains unchanged
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-black via-primary to-black">
          <div className="absolute inset-0">
            <Meteors className="opacity-40" />
          </div>
          <div className="relative z-10 text-center space-y-6 max-w-md mx-auto px-4">
            <div className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faShoppingCart} className="h-12 w-12 text-accent" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">Tu carrito está vacío</h2>
              <p className="text-gray-400">
                ¿No sabes por dónde empezar? Descubre nuestra colección de productos deportivos
              </p>
            </div>
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-accent text-primary hover:bg-primary-foreground hover:text-primary transition-all group text-base"
              >
                <Link href="/products" className="inline-flex items-center gap-2">
                  Explorar Productos
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="ml-2 group-hover:scale-110 transition-transform"
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <ScrollArea className="pr-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variant_id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative w-full sm:w-24 h-32 sm:h-24 transition-opacity hover:opacity-80"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-0">
                      <h3 className="font-medium text-base truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">Talla: {item.size}</p>
                      <p className="font-semibold text-sm">{getItemPriceDisplay(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2 self-center sm:self-auto">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(
                            item.variant_id,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faMinus} className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.variant_id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 text-center"
                        min={1}
                        max={item.max_stock}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQuantity(
                            item.variant_id,
                            Math.min(item.quantity + 1, item.max_stock)
                          )
                        }
                        disabled={item.quantity >= item.max_stock}
                      >
                        <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-destructive"
                        onClick={() => removeItem(item.variant_id)}
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1 sticky top-4">
            <div className="border rounded-lg p-6 space-y-4 bg-background">
              <h2 className="text-xl font-semibold">Resumen del pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-muted-foreground">Costos según zona</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Estimado</span>
                  <span className="text-sm">{getTotalDisplay()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNotes">Nota especial para el pedido</Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Instrucciones especiales para tu pedido"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground" />
                    Procesando...
                  </div>
                ) : (
                  'Proceder al pago'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Impuesto incluido. Envío calculado en la página de pago.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
