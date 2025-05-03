import { createClient } from '@/lib/supabase/client';
import { Category, Subcategory } from '@/lib/types/category';

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name');

  if (error) throw error;
  return data;
}

/**
 * Datos estáticos para las categorías de productos
 */
export const categories = [
  {
    id: '1',
    name: 'Entrenamiento',
    slug: 'entrenamiento',
    parent_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'CrossFit',
    slug: 'crossfit',
    parent_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Gimnasio',
    slug: 'gimnasio',
    parent_id: '1',
    created_at: new Date().toISOString()
  }
];