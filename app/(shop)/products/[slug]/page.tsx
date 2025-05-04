import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductInfo } from "@/components/shop/ProductInfo";
import { RelatedProducts } from "@/components/shop/RelatedProducts";

export default function ProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <ProductGallery />
        
        {/* Información del producto */}
        <ProductInfo />
      </div>

      {/* Productos relacionados */}
      <RelatedProducts />
    </div>
  );
}