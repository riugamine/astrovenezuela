import { Category } from '@/lib/types/database.types';
import { CategoryCard } from '@/components/shop/CategoryCard';
import { supabaseClient } from '@/lib/supabase/client';

async function getCategories() {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Categorías</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}