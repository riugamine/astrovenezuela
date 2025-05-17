import { getCategories } from "@/lib/data/categories";
import { fetchProducts } from "@/lib/data/products";
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";

export default async function ProductsPage() {
  // Fetch data on the server
  const [categories, initialProducts] = await Promise.all([
    getCategories(),
    fetchProducts(1)
  ]);

  // Pass data to client wrapper
  return <ProductsWrapper categories={categories} initialProducts={initialProducts.products} queryKey={['products']} />;
}
