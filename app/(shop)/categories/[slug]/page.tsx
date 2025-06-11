import { getCategories } from "@/lib/data/categories";
import { notFound } from 'next/navigation';
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { supabaseClient } from '@/lib/supabase/client';

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

  let categoryIds = [category.id];

  if (category.parent_id === null) {
    const { data: subcategories } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('parent_id', category.id)
      .eq('is_active', true);
    
    if (subcategories?.length) {
      categoryIds = [...categoryIds, ...subcategories.map(sub => sub.id)];
    }
  }
  const { data: products, error: productsError } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
              variants:product_variants(id, size, stock, reference_number)
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
type PageParams = {
  params: Promise<{ slug: string }>
}
export default async function CategoryPage({ params }: PageParams) {
  const resolvedParams = await Promise.resolve(params);
  // Obtener datos de la categoría y productos iniciales
  const data = await getCategoryWithInitialProducts(resolvedParams.slug);
  
  if (!data) {
    notFound();
  }

  const { category, products } = data;

  // Obtener todas las categorías para los filtros
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner de la categoría */}
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {/* ProductsWrapper con filtros y grid infinito */}
      <ProductsWrapper 
        categories={categories} 
        initialProducts={products}
        queryKey={[`category-${category.id}-products`]}
      />
    </div>
  );
}