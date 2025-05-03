import { getCategoryBySlug, getSubcategoriesByCategory } from '@/lib/data/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.slug);
  
  if (!category) {
    notFound();
  }

  const subcategories = await getSubcategoriesByCategory(category.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
      {category.description && (
        <p className="text-muted-foreground mb-8">{category.description}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.map((subcategory) => (
          <Link key={subcategory.id} href={`/categories/${category.slug}/${subcategory.slug}`}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{subcategory.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {subcategory.image_url && (
                  <div className="relative h-48 mb-4">
                    <Image
                      src={subcategory.image_url}
                      alt={subcategory.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                {subcategory.description && (
                  <p className="text-muted-foreground">{subcategory.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}