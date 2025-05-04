import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export function RelatedProducts() {
  // Datos de ejemplo - luego vendrán de la base de datos
  const relatedProducts = [
    {
      id: '1',
      name: 'Matchpoint Sweater Mujer',
      price: 119990,
      image: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/product-1.jpg',
      slug: 'matchpoint-sweater-mujer'
    },
    // ... más productos
  ];

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Quizás te interese</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Link key={product.id} href={`/shop/products/${product.slug}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="font-semibold mt-1">
                    ${product.price.toLocaleString('es-CL')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}