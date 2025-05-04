"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/useCartStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import  Link  from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems } = useCartStore();
  const [instructions, setInstructions] = useState("");

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
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative w-24 h-24">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-muted-foreground">
                    {item.size && `Talla: ${item.size}`}
                  </p>
                  <p className="font-semibold">
                    ${item.price.toLocaleString("es-VE")}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                    >
                      <FontAwesomeIcon icon={faMinus} className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-20 text-center"
                      min={1}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                    </Button>
                  </div>
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
                  <span>Gratis</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Estimado</span>
                  <span>${total.toLocaleString("es-VE")}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Agregar nota de pedido</p>
                <Textarea
                  placeholder="Ordene instrucciones especiales"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>

              <Button className="w-full" asChild>
                <Link href="/cart/checkout">Proceder al pago</Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Impuesto incluido. Envío calculado la página de pago.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
