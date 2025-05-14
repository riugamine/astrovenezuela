'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";
import { Product, ProductDetailImage } from "@/lib/types/database.types";

interface ProductInfoProps {
  product: Product & {
    product_images: ProductDetailImage[];
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Por favor selecciona una talla');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      image_url: product.main_image_url
    });

    toast.success('Producto agregado al carrito');
  };

  const sizes = ['S', 'M', 'L', 'XL'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-semibold mt-2">
          ${product.price.toLocaleString('en-US')}
        </p>
      </div>

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

      <Button className="w-full py-6 text-lg" onClick={handleAddToCart}>
        Añadir al carrito
      </Button>

      <div className="space-y-4 pt-6 border-t">
        <h2 className="font-semibold text-lg">Descripción</h2>
        <p className="text-muted-foreground">
          {product.description}
        </p>
      </div>
    </div>
  );
}