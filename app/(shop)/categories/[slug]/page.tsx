import { Category, Product } from '@/lib/types/database.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function getCategoryWithProducts(slug: string) {
  // Obtener la categoría
  const { data: category, error: categoryError } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (categoryError || !category) return null;

  // Obtener los productos de la categoría
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_active', true);

  if (productsError) return null;

  return {
    category,
    products: products || []
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const data = await getCategoryWithProducts(params.slug);
  
  if (!data) {
    notFound();
  }

  const { category, products } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner de categoría */}
      <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden">
        <Image
          src={category.banner_url || ''}
          alt={category.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">{category.name}</h1>
        </div>
      </div>

      {/* Descripción de la categoría */}
      <p className="text-muted-foreground text-center mb-8">
        {category.description}
      </p>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <Card className="hover:shadow-lg transition-shadow h-full">
              <div className="relative h-48 w-full">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <p className="text-lg font-bold mt-4">
                  ${product.price.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}