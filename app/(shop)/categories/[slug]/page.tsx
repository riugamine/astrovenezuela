import { Suspense } from 'react';
import { Category } from '@/lib/types/database.types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabaseClient } from '@/lib/supabase/client';
import { InfiniteProductsGrid } from '@/components/shop/InfiniteProductsGrid';
import { ProductGridSkeleton } from '@/components/shop/InfiniteProductsGrid';
const PRODUCTS_PER_PAGE = 12;

async function getCategoryWithInitialProducts(slug: string) {
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
      product_images (id, product_id, image_url, order_index),
      variants:product_variants(id, size, stock)
    `)
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .range(0, PRODUCTS_PER_PAGE - 1);

  if (productsError) return null;

  return {
    category,
    products: products || []
  };
}

async function fetchCategoryProducts(categoryId: string, page: number) {
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  const end = start + PRODUCTS_PER_PAGE - 1;

  const { data: products, error, count } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      variants:product_variants(id, size, stock)
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .range(start, end);

  if (error) throw error;

  return {
    products: products || [],
    hasMore: count ? count > (page * PRODUCTS_PER_PAGE) : false
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await getCategoryWithInitialProducts(params.slug);
  
  if (!data) {
    notFound();
  }

  const { category, products } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-[30vh] md:h-[40vh] w-full mb-8 rounded-lg overflow-hidden bg-gradient-to-r from-primary/5 to-primary/10">
        {category.banner_url && (
          <Image
            src={category.banner_url}
            alt={category.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center px-4">
            {category.name}
          </h1>
        </div>
      </div>

      {category.description && (
        <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto px-4">
          {category.description}
        </p>
      )}

      {category.subcategories?.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 px-4">Subcategorías</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
            {category.subcategories.map((subcat: Category) => (
              <Link 
                key={subcat.id} 
                href={`/categories/${subcat.slug}`}
                className="group p-4 bg-card rounded-lg hover:shadow-md transition-all duration-300"
              >
                <div className="relative h-32 mb-4 overflow-hidden rounded-md bg-muted">
                  {subcat.banner_url && (
                    <Image
                      src={subcat.banner_url}
                      alt={subcat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {subcat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Suspense fallback={<ProductGridSkeleton />}>
        <InfiniteProductsGrid
          queryKey={['products', category.id]}
          fetchProducts={(page) => fetchCategoryProducts(category.id, page)}
          initialProducts={products}
        />
      </Suspense>
    </div>
  );
}