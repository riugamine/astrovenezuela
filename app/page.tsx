import ShopLayout from '@/components/layout/shop/ShopLayout';
import { Button } from '@/components/ui/button';
import { products } from "@/lib/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Image from "next/image";
import Link from "next/link";

// Componente para las categorías principales
const CategoryCard = ({ title, image, href }: { title: string; image: string; href: string }) => (
  <Link href={href} className="group relative overflow-hidden rounded-lg">
    <div className="relative aspect-[4/5] w-full overflow-hidden">
      <Image
        src={image}
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

export default function Home() {
  // Obtener los últimos 4 productos
  const latestProducts = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <ShopLayout>
      {/* Hero Section - Minimalista y Enfocado */}
      <section className="relative h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-image.jpg"
            alt="Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
        </div>
        <div className="container relative mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="font-exo text-5xl font-bold mb-6">Supera tus límites</h1>
            <p className="font-gabarito text-xl mb-8">Equipamiento deportivo de alta calidad para atletas que buscan la excelencia</p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="group">
                Explorar Colección
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías Principales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-3xl font-bold text-center mb-12">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Hombre"
              image="/categories/men.jpg"
              href="/categories/hombre"
            />
            <CategoryCard
              title="Mujer"
              image="/categories/women.jpg"
              href="/categories/mujer"
            />
            <CategoryCard
              title="Accesorios"
              image="/categories/accessories.jpg"
              href="/categories/accesorios"
            />
            <CategoryCard
              title="Implementos"
              image="/categories/equipment.jpg"
              href="/categories/implementos"
            />
          </div>
        </div>
      </section>

      {/* Sección de Conjuntos Destacados */}
      <section className="py-16 bg-secondary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-3xl font-bold text-center mb-12">Conjuntos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden group">
              <Image
                src="/sets/set-1.jpg"
                alt="Conjunto Training"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 w-full p-6">
                <h3 className="font-exo text-2xl font-bold text-white mb-2">Training Set</h3>
                <Link href="/products/training-set">
                  <Button variant="secondary" className="group">
                    Ver Detalles
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden group">
              <Image
                src="/sets/set-2.jpg"
                alt="Conjunto Performance"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 w-full p-6">
                <h3 className="font-exo text-2xl font-bold text-white mb-2">Performance Set</h3>
                <Link href="/products/performance-set">
                  <Button variant="secondary" className="group">
                    Ver Detalles
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Últimos Productos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-exo text-3xl font-bold text-center mb-12">Nuevos Ingresos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group"
              >
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={product.main_image_url || 'https://placehold.co/600x400?text=Producto'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-exo text-lg font-medium">{product.name}</h3>
                      <p className="font-gabarito text-2xl font-bold mt-2 text-primary">
                        ${product.price.toLocaleString('es-VE')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" size="lg" className="group">
                Ver Catálogo Completo
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
