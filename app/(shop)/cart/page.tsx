"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/useCartStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, orderNotes, setOrderNotes } = useCartStore();

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Tu carrito está vacío</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.variant_id}
                className="flex gap-4 p-4 border rounded-lg"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-24 h-24 transition-opacity hover:opacity-80"
                >
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Talla: {item.size}</p>
                  <p className="font-semibold mt-1">${item.price.toLocaleString('es-VE')}</p>
                </div>
                <div className="flex items-center gap-2">
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

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Resumen del pedido</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-muted-foreground">Costos según zona</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Estimado</span>
                  <span>${total.toLocaleString("es-VE")}</span>
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

              <Button className="w-full" asChild>
                <Link href="/cart/checkout">Proceder al pago</Link>
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
