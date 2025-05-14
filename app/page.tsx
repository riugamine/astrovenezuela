import ShopLayout from "@/components/layout/shop/ShopLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase/client";
import { Meteors } from "@/components/magicui/meteors";
import { HyperText } from "@/components/magicui/hyper-text";
import { Category, Product, ProductDetailImage } from "@/lib/types/database.types";
import { Marquee } from "@/components/magicui/marquee";
import { ProductCard } from "@/components/shop/ProductCard";

type ProductWithImages = Product & {
  product_images: ProductDetailImage[];
};
// Component for category cards
const CategoryCard = ({
  title,
  image,
  href,
}: {
  title: string;
  image: string;
  href: string;
}) => (
  <Link href={href} className="group relative overflow-hidden rounded-lg mx-4">
    <div className="relative aspect-[4/5] w-72 overflow-hidden">
      <Image
        src={image || "https://placehold.co/600x400.jpg?text=Categoría"}
        alt={title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
      <div className="absolute bottom-0 w-full p-6">
        <h3 className="font-exo text-2xl font-bold text-white">{title}</h3>
      </div>
    </div>
  </Link>
);

// Fetch data server-side
async function getData() {
  const { data: categoriesData, error: categoriesError } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .limit(20);

  const { data: productsData, error: productsError } = await supabaseClient
    .from("products")
    .select(`
      *,
      product_images (id, product_id, image_url, order_index)
    `)
    .order("created_at", { ascending: false })
    .limit(4);

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
  }

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  return {
    categories: (categoriesData || []) as Category[],
    latestProducts: (productsData || []) as ProductWithImages[],
  };
}

export default async function Home() {
  const { categories, latestProducts } = await getData();

  return (
    <ShopLayout>
      {/* Hero Section - Minimalista y Enfocado */}
      <section className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          {/* <Image
            src="/hero-image.jpg"
            alt="Hero"
            fill
            className="object-cover"
            priority
          /> */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
          <Meteors className="opacity-70" />
        </div>
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="font-exo text-5xl font-bold mb-6">
              <HyperText>Supera tus límites</HyperText>
            </h1>
            <p className="font-gabarito text-xl mb-8">
              Equipamiento deportivo de alta calidad para atletas que buscan la
              excelencia
            </p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="group">
                Explorar Colección
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-3xl font-bold text-center mb-12">
            Categorías
          </h2>
          <Marquee className="py-4" pauseOnHover>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.name}
                image={category.banner_url}
                href={`/categories/${category.slug}`}
              />
            ))}
          </Marquee>
        </div>
      </section>

      {/* Últimos Productos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-3xl font-bold text-center mb-12">
            Nuevos Ingresos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg" className="group">
                Ver Catálogo Completo
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
