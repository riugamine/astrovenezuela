import { getCategories } from "@/lib/data/categories";
import { searchProducts } from "@/lib/data/products";
import { SearchWrapper } from "@/components/shop/SearchWrapper";
import { notFound } from "next/navigation";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q;

  // Redirect to products page if no search query
  if (!query || (Array.isArray(query) ? query[0] : query).trim() === '') {
    notFound();
  }

  const searchQuery = Array.isArray(query) ? query[0] : query;
  
  // Fetch data on the server
  let searchResults;
  let categories;
  try {
    const [categoriesData, results] = await Promise.all([
      getCategories(),
      searchProducts(searchQuery, 1)
    ]);
    categories = categoriesData;
    searchResults = results;
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results if search fails
    categories = await getCategories().catch(() => []);
    searchResults = {
      products: [],
      hasMore: false,
      totalCount: 0
    };
  }


  // Convert search results to the format expected by ProductsWrapper
  const initialProducts = searchResults.products;

  // Create URL parameters for the search query
  const urlParams = new URLSearchParams();
  urlParams.set('q', searchQuery);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Results Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary dark:text-white mb-2">
          Resultados de búsqueda
        </h1>
        <p className="text-muted-foreground dark:text-gray-300">
          {searchResults.totalCount > 0 ? (
            <>
              Se encontraron <span className="font-semibold text-primary dark:text-white">{searchResults.totalCount}</span> productos 
              para &quot;<span className="font-semibold dark:text-white">{searchQuery}</span>&quot;
            </>
          ) : (
            <>
              No se encontraron productos para &quot;<span className="font-semibold dark:text-white">{searchQuery}</span>&quot;
            </>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {searchResults.totalCount > 0 ? (
        <SearchWrapper 
          query={searchQuery}
          categories={categories} 
          initialProducts={initialProducts} 
          queryKey={['search', searchQuery]}
          initialURLParams={urlParams}
          disableCategoryFilter={false}
        />
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground dark:text-gray-300 mb-4">
              Intenta con otros términos de búsqueda o explora nuestras categorías
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground dark:text-gray-300">Sugerencias:</p>
              <ul className="text-sm text-muted-foreground dark:text-gray-300 space-y-1">
                <li>• Verifica la ortografía</li>
                <li>• Usa términos más generales</li>
                <li>• Intenta con sinónimos</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
