import ShopLayout from '@/components/layout/shop/ShopLayout';
import { Button } from '@/components/ui/button';
import { products } from "@/lib/data/products";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const latestProducts = products
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 4);
  return (
    <ShopLayout>
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Astro Venezuela</h1>
            <p className="text-xl mb-8">Tu destino para la mejor ropa street en Venezuela</p>
            <Button size="lg" variant="secondary">
              Ver Productos
            </Button>
          </div>
        </div>
      </section>

      {/* Marcas Autorizadas */}
      <section className="py-16 bg-accent/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Marcas Autorizadas</h2>
          <div className="flex items-center justify-center space-x-12">
            {/* Aquí irían los logos de las marcas autorizadas */}
            <div className="grayscale hover:grayscale-0 transition-all">
              <img src="/marca1.png" alt="Marca 1" className="h-16" />
            </div>
            {/* Repetir para cada marca */}
          </div>
        </div>
      </section>

            {/* Sección de productos recientes */}
            <section className="py-16 bg-white/50 dark:bg-[#001730]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Últimos Productos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative aspect-square">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-2xl font-bold mt-2">
                        ${product.price.toLocaleString('es-VE')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products">
              <Button variant="outline" size="lg">
                Ver todos los productos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
