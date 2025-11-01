import ShopLayout from "@/components/layout/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Meteors } from "@/components/magicui/meteors";
import { HyperText } from "@/components/magicui/hyper-text";
import { CategoriesCarousel } from "@/components/shop/CategoriesCarousel";
import { getSubcategories } from "@/lib/data/categories";
import { Category } from "@/lib/types/database.types";
import Image from 'next/image';

export default async function Home() {
  // Only fetch subcategories for the carousel
  let subcategories: Category[] = [];
  
  try {
    subcategories = await getSubcategories().catch((err) => {
      console.error("Error fetching subcategories:", err);
      return [];
    });
  } catch (error) {
    console.error("Unexpected error in Home page:", error);
    subcategories = [];
  }

  return (
    <ShopLayout>
      {/* Hero Section */}
      <section className="relative h-[60vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/public/brand-assets/brand-images/hero-image%20(1).jpg"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-purple-950/50 to-black/50" />
          <Meteors className="opacity-40" />
        </div>

        <div className="container relative mx-auto px-4 py-12 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <span className="inline-block text-accent text-base md:text-lg font-medium tracking-wider uppercase bg-primary/50 px-4 py-2 rounded-full">
                Nueva Colección
              </span>
              
              <h1 className="font-exo text-4xl font-bold text-white leading-tight md:hidden">
                Brilla como una estrella
              </h1>
              <h1 className="hidden md:block font-exo text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                <HyperText>Brilla como una estrella</HyperText>
              </h1>

              <p className="text-gray-300 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto">
                Equipamiento deportivo de alta calidad para atletas que buscan
                la excelencia
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-foreground hover:text-primary transition-all group text-base"
              >
                <Link href="/products" className="inline-flex items-center">
                  Explorar Colección
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories Section */}
      <section className="py-4 sm:py-6 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <CategoriesCarousel categories={subcategories} />
        </div>
      </section>

    </ShopLayout>
  );
}