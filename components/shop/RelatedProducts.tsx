'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Product, ProductDetailImage } from "@/lib/types/database.types";
import Image from "next/image";
import Link from "next/link";

interface RelatedProductsProps {
  products: (Product & {
    product_images: ProductDetailImage[];
  })[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Quizás te interese</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="font-semibold mt-1">
                    ${product.price.toLocaleString('en-US')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}