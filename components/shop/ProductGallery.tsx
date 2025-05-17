"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product, ProductDetailImage } from "@/lib/types/database.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
      alt: `${product.name} - Principal`,
    },
    ...product.product_images
      .sort((a, b) => a.order_index - b.order_index)
      .map((img) => ({
        url: img.image_url,
        alt: `${product.name} - Detalle ${img.order_index}`,
      })),
  ];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      <ScrollArea className="h-[400px] md:h-[500px] w-full md:w-24 p-1">
        <div className="flex md:flex-col gap-2">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setSelectedImage(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 border rounded-md overflow-hidden transition-all",
                "hover:ring-2 hover:ring-primary/50",
                selectedImage === index && "ring-2 ring-primary shadow-lg"
              )}
              aria-label={`Ver ${image.alt}`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="80px"
                quality={60}
              />
            </button>
          ))}
        </div>
      </ScrollArea>

      <div className="relative flex-1">
        <AspectRatio ratio={1}>
          <Image
            src={images[selectedImage].url}
            alt={images[selectedImage].alt}
            fill
            className="object-cover rounded-lg"
            priority
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw"
          />
        </AspectRatio>
      </div>
    </div>
  );
}
