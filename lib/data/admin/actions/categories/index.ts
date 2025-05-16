'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { Category, CategoryData } from './types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createCategory(categoryData: CategoryData): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert(categoryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<Category> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(categoryData)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCategoryStatus(categoryId: string, isActive: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('categories')
    .update({ is_active: !isActive })
    .eq('id', categoryId);

  if (error) throw error;
}