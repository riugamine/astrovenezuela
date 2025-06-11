"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { useCartStore } from "@/lib/store/useCartStore";
import { toast } from "sonner";
import {
  Product,
  ProductDetailImage,
  ProductVariant,
} from "@/lib/types/database.types";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  product: Product & {
    product_images: ProductDetailImage[];
    variants: ProductVariant[];
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const addItem = useCartStore((state) => state.addItem);

  // Get available sizes from variants
  const sizeVariants = product.variants?.reduce((acc, variant) => {
    acc[variant.size] = variant;
    return acc;
  }, {} as Record<string, ProductVariant>);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Por favor selecciona una talla");
      return;
    }

    const variant = sizeVariants[selectedSize];
    if (!variant || variant.stock < quantity) {
      toast.error("No hay suficiente stock disponible");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedSize,
      variant_id: variant.id,
      image_url: product.main_image_url,
      max_stock: variant.stock,
      slug: product.slug, // Añadimos el slug para la navegación
    });

    toast.success("Producto agregado al carrito");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-semibold mt-2">
          REF {product.price.toLocaleString("en-US")}
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Talla</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(sizeVariants).map(([size, variant]) => {
            const isOutOfStock = variant.stock === 0;
            return (
              <div key={size} className="relative">
                <Button
                  variant={selectedSize === size ? "default" : "outline"}
                  onClick={() => {
                    if (!isOutOfStock) {
                      setSelectedSize(size);
                      setQuantity(1);
                    }
                  }}
                  disabled={isOutOfStock}
                  className="w-12 h-12 relative"
                >
                  {size}
                </Button>
                {isOutOfStock && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 text-[10px] px-2"
                  >
                    Agotado
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Cantidad</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!selectedSize}
          >
            <FontAwesomeIcon icon={faMinus} />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (selectedSize && sizeVariants[selectedSize]) {
                const maxStock = sizeVariants[selectedSize].stock;
                setQuantity(Math.min(Math.max(1, value), maxStock));
              }
            }}
            className="w-20 text-center"
            min={1}
            max={selectedSize ? sizeVariants[selectedSize]?.stock : 1}
            disabled={!selectedSize}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (selectedSize && sizeVariants[selectedSize]) {
                const maxStock = sizeVariants[selectedSize].stock;
                setQuantity(Math.min(quantity + 1, maxStock));
              }
            }}
            disabled={
              !selectedSize || 
              quantity >= (sizeVariants[selectedSize]?.stock ?? 0)
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
        {selectedSize && (
          <p className="text-sm text-muted-foreground">
            Stock disponible: {sizeVariants[selectedSize]?.stock}
          </p>
        )}
      </div>

      <Button
        className="w-full py-6 text-lg"
        onClick={handleAddToCart}
        disabled={!selectedSize || quantity < 1}
      >
        Añadir al carrito
      </Button>

      <div className="space-y-4 pt-6 border-t">
        <h2 className="font-semibold text-lg">Descripción</h2>
        <p className="text-muted-foreground">{product.description}</p>
      </div>
    </div>
  );
}
