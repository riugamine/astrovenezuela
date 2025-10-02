'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Category } from "@/lib/types/database.types"
import Image from "next/image"
import Link from "next/link"

interface CategoriesCarouselProps {
  categories: Category[]
}

export function CategoriesCarousel({ categories }: CategoriesCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent className="-ml-1 md:-ml-2">
        {categories.map((category) => (
          <CarouselItem key={category.id} className="pl-1 md:pl-2 basis-1/2 md:basis-1/3 lg:basis-1/4">
            <Link href={`/categories/${category.slug}`}>
              <Card className="overflow-hidden group relative border-0">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={category.banner_url || "https://placehold.co/600x400.jpg?text=Categoría"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                  <div className="absolute bottom-0 w-full p-3">
                    <h3 className="font-exo text-sm md:text-base font-bold text-white group-hover:translate-y-[-2px] transition-transform">
                      {category.name.toLocaleUpperCase()}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}