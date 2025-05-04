import { categories } from '@/lib/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Categorías</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="hover:shadow-lg transition-shadow overflow-hidden">
              {category.banner_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={category.banner_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}