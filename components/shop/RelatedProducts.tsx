'use client';

import { Product, ProductDetailImage, ExchangeRate } from "@/lib/types/database.types";
import { ProductCard } from "./ProductCard";

interface RelatedProductsProps {
  products: (Product & {
    product_images: ProductDetailImage[];
  })[];
  exchangeRate?: ExchangeRate | null;
}

export function RelatedProducts({ products, exchangeRate }: RelatedProductsProps) {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6 text-primary dark:text-accent">Quizás te interese</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} exchangeRate={exchangeRate} />
        ))}
      </div>
    </div>
  );
}