'use client'
import { Product, ProductDetailImage, ProductVariant } from "@/lib/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface ProductCardProps {
  product: Product & {
    product_images?: ProductDetailImage[];
    variants?: ProductVariant[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get the display image based on hover state
  const displayImage = isHovered && product.product_images?.[0]
    ? product.product_images[0].image_url
    : product.main_image_url || "/placeholder-product.jpg";

  // Calculate if product has stock
  const hasStock = product.variants?.some(variant => variant.stock > 0) ?? true;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
        <CardContent className="p-0">
          <div 
            className="relative aspect-square"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />

            {!hasStock && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs">
                  Agotado
                </Badge>
              </div>
            )}
          </div>
          
          <div className="p-3 sm:p-4">
            <h3 className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="font-semibold mt-1 sm:mt-2 text-base sm:text-lg text-primary">
              ${product.price.toLocaleString('es-VE')}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}