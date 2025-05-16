'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductData, ProductWithRelations } from './types';

export async function getProducts(): Promise<ProductWithRelations[]> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      *,
      variants:product_variants(*),
      product_images(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createProduct(productData: ProductData): Promise<ProductWithRelations> {
  const { variants, product_images, ...mainProductData } = productData;

  // Crear producto principal
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert(mainProductData)
    .select()
    .single();

  if (productError) throw productError;

  // Crear variantes si existen
  if (variants?.length) {
    const variantsWithProductId = variants.map(variant => ({
      ...variant,
      product_id: product.id
    }));

    const { error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .insert(variantsWithProductId);

    if (variantsError) throw variantsError;
  }

  // Crear imágenes si existen
  if (product_images?.length) {
    const imagesWithProductId = product_images.map(image => ({
      ...image,
      product_id: product.id
    }));

    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .insert(imagesWithProductId);

    if (imagesError) throw imagesError;
  }

  return product as ProductWithRelations;
}

export async function updateProduct(productId: string, productData: Partial<ProductData>): Promise<ProductWithRelations> {
  const { variants, product_images, ...mainProductData } = productData;

  // Actualizar producto principal
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .update(mainProductData)
    .eq('id', productId)
    .select()
    .single();

  if (productError) throw productError;

  // Actualizar variantes si se proporcionaron
  if (variants) {
    // Eliminar variantes existentes
    await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    // Insertar nuevas variantes
    const variantsWithProductId = variants.map(variant => ({
      ...variant,
      product_id: productId
    }));

    const { error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .insert(variantsWithProductId);

    if (variantsError) throw variantsError;
  }

  // Actualizar imágenes si se proporcionaron
  if (product_images) {
    // Eliminar imágenes existentes
    await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    // Insertar nuevas imágenes
    const imagesWithProductId = product_images.map(image => ({
      ...image,
      product_id: productId
    }));

    const { error: imagesError } = await supabaseAdmin
      .from('product_images')
      .insert(imagesWithProductId);

    if (imagesError) throw imagesError;
  }

  return product as ProductWithRelations;
}
export async function getCategoryDetails(categoryId: string): Promise<{ parent_id: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('parent_id')
    .eq('id', categoryId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductCategoryDetails(productId: string): Promise<{ category_id: string; parent_id: string | null }> {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select(`
      category_id,
      categories!inner(parent_id)
    `)
    .eq('id', productId)
    .single();

  if (error) throw error;
  return {
    category_id: data.category_id,
    parent_id: data.categories.parent_id || null 
  };
}
export async function deleteProduct(productId: string): Promise<void> {
  // Eliminar en orden para mantener la integridad referencial
  await Promise.all([
    supabaseAdmin.from('product_images').delete().eq('product_id', productId),
    supabaseAdmin.from('product_variants').delete().eq('product_id', productId)
  ]);

  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

export async function toggleProductStatus(productId: string, isActive: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ is_active: !isActive })
    .eq('id', productId);

  if (error) throw error;
}