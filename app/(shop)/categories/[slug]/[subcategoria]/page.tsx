import { getCategories } from "@/lib/data/categories";
import { notFound } from 'next/navigation';
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { supabaseClient } from '@/lib/supabase/client';

const PRODUCTS_PER_PAGE = 12;

async function getSubcategoryWithProducts(categorySlug: string, subcategorySlug: string) {
  // Intentemos primero encontrar la categoría padre
  const { data: parentCategory, error: parentError } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .single();

  // Luego busquemos la subcategoría
  const { data: subcategory, error: subcategoryError } = await supabaseClient
    .from('categories')
    .select(`
      *,
      parent:categories!parent_id(*)
    `)
    .eq('slug', subcategorySlug)
    .eq('parent_id', parentCategory.id)
    .eq('is_active', true)
    .single();


  // Si llegamos aquí, busquemos los productos
  const { data: products, error: productsError } = await supabaseClient
    .from('products')
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      variants:product_variants(id, size, stock)
    `)
    .eq('category_id', subcategory.id)
    .eq('is_active', true)
    .range(0, PRODUCTS_PER_PAGE - 1);


  return {
    subcategory,
    products: products || []
  };
}

export default async function SubcategoryPage({ 
  params 
}: { 
  params: { slug: string; subcategoria: string } 
}) {
    const resolvedParams = await Promise.resolve(params);
  const data = await getSubcategoryWithProducts(resolvedParams.slug, resolvedParams.subcategoria);
  if (!data) {
    notFound();
  }

  const { subcategory, products } = data;
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          {subcategory.name}
        </h1>
        {subcategory.description && (
          <p className="text-muted-foreground max-w-2xl mx-auto">
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