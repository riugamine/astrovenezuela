import { getCategories } from "@/lib/data/categories";
import { fetchProducts } from "@/lib/data/products";
import { ProductsWrapper } from "@/components/shop/ProductsWrapper";
import { categoriesToIds } from "@/lib/utils/category-utils";
import { getActiveExchangeRateServer } from "@/lib/data/exchange-rates-server";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Fetch data on the server
  const [categories, initialProducts, exchangeRate] = await Promise.all([
    getCategories(),
    fetchProducts(1, params.categories ? [params.categories as string] : undefined),
    getActiveExchangeRateServer()
  ]);

  // Convert URL parameters to filter format
  const urlParams = new URLSearchParams();
  
  // Handle category filter - convert category names/slugs to IDs
  if (params.categories) {
    const categoryParam = Array.isArray(params.categories) 
      ? params.categories[0] 
      : params.categories;
    
    // Split by comma in case multiple categories
    const categoryIdentifiers = categoryParam.split(',');
    const categoryIds = categoriesToIds(categories, categoryIdentifiers);
    
    if (categoryIds.length > 0) {
      urlParams.set('categories', categoryIds.join(','));
    }
  }
  
  // Handle sizes filter
  if (params.sizes) {
    const sizesParam = Array.isArray(params.sizes) 
      ? params.sizes[0] 
      : params.sizes;
    urlParams.set('sizes', sizesParam);
  }
  
  // Handle sort parameter
  if (params.sort) {
    const sortParam = Array.isArray(params.sort) 
      ? params.sort[0] 
      : params.sort;
    urlParams.set('sort', sortParam);
  }
  
  // Handle price range parameters
  if (params.min_price) {
    const minPriceParam = Array.isArray(params.min_price) 
      ? params.min_price[0] 
      : params.min_price;
    urlParams.set('min_price', minPriceParam);
  }
  
  if (params.max_price) {
    const maxPriceParam = Array.isArray(params.max_price) 
      ? params.max_price[0] 
      : params.max_price;
    urlParams.set('max_price', maxPriceParam);
  }

  // Pass data to client wrapper
  return (
    <ProductsWrapper 
      categories={categories} 
      initialProducts={initialProducts.products} 
      queryKey={['products']}
      initialURLParams={urlParams}
      exchangeRate={exchangeRate}
    />
  );
}
