import { supabaseClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types/database.types';

/**
 * Fetches all active categories from the database
 * @returns Promise<Category[]> Array of active categories
 */
export async function getCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true);

  if (error) throw error;
  return data as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetches all active subcategories from the database
 * Subcategories are categories that have a parent_id (not null)
 * @returns Promise<Category[]> Array of active subcategories
 */
export async function getSubcategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .not("parent_id", "is", null);

  if (error) throw error;
  return data as Category[];
}