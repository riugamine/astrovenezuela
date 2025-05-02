import ShopLayout from '@/components/layout/shop/ShopLayout';
import { Button } from '@/components/ui/button';

export default function Home() {
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
    </ShopLayout>
  );
}
