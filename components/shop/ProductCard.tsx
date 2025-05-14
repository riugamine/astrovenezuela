'use client'
import { Product, ProductDetailImage } from "@/lib/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  product: Product & {
    product_images?: ProductDetailImage[];
  };
}

// ProductCard component for displaying product information with hover image effect
export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Get the display image based on hover state
  const displayImage = isHovered && product.product_images?.[0]
  ? product.product_images[0].image_url // Access the url property
  : product.main_image_url || "https://placehold.co/600x400.jpg?text=Producto";

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
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
            />
          </div>
          <div className="p-4">
            <h3 className="font-exo text-lg font-medium">
              {product.name}
            </h3>
            <p className="font-gabarito text-2xl font-bold mt-2 text-primary">
              ${product.price.toLocaleString("es-VE")}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}