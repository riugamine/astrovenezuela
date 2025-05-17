import ShopLayout from "@/components/layout/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ProductsShowcase } from "@/components/shop/ProductsShowcase";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase/client";
import { Meteors } from "@/components/magicui/meteors";
import { HyperText } from "@/components/magicui/hyper-text";
import { Category } from "@/lib/types/database.types";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { CategoriesCarousel } from "@/components/shop/CategoriesCarousel";
import {
  faGem,
  faPalette,
  faHandHoldingHeart,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui/card";
import Image from 'next/image';
// Fetch categories server-side
async function getCategories() {
  const { data: categoriesData, error: categoriesError } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .limit(20);

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return [];
  }

  return categoriesData as Category[];
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <ShopLayout>
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
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

        <div className="container relative mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-6">
              <span className="inline-block text-purple-400 text-base md:text-lg font-medium tracking-wider uppercase bg-purple-950/50 px-4 py-2 rounded-full">
                Nueva Colección
              </span>

              <h1 className="font-exo text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-tight">
                <HyperText>Brilla como una estrella</HyperText>
              </h1>

              <p className="text-gray-300 text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-3xl mx-auto">
                Equipamiento deportivo de alta calidad para atletas que buscan
                la excelencia
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 transition-all group text-base"
              >
                <Link href="/products" className="inline-flex items-center">
                  Explorar Colección
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/20 hover:bg-white/10 text-white transition-all text-base"
                asChild
              >
                <Link href="/categories">Ver Categorías</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  <FontAwesomeIcon
                    icon={faGem}
                    className="text-primary text-xl"
                  />
                </div>
                <h3 className="font-exo text-base font-semibold">
                  Calidad Premium
                </h3>
                <p className="text-muted-foreground text-sm">
                  Materiales de alta resistencia para un rendimiento óptimo
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  <FontAwesomeIcon
                    icon={faPalette}
                    className="text-primary text-xl"
                  />
                </div>
                <h3 className="font-exo text-base font-semibold">
                  Diseño Únicos
                </h3>
                <p className="text-muted-foreground text-sm">
                  Colecciones exclusivas enfocadas en deportistas de alto
                  rendimiento
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  <FontAwesomeIcon
                    icon={faHandHoldingHeart}
                    className="text-primary text-xl"
                  />
                </div>
                <h3 className="font-exo text-base font-semibold">
                  Responsabilidad Social
                </h3>
                <p className="text-muted-foreground text-sm">
                  La industria textil dedicada al hogar teniendo como meta
                  mejorar su calidad de vida
                </p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4 text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    className="text-primary text-xl"
                  />
                </div>
                <h3 className="font-exo text-base font-semibold">
                  Garantía Total
                </h3>
                <p className="text-muted-foreground text-sm">
                  30 días para cambios y devoluciones
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-900/30">
        <div className="container mx-auto px-4">
          <CategoriesCarousel categories={categories} />
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
            Nuevos Ingresos
          </h2>
          <ProductGrid />
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products">
              <Button
                variant="outline"
                size="lg"
                className="group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Ver Catálogo Completo
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
