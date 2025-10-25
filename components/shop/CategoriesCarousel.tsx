'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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
    <div className="relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {categories.map((category) => (
            <CarouselItem key={category.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <Link href={`/categories/${category.slug}`}>
                <Card className="overflow-hidden group relative border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white dark:bg-gray-900">
                    <Image
                      src={category.banner_url || "https://placehold.co/600x400.jpg?text=Categoría"}
                      alt={category.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-110 p-4"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute bottom-0 w-full p-4">
                      <h3 className="font-exo text-sm md:text-base font-bold text-gray-900 dark:text-white group-hover:translate-y-[-2px] transition-transform bg-white/90 dark:bg-gray-900/90 px-3 py-1 rounded-md">
                        {category.name.toLocaleUpperCase()}
                      </h3>
                    </div>
                  </div>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 md:left-4" />
        <CarouselNext className="right-2 md:right-4" />
      </Carousel>
    </div>
  )
}