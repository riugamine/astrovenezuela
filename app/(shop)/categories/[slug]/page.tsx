import { getCategories } from "@/lib/data/categories";
import { notFound } from 'next/navigation';
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { supabaseClient } from '@/lib/supabase/client';
import { getActiveExchangeRateServer } from "@/lib/data/exchange-rates-server";

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

  // Check if this category has subcategories (is a parent category)
  // We check if subcategories array exists and has items
  if (category.subcategories && category.subcategories.length > 0) {
    // Add all subcategory IDs to the filter
    const subcategoryIds = category.subcategories.map((sub: any) => sub.id);
    categoryIds = [...categoryIds, ...subcategoryIds];
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
  
  // Obtener datos de la categoría, productos iniciales y exchange rate
  const [data, exchangeRate] = await Promise.all([
    getCategoryWithInitialProducts(resolvedParams.slug),
    getActiveExchangeRateServer()
  ]);
  
  if (!data) {
    notFound();
  }

  const { category, products } = data;

  // Prepare forcedCategories array for infinite scroll
  // Include the parent category and all its subcategories
  const forcedCategories = [category.id];
  if (category.subcategories && category.subcategories.length > 0) {
    const subcategoryIds = category.subcategories.map((sub: any) => sub.id);
    forcedCategories.push(...subcategoryIds);
  }

  // Obtener todas las categorías para los filtros
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner de la categoría */}
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          {category.name}
        </h1>
      </div>

      {/* ProductsWrapper con filtros y grid infinito */}
      <ProductsWrapper 
        categories={categories} 
        initialProducts={products}
        queryKey={[`category-${category.id}-products`]}
        forcedCategories={forcedCategories}
        disableCategoryFilter={true}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}