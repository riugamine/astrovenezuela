

import { Product, ProductDetailImage, ProductVariant } from "@/lib/types/database.types";
import { ProductCard } from "./ProductCard";
import { Badge } from "@/components/ui/badge";

interface ProductGridProps {
  initialProducts: (Product & {
    product_images: ProductDetailImage[];
    variants: ProductVariant[];
  })[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {initialProducts.map((product) => (
        <div key={product.id} className="group relative flex flex-col">
          <ProductCard product={product} />
          
          {/* Tallas disponibles */}
          {product.variants && product.variants.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.variants
                .filter(variant => variant.stock > 0)
                .map(variant => (
                  <Badge 
                    key={variant.id} 
                    variant="outline"
                    className="text-xs"
                  >
                    {variant.size}
                  </Badge>
                ))
              }
            </div>
          )}
        </div>
      ))}
    </div>
  );
}