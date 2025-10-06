"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Product, ProductDetailImage } from "@/lib/types/database.types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ProductGalleryProps {
  product: Product & {
    product_images: ProductDetailImage[];
  };
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  // Handle touch events for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Imagen Principal - relación 9:16 tipo historias, imagen completa */}
      <div className="relative flex-1 order-1 md:order-2">
        <AspectRatio 
          ratio={9/12} 
          className="bg-muted/10 rounded-lg overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[selectedImage].url}
            alt={images[selectedImage].alt}
            fill
            className="object-contain rounded-lg select-none bg-background"
            priority
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 60vw, 50vw"
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </AspectRatio>
        
        {/* Indicadores de swipe para móvil */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 md:hidden">
            {images.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  selectedImage === index 
                    ? "bg-primary scale-125" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas - mantener 9:16 y mostrar imagen completa */}
      <div className="order-2 md:order-1 md:w-24">
        <ScrollArea className="h-24 md:h-[500px] w-full">
          <div className="flex md:flex-col gap-2 p-1">
            {images.map((image, index) => (
              <button
                key={`thumb-${index}`}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative flex-shrink-0 w-16 h-28 rounded-md overflow-hidden",
                  "border-2 transition-all duration-200 ease-in-out",
                  "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary",
                  selectedImage === index 
                    ? "border-primary shadow-md" 
                    : "border-transparent hover:border-muted"
                )}
                aria-label={`Ver ${image.alt}`}
              >
                <AspectRatio ratio={9/16} className="bg-muted/10">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className={cn(
                      "object-contain transition-transform duration-300 bg-background",
                      "group-hover:scale-105",
                      selectedImage === index && "scale-105"
                    )}
                    sizes="64px"
                    quality={100}
                    loading={index === 0 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </AspectRatio>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="md:hidden" />
          <ScrollBar orientation="vertical" className="hidden md:block" />
        </ScrollArea>
      </div>
    </div>
  );
}
