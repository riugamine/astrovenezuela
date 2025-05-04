'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

export function ProductInfo() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');

  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="space-y-6">
      {/* Título y precio */}
      <div>
        <h1 className="text-3xl font-bold">Matchpoint Sweater</h1>
        <p className="text-2xl font-semibold mt-2">$119.990,00</p>
      </div>

      {/* Selector de tallas */}
      <div className="space-y-2">
        <p className="font-medium">Talla</p>
        <div className="flex gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => setSelectedSize(size)}
              className="w-12 h-12"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Selector de cantidad */}
      <div className="space-y-2">
        <p className="font-medium">Cantidad</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <FontAwesomeIcon icon={faMinus} />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-20 text-center"
            min={1}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </div>

      {/* Botón de agregar al carrito */}
      <Button className="w-full py-6 text-lg">
        Añadir al carrito
      </Button>

      {/* Descripción del producto */}
      <div className="space-y-4 pt-6 border-t">
        <h2 className="font-semibold text-lg">Descripción</h2>
        <p className="text-muted-foreground">
          Camiseta diseño exclusivo y calidad premium. Confeccionado en tela suave y duradera, 
          ideal para el uso intenso y versátil para cualquier ocasión.
        </p>
      </div>
    </div>
  );
}