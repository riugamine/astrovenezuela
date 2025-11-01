"use client";

import { useState, useRef, MouseEvent } from "react";
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
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [lastTap, setLastTap] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const initialDistance = useRef<number>(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLDivElement>(null);

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

  // Handle mouse move for zoom effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Calculate distance between two touch points for pinch zoom
  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle double tap to zoom on mobile
  const handleDoubleTap = (e: React.TouchEvent) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      e.preventDefault();
      if (scale === 1) {
        // Zoom in
        setScale(2);
        setIsZoomed(true);
        
        // Calculate zoom position based on tap location
        if (mobileImageRef.current) {
          const rect = mobileImageRef.current.getBoundingClientRect();
          const x = ((e.touches[0]?.clientX || e.changedTouches[0].clientX) - rect.left) / rect.width * 100;
          const y = ((e.touches[0]?.clientY || e.changedTouches[0].clientY) - rect.top) / rect.height * 100;
          setMousePosition({ x, y });
        }
      } else {
        // Zoom out
        setScale(1);
        setIsZoomed(false);
      }
    }
    setLastTap(currentTime);
  };

  // Handle touch events for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale === 1) {
      // Single touch - prepare for swipe
      touchStartX.current = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
      // Two fingers - prepare for pinch zoom
      e.preventDefault();
      initialDistance.current = getDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale === 1) {
      // Single touch - swipe to change image
      touchEndX.current = e.touches[0].clientX;
    } else if (e.touches.length === 2) {
      // Two fingers - pinch to zoom
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      
      if (initialDistance.current > 0) {
        const scaleChange = currentDistance / initialDistance.current;
        const newScale = Math.min(Math.max(1, scaleChange), 3); // Min 1x, Max 3x
        setScale(newScale);
        setIsZoomed(newScale > 1);
        
        // Update zoom position
        if (mobileImageRef.current) {
          const rect = mobileImageRef.current.getBoundingClientRect();
          const x = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
          const y = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;
          setMousePosition({ x, y });
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0 && scale === 1) {
      // Single touch ended - check for swipe
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
      
      touchStartX.current = 0;
      touchEndX.current = 0;
    } else if (e.touches.length < 2) {
      // Pinch zoom ended
      initialDistance.current = 0;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Imagen Principal - relación 9:16 tipo historias, imagen completa */}
      <div className="relative flex-1 order-1 md:order-2">
        {/* Desktop: Image with zoom on hover */}
        <div className="hidden md:block">
          <AspectRatio 
            ratio={9/12} 
            className="bg-muted/10 rounded-lg overflow-hidden cursor-zoom-in"
          >
            <div
              ref={imageContainerRef}
              className="relative w-full h-full"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].alt}
                fill
                className={cn(
                  "object-contain rounded-lg select-none bg-background transition-transform duration-200 ease-out",
                  isZoomed && "scale-150"
                )}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }
                    : undefined
                }
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </AspectRatio>
        </div>
        
        {/* Mobile: Image with pinch zoom and double tap */}
        <div className="block md:hidden">
          <AspectRatio 
            ratio={9/12} 
            className={cn(
              "bg-muted/10 rounded-lg overflow-hidden touch-none",
              scale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => {
              handleTouchEnd(e);
              handleDoubleTap(e);
            }}
          >
            <div
              ref={mobileImageRef}
              className="relative w-full h-full"
            >
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].alt}
                fill
                className={cn(
                  "object-contain rounded-lg select-none bg-background transition-transform duration-200 ease-out",
                )}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }}
                priority
                quality={100}
                sizes="100vw"
                loading="eager"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg7/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          </AspectRatio>
          
          {/* Hint text for mobile zoom */}
          {!isZoomed && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Toca dos veces o pellizca para hacer zoom
            </p>
          )}
        </div>
        
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
