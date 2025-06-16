import ShopLayout from "@/components/layout/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
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
              
              <h1 className="font-exo text-4xl font-bold text-white leading-tight md:hidden">
                Brilla como una estrella
              </h1>
              <h1 className="hidden md:block font-exo text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-tight">
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
                className="border-white/20 hover:bg-secondary transition-all text-base"
                asChild
              >
                <Link href="/categories" className="text-primary hover:text-white">Ver Categorías</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
     {/* Value Proposition Section */}
     <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-exo text-3xl sm:text-4xl font-bold mb-4">¿Por qué elegir Astro?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Nos dedicamos a proporcionar equipamiento deportivo de alta calidad que te ayude a alcanzar tu máximo potencial</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="space-y-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 transform transition-transform duration-300 hover:scale-110">
                  <FontAwesomeIcon
                    icon={faGem}
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="font-exo text-lg font-semibold text-center">
                  Calidad Premium
                </h3>
                <p className="text-muted-foreground text-center">
                  Materiales de alta resistencia seleccionados cuidadosamente para garantizar durabilidad y rendimiento
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="space-y-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 transform transition-transform duration-300 hover:scale-110">
                  <FontAwesomeIcon
                    icon={faPalette}
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="font-exo text-lg font-semibold text-center">
                  Diseños Exclusivos
                </h3>
                <p className="text-muted-foreground text-center">
                  Colecciones únicas diseñadas para destacar en cada entrenamiento y competencia
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="space-y-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 transform transition-transform duration-300 hover:scale-110">
                  <FontAwesomeIcon
                    icon={faHandHoldingHeart}
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="font-exo text-lg font-semibold text-center">
                  Impacto Social
                </h3>
                <p className="text-muted-foreground text-center">
                  Comprometidos con el desarrollo de la industria textil local y el bienestar de nuestras comunidades
                </p>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
              <div className="space-y-4">
                <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 transform transition-transform duration-300 hover:scale-110">
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    className="text-primary text-2xl"
                  />
                </div>
                <h3 className="font-exo text-lg font-semibold text-center">
                  Garantía Asegurada
                </h3>
                <p className="text-muted-foreground text-center">
                  30 días de garantía con política de devolución sin complicaciones
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-exo text-3xl sm:text-4xl font-bold mb-4">Explora Nuestras Categorías</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Encuentra el equipamiento perfecto para cada disciplina deportiva</p>
          </div>
          <CategoriesCarousel categories={categories} />
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-exo text-3xl sm:text-4xl font-bold mb-4">Nuevos Ingresos</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Descubre las últimas incorporaciones a nuestra colección</p>
          </div>
          <ProductGrid />
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
