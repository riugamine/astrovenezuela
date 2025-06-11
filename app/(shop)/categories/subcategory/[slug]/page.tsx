import { getCategories } from "@/lib/data/categories";
import { notFound } from 'next/navigation';
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { supabaseClient } from '@/lib/supabase/client';

const PRODUCTS_PER_PAGE = 12;

async function getSubcategoryWithInitialProducts(slug: string) {
  // Get subcategory details
  const { data: subcategory, error: subcategoryError } = await supabaseClient
    .from('categories')
    .select(`
      *,
      parent:categories!parent_id(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .not('parent_id', 'is', null)
    .single();

  if (subcategoryError || !subcategory) return null;

  // Get products for this subcategory
  const { data: products, error: productsError } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      variants:product_variants(id, size, stock, reference_number)
    `)
    .eq('category_id', subcategory.id)
    .eq('is_active', true)
    .range(0, PRODUCTS_PER_PAGE - 1);

  if (productsError) return null;

  return {
    subcategory,
    products: products || []
  };
}
type PageParams = {
  params: Promise<{
    slug: string;
  }>;
};
export default async function SubcategoryPage({ params }: PageParams) {
  const resolvedParams = await Promise.resolve(params);
  const data = await getSubcategoryWithInitialProducts(resolvedParams.slug);
  
  if (!data) {
    notFound();
  }

  const { subcategory, products } = data;
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-4">
        <div className="text-sm md:text-base text-muted-foreground">
          {subcategory.parent?.name} /
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          {subcategory.name}
        </h1>
        {subcategory.description && (
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            {subcategory.description}
          </p>
        )}
      </div>

      <ProductsWrapper 
        categories={categories} 
        initialProducts={products}
        queryKey={[`subcategory-${subcategory.id}-products`]}
      />
    </div>
  );
}