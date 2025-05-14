'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Product, ProductDetailImage } from "@/lib/types/database.types";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  initialProducts: (Product & {
    product_images: ProductDetailImage[];
  })[];
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialProducts.map((product) => (
        <Card key={product.id} className="group relative">
          <CardContent className="p-0">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={product.main_image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                <Button variant="secondary" size="sm">
                  <FontAwesomeIcon icon={faEye} className="mr-2" />
                  Vista rápida
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <Link href={`/products/${product.slug.toLowerCase().replace(/ /g, '-')}`}  className="block">
                <h3 className="font-medium hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <p className="font-semibold mt-2">
                  ${product.price.toLocaleString('en-US')}
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}