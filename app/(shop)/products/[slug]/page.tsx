import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { RelatedProducts } from "@/components/shop/RelatedProducts";
import { useProductStore } from "@/lib/store/useProductStore";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const product = useProductStore.getState().getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <ProductGallery />
        
        {/* Información del producto */}
        <ProductInfo product={product} />
      </div>

      {/* Productos relacionados */}
      <RelatedProducts />
    </div>
  );
}