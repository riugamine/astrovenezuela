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
    <div className="flex flex-col md:flex-row gap-4">
      {/* Imagen Principal */}
      <div className="relative flex-1 order-1 md:order-2">
        <AspectRatio ratio={1} className="bg-muted/10 rounded-lg overflow-hidden">
          <Image
            src={images[selectedImage].url}
            alt={images[selectedImage].alt}
            fill
            className="object-cover rounded-lg"
            priority
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw"
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </AspectRatio>
      </div>

      {/* Miniaturas */}
      <div className="order-2 md:order-1 md:w-24">
        <ScrollArea className="h-24 md:h-[500px] w-full">
          <div className="flex md:flex-col gap-2 p-1">
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden",
                  "border-2 transition-all duration-200 ease-in-out",
                  "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
                  selectedImage === index 
                    ? "border-primary shadow-md" 
                    : "border-transparent hover:border-muted"
                )}
                aria-label={`Ver ${image.alt}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300",
                    "group-hover:scale-105",
                    selectedImage === index && "scale-105"
                  )}
                  sizes="80px"
                  quality={100}
                  loading={index === 0 ? "eager" : "lazy"}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
