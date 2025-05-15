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
import { ElementType } from "react";

interface ProductCardProps {
  product: Product & {
    product_images?: ProductDetailImage[];
    variants?: ProductVariant[];
  };
}

type CardWrapperProps = {
  children: React.ReactNode;
  className?: string;
} & ({
  href: string;
} | {
  href?: never;
});

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get the display image based on hover state
  const displayImage = isHovered && product.product_images?.[0]
    ? product.product_images[0].image_url
    : product.main_image_url || "/placeholder-product.jpg";

  // Calculate if product has stock
  const hasStock = product.variants?.some(variant => variant.stock > 0) ?? true;

  // Get available sizes
  const availableSizes = product.variants
    ?.filter(variant => variant.stock > 0)
    ?.map(variant => variant.size) || [];

  const CardWrapper = hasStock ? Link : 'div' as ElementType;
  const cardProps = hasStock ? { href: `/products/${product.slug}` } : {} as CardWrapperProps;

  return (
    <CardWrapper {...cardProps} className={`group block h-full ${!hasStock ? 'cursor-not-allowed opacity-70' : ''}`}>
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
              className={`object-cover transition-transform duration-300 ${hasStock ? 'group-hover:scale-105' : ''}`}
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
            <h3 className={`font-medium text-sm sm:text-base ${hasStock ? 'hover:text-primary' : ''} transition-colors line-clamp-2`}>
              {product.name}
            </h3>
            <p className="font-semibold mt-1 sm:mt-2 text-base sm:text-lg text-primary">
              ${product.price.toLocaleString('es-VE')}
            </p>

            {/* Available sizes */}
            {availableSizes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {availableSizes.map(size => (
                  <Badge 
                    key={size} 
                    variant="outline"
                    className="text-xs"
                  >
                    {size}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  );
}