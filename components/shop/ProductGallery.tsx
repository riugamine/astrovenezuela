'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductImage {
  url: string;
  alt: string;
}

export function ProductGallery() {
  // Datos de ejemplo - luego vendrán de la base de datos
  const images: ProductImage[] = [
    {
      url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/product-1.jpg',
      alt: 'Vista frontal'
    },
    {
      url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/product-2.jpg',
      alt: 'Vista trasera'
    },
    {
      url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/product-3.jpg',
      alt: 'Vista detalle'
    }
  ];

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex gap-4">
      {/* Thumbnails verticales */}
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
            />
          </button>
        ))}
      </div>

      {/* Imagen principal */}
      <div className="relative flex-1 aspect-square">
        <Image
          src={images[selectedImage].url}
          alt={images[selectedImage].alt}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>
    </div>
  );
}