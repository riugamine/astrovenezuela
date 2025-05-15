'use client'

import { Database } from "@/lib/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, memo } from "react";
import { cn } from "@/lib/utils";

type Tables = Database['public']['Tables'];
type ProductRow = Tables['products']['Row'];
type ProductImageRow = Tables['product_detail_images']['Row'];
type ProductVariantRow = Tables['product_variants']['Row'];

type ProductWithDetails = ProductRow & {
  product_images?: ProductImageRow[];
  variants?: ProductVariantRow[];
};

interface ProductCardProps {
  product: ProductWithDetails;
}

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayImage = isHovered && product.product_images?.[0]
    ? product.product_images[0].image_url
    : product.main_image_url;

  const availableSizes = product.variants
    ?.filter(variant => variant.stock > 0)
    .map(variant => variant.size) ?? [];

  const hasStock = availableSizes.length > 0;

  if (!hasStock) {
    return (
      <div className="opacity-70 cursor-not-allowed">
        <ProductCardContent
          product={product}
          displayImage={displayImage}
          availableSizes={availableSizes}
          hasStock={hasStock}
          onHover={setIsHovered}
        />
      </div>
    );
  }

  return (
    <Link 
      href={`/products/${product.slug}`}
      className="block group transition-opacity duration-200 hover:opacity-95"
    >
      <ProductCardContent
        product={product}
        displayImage={displayImage}
        availableSizes={availableSizes}
        hasStock={hasStock}
        onHover={setIsHovered}
      />
    </Link>
  );
});

interface ProductCardContentProps {
  product: ProductWithDetails;
  displayImage: string;
  availableSizes: string[];
  hasStock: boolean;
  onHover: (isHovered: boolean) => void;
}

const ProductCardContent = memo(function ProductCardContent({
  product,
  displayImage,
  availableSizes,
  hasStock,
  onHover
}: ProductCardContentProps) {
  return (
    <Card className="overflow-hidden border-none h-full transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-0">
        <div 
          className="relative aspect-square bg-muted"
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
        >
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-500',
              hasStock && 'group-hover:scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
          />

          {!hasStock && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs font-medium">
                Agotado
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-3 space-y-2">
          <h3 className={cn(
            'font-medium line-clamp-2 text-sm sm:text-base transition-colors',
            hasStock && 'group-hover:text-primary'
          )}>
            {product.name}
          </h3>
          <p className="font-semibold text-primary text-base sm:text-lg">
            ${product.price.toLocaleString('es-VE')}
          </p>
          {hasStock && availableSizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
  );
});

export { ProductCard };