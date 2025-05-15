import { Category } from '@/lib/types/database.types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import { ProductGrid } from '@/components/shop/ProductGrid';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function getCategoryWithProducts(slug: string) {
  const { data: category, error: categoryError } = await supabaseClient
    .from('categories')
    .select(`
      *,
      subcategories:categories!parent_id(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (categoryError || !category) return null;

  const categoryIds = [category.id, ...(category.subcategories?.map((sub: Category) => sub.id) || [])];
  
  const { data: products, error: productsError } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, product_id, image_url, order_index)
    `)
    .in('category_id', categoryIds)
    .eq('is_active', true);

  if (productsError) return null;

  return {
    category,
    products: products || []
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const data = await getCategoryWithProducts(resolvedParams.slug);
  
  if (!data) {
    notFound();
  }

  const { category, products } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner de categoría */}
      <div className="relative h-64 w-full mb-8 rounded-lg overflow-hidden bg-gray-200">
        {category.banner_url && (
          <Image
            src={category.banner_url}
            alt={category.name}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className={`absolute inset-0 ${category.banner_url ? 'bg-black/50' : ''} flex items-center justify-center`}>
          <h1 className="text-4xl font-bold text-white">{category.name}</h1>
        </div>
      </div>

      {/* Descripción de la categoría */}
      <p className="text-muted-foreground text-center mb-8">
        {category.description}
      </p>

      {/* Subcategorías si existen */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Subcategorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.subcategories.map((subcat: Category) => (
              <Link 
                key={subcat.id} 
                href={`/categories/${subcat.slug}`}
                className="p-4 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <h3 className="font-semibold">{subcat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Grid de productos */}
      <ProductGrid products={products} />
    </div>
  );
}