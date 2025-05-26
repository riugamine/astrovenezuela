import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { supabaseClient } from "@/lib/supabase/client";
import { notFound } from "next/navigation";

// Fetch product data
async function getProduct(slug: string) {
  const { data: product } = await supabaseClient
    .from("products")
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      variants:product_variants (id, size, stock),
      category:category_id (id, name, slug)
    `)
    .eq("slug", slug.toLowerCase())
    .neq("stock", 0)
    .eq('is_active', true)
    .single();

  if (!product) {
    return null;
  }

  // Fetch related products from the same category
  const { data: relatedProducts } = await supabaseClient
    .from("products")
    .select(`
      *,
      product_images (id, product_id, image_url, order_index),
      variants:product_variants (id, size, stock)
    `)
    .eq("category_id", product.category_id)
    .eq('is_active', true)
    .neq("id", product.id)
    .neq("stock", 0)
    .limit(4);

  return {
    product,
    relatedProducts: relatedProducts || [],
  };
}
type PageParams = {
  params: Promise<{ slug: string }>
}
export default async function ProductPage({ params }: PageParams) {
  const resolvedParams = await Promise.resolve(params);
  const data = await getProduct(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts } = data;

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Galería de imágenes */}
        <div className="w-full max-w-2xl mx-auto lg:max-w-none">
          <ProductGallery product={product} />
        </div>
        
        {/* Información del producto */}
        <div className="w-full max-w-xl mx-auto lg:max-w-none">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Productos relacionados */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}