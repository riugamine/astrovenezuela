import { supabaseClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types/database.types';

/**
 * Fetches all active categories from the database
 * @returns Promise<Category[]> Array of active categories
 */
export async function getCategories() {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .eq("is_active", true);

    if (error) {
      return []; // Return empty array instead of throwing
    }
    return data as Category[];
  } catch {
    return []; // Return empty array instead of throwing
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const { data, error } = await supabaseClient
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      return null; // Return null instead of throwing
    }
    return data;
  } catch {
    return null; // Return null instead of throwing
  }
}

/**
 * Fetches all active subcategories from the database
 * Subcategories are categories that have a parent_id (not null)
 * @returns Promise<Category[]> Array of active subcategories
 */
export async function getSubcategories() {
  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .not("parent_id", "is", null);

    if (error) {
      return []; // Return empty array instead of throwing
    }
    return data as Category[];
  } catch {
    return []; // Return empty array instead of throwing
  }
}