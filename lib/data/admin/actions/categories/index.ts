"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { Category, CategoryData, CategoryWithSubcategories } from "./types";
import { generateSlug } from "@/lib/utils";
import sharp from "sharp";
/**
 * Compresses and converts image to JPEG or WebP with high quality
 */
async function compressImage(buffer: Buffer, mimeType: string = 'image/jpeg'): Promise<{ buffer: Buffer, ext: string, contentType: string }> {
  try {
    let imageProcessor = sharp(buffer);
    let ext = 'jpg';
    let contentType = 'image/jpeg';

    if (mimeType === 'image/png') {
      ext = 'png';
      contentType = 'image/png';
      imageProcessor = imageProcessor.png({ 
        quality: 95, 
        compressionLevel: 9,
        palette: true
      });
    } else if (mimeType === 'image/webp') {
      ext = 'webp';
      contentType = 'image/webp';
      imageProcessor = imageProcessor.webp({ quality: 95 });
    } else {
      imageProcessor = imageProcessor.jpeg({ quality: 95, progressive: true, mozjpeg: true });
    }

    // Resize for category banners
    imageProcessor = imageProcessor.resize(800, 600, { fit: 'inside', withoutEnlargement: true });

    return { buffer: await imageProcessor.toBuffer(), ext, contentType };
  } catch (error) {
    console.error('Error compressing image:', error);
    return { buffer, ext: 'jpg', contentType: 'image/jpeg' };
  }
}
// Helper function to generate category slug
async function generateCategorySlug(name: string): Promise<string> {
  return generateSlug(name);
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
function organizeCategories(categories: Category[]): CategoryWithSubcategories[] {
  const categoryMap = new Map<string, CategoryWithSubcategories>();
  const result: CategoryWithSubcategories[] = [];

  // First pass: Create category objects with empty subcategories arrays
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, subcategories: [] });
  });

  // Second pass: Build the hierarchy and create ordered list
  const processCategory = (categoryId: string | null, level: number = 0) => {
    const categoriesAtLevel = categories
      .filter(cat => cat.parent_id === categoryId)
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const category of categoriesAtLevel) {
      const categoryWithSubs = categoryMap.get(category.id)!;
      result.push(categoryWithSubs);
      processCategory(category.id, level + 1);
    }
  };

  // Start with root categories (parent_id is null)
  processCategory(null);

  return result;
}

export async function getCategories(): Promise<CategoryWithSubcategories[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
  if (error) throw error;
  if (!data) return [];

  return organizeCategories(data);
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("parent_id", parentId)
    .eq('is_active', true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export async function createCategory(categoryData: CategoryData): Promise<Category> {
  const slug = await generateCategorySlug(categoryData.name);
  
  if (!(await isSlugUnique(slug))) {
    throw new Error("A category with this name already exists");
  }
  const subcategory = categoryData.parent_id ? categoryData.name : null;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      ...categoryData,
      slug,
      is_active: categoryData.is_active ?? true,
      subcategory
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
  // 1. Primero verificamos si la categoría existe
  const { data: existingCategory, error: fetchError } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (fetchError) throw fetchError;
  if (!existingCategory) throw new Error("Category not found");

  // 2. Preparamos las actualizaciones
  const updates: Partial<CategoryData> = {};

  // 3. Solo procesamos el slug si el nombre ha cambiado
  if (categoryData.name && categoryData.name !== existingCategory.name) {
    const slug = await generateCategorySlug(categoryData.name);
    if (!(await isSlugUnique(slug, categoryId))) {
      throw new Error("A category with this name already exists");
    }
    updates.name = categoryData.name;
    updates.slug = slug;
  }

  // 4. Procesamos otros campos si están presentes
  if (categoryData.description !== undefined) {
    updates.description = categoryData.description;
  }

  if (categoryData.banner_url !== undefined) {
    updates.banner_url = categoryData.banner_url;
  }

  if (categoryData.parent_id !== undefined) {
    updates.parent_id = categoryData.parent_id;
  }

  if (categoryData.is_active !== undefined) {
    updates.is_active = categoryData.is_active;
  }

  // 5. Si no hay cambios, retornamos la categoría existente
  if (Object.keys(updates).length === 0) {
    return existingCategory;
  }

  // 6. Realizamos la actualización
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

/**
 * Deletes a category permanently from the database
 * Only allows deletion if category has no associated products and no subcategories
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  // 1. Check if category has products
  const { data: products, error: productsError } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('category_id', categoryId)
    .limit(1);

  if (productsError) throw productsError;
  if (products && products.length > 0) {
    throw new Error('No se puede eliminar una categoría con productos asociados');
  }

  // 2. Check if category has subcategories
  const { data: subcategories, error: subcategoriesError } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('parent_id', categoryId)
    .limit(1);

  if (subcategoriesError) throw subcategoriesError;
  if (subcategories && subcategories.length > 0) {
    throw new Error('No se puede eliminar una categoría con subcategorías');
  }

  // 3. Delete the category
  const { error: deleteError } = await supabaseAdmin
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (deleteError) throw deleteError;
}

// Helper function to upload category banner
export async function uploadCategoryBanner(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image must not exceed 10MB');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { buffer: compressedBuffer, ext, contentType } = await compressImage(buffer, file.type);

    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `banners/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('categories')
      .upload(filePath, compressedBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('categories')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading category banner:', error);
    throw new Error('Failed to upload category banner');
  }
}
