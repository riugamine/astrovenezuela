import ShopLayout from "@/components/layout/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { Meteors } from "@/components/magicui/meteors";
import { HyperText } from "@/components/magicui/hyper-text";
import { CategoriesCarousel } from "@/components/shop/CategoriesCarousel";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getSubcategories } from "@/lib/data/categories";
import { Category, ExchangeRate } from "@/lib/types/database.types";
import { getActiveExchangeRateServer } from "@/lib/data/exchange-rates-server";
import Image from 'next/image';

export default async function Home() {
  // Safely fetch subcategories and exchange rate with error handling
  let subcategories: Category[] = [];
  let exchangeRate: ExchangeRate | null = null;
  
  try {
    const [subcategoriesData, exchangeRateData] = await Promise.all([
      getSubcategories(),
      getActiveExchangeRateServer()
    ]);
    subcategories = subcategoriesData;
    exchangeRate = exchangeRateData;
  } catch (error) {
    console.error("Error fetching data for home page:", error);
    // Continue with empty arrays - page will still load
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
      {/* La Moon Base Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Store Image */}
            <div className="order-2 lg:order-1">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/object/public/brand-assets/brand-images/moon_base.webp"
                  alt="La Moon Base - Tienda física"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Store Information */}
            <div className="order-1 lg:order-2 space-y-4">
              <div className="space-y-3">
                <h2 className="font-exo text-3xl sm:text-4xl font-bold text-primary dark:text-accent">
                  La Moon Base
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Nuestra primera base lunar está en el C.C. Maracay Plaza. La Moon Base es el inicio de un viaje donde moda y deporte se encuentran con los cuerpos celestes.
                </p>
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">📍 Ubicación:</p>
                  <p className="text-muted-foreground">C.C. Maracay Plaza, Maracay, Venezuela</p>
                </div>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary-foreground hover:text-primary transition-all group"
              >
                <Link 
                  href="https://www.google.com/maps/place/C.C+Maracay+Plaza/@10.233201,-67.5970872,17z/data=!3m1!4b1!4m6!3m5!1s0x8e803c95fa2e49e9:0x8f57164a8bed4790!8m2!3d10.233201!4d-67.5970872!16s%2Fg%2F1hdz0rmnf?entry=ttu&g_ep=EgoyMDI1MDkyOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  Visítanos
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
      {/* Moon Drops Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-exo text-3xl sm:text-4xl font-bold mb-4">Moon Drops</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Descubre las últimas incorporaciones a nuestra colección</p>
          </div>
          
          {/* Use ProductGrid instead of ProductsWrapper for server-side rendering */}
          <ProductGrid exchangeRate={exchangeRate} />
          
          <div className="text-center mt-12">
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="group hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Explorar Catálogo Completo
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-2"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </ShopLayout>
  );
}