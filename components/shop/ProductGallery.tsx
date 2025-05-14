'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Product, ProductDetailImage } from '@/lib/types/database.types';

interface ProductGalleryProps {
  product: Product & {
    product_images: ProductDetailImage[];
  };
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    {
      url: product.main_image_url,
      alt: `${product.name} - Principal`
    },
    ...product.product_images.map(img => ({
      url: img.image_url,
      alt: `${product.name} - Detalle ${img.order_index}`
    }))
  ];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "relative w-20 h-20 border rounded-md overflow-hidden",
              selectedImage === index && "ring-2 ring-primary"
            )}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      <div className="relative flex-1 aspect-square">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt}
          fill
          className="object-cover rounded-lg"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}