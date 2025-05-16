"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { Category, CategoryData } from "./types";
import { generateSlug } from "@/lib/utils";

// Helper function to generate category slug
async function generateCategorySlug(name: string, parentId?: string | null): Promise<string> {
  const baseSlug = generateSlug(name);
  
  if (parentId) {
    const { data: parent } = await supabaseAdmin
      .from("categories")
      .select("slug")
      .eq("id", parentId)
      .single();
    return `${parent?.slug}/${baseSlug}`;
  }
  
  return baseSlug;
}

// Helper to check if slug exists
async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const query = supabaseAdmin
    .from("categories")
    .select("id")
    .eq("slug", slug);
  
  if (excludeId) {
    query.neq("id", excludeId);
  }
  
  const { data } = await query;
  return !data?.length;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select(`
      *,
      subcategories:categories!parent_id(*)
    `)
    .is("parent_id", null)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function createCategory(categoryData: CategoryData): Promise<Category> {
  const slug = await generateCategorySlug(categoryData.name, categoryData.parent_id);
  
  if (!(await isSlugUnique(slug))) {
    throw new Error("A category with this name already exists");
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      ...categoryData,
      slug,
      is_active: categoryData.is_active ?? true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<Category> {
  const updates: any = { ...categoryData };
  
  if (categoryData.name) {
    const slug = await generateCategorySlug(categoryData.name, categoryData.parent_id);
    if (!(await isSlugUnique(slug, categoryId))) {
      throw new Error("A category with this name already exists");
    }
    updates.slug = slug;
  }

  const { data, error } = await supabaseAdmin
    .from("categories")
    .update(updates)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCategoryStatus(categoryId: string): Promise<void> {
  const { data: category, error: fetchError } = await supabaseAdmin
    .from("categories")
    .select("is_active, parent_id")
    .eq("id", categoryId)
    .single();

  if (fetchError) throw fetchError;

  const { error: updateError } = await supabaseAdmin
    .from("categories")
    .update({ is_active: !category.is_active })
    .eq("id", categoryId);

  if (updateError) throw updateError;

  // If it's a parent category, update all subcategories
  if (!category.parent_id) {
    const { error: subError } = await supabaseAdmin
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("parent_id", categoryId);

    if (subError) throw subError;
  }
}
// Helper function to upload category banner
async function uploadCategoryBanner(file: Buffer, filename: string): Promise<string> {
  const fileExt = filename.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { data, error } = await supabaseAdmin.storage
    .from('categories')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('categories')
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function uploadCategoryImage(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must not exceed 10MB');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return await uploadCategoryBanner(buffer, file.name);
  } catch (error) {
    console.error('Error uploading banner:', error);
    throw new Error('Failed to upload category banner');
  }
}