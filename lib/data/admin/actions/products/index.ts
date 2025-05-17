'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductData, ProductWithRelations, CreateProductData, CreateProductImage, CreateProductVariant } from './types';
import sharp from 'sharp';

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

export async function createProduct(productData: CreateProductData): Promise<ProductWithRelations> {
  const { variants, product_images, subcategory_id, ...mainProductData } = productData;

  // Create main product
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert(mainProductData)
    .select()
    .single();

  if (productError) throw productError;

  // Create variants if they exist
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

  // Create images if they exist
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
  const { variants, product_images, subcategory_id, ...mainProductData } = productData;

  // Update main product
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .update(mainProductData)
    .eq('id', productId)
    .select()
    .single();

  if (productError) throw productError;

  // Update variants if provided
  if (variants) {
    // Get existing variants and their order references
    const { data: existingVariants } = await supabaseAdmin
      .from('product_variants')
      .select('id, size, order_items(id)')
      .eq('product_id', productId);

    // Create a map of existing variants by size
    const existingVariantMap = new Map(
      existingVariants?.map(v => [v.size, { id: v.id, hasOrders: v.order_items.length > 0 }]) || []
    );

    // Update or insert variants
    for (const variant of variants) {
      const existing = existingVariantMap.get(variant.size);
      
      if (existing) {
        // Update existing variant
        const { error } = await supabaseAdmin
          .from('product_variants')
          .update({ stock: variant.stock })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new variant
        const { error } = await supabaseAdmin
          .from('product_variants')
          .insert({
            size: variant.size,
            stock: variant.stock,
            product_id: productId
          });

        if (error) throw error;
      }
    }

    // Only delete variants that aren't in any orders
    const currentSizes = new Set(variants.map(v => v.size));
    const variantsToDelete = existingVariants
      ?.filter(v => !currentSizes.has(v.size) && v.order_items.length === 0)
      .map(v => v.id) || [];

    if (variantsToDelete.length > 0) {
      const { error } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .in('id', variantsToDelete);

      if (error) throw error;
    }
  }

  // Handle images update (unchanged)
  if (product_images) {
    await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

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
  type RawProductCategory = {
    category_id: string;
    categories: {
      parent_id: string | null;
    };
  };
  const typedData = (data as unknown) as RawProductCategory;
  return {
    category_id: typedData.category_id,
    parent_id: typedData.categories.parent_id || null
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
    .update({ is_active: isActive })
    .eq('id', productId);

  if (error) throw error;
}

/**
 * Comprime una imagen antes de subirla
 * @param buffer - Buffer de la imagen a comprimir
 * @returns Buffer comprimido
 */
async function compressImage(buffer: Buffer, isMainImage: boolean = false): Promise<Buffer> {
  try {
    let imageProcessor = sharp(buffer);
    
    // Configuración específica según el tipo de imagen
    if (isMainImage) {
      imageProcessor = imageProcessor
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 100,
          progressive: true,
          mozjpeg: true // Mejor compresión
        });
    } else {
      imageProcessor = imageProcessor
        .resize(600, 500, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true
        });
    }

    return await imageProcessor.toBuffer();
  } catch (error) {
    console.error('Error compressing image:', error);
    return buffer;
  }
}

/**
 * Sube una imagen a Supabase Storage
 * @param formData - FormData con el archivo y la ruta
 * @returns URL pública de la imagen
 */
export async function uploadProductImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  const isMainImage = path.includes('main-images');

  if (!file || !path) {
    throw new Error('File and path are required');
  }

  // Validar tamaño del archivo (5MB para imágenes principales, 3MB para detalles)
  const maxSize = isMainImage ? 5 * 1024 * 1024 : 3 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${isMainImage ? '5MB' : '3MB'} limit`);
  }

  // Validar tipo de archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Only images are allowed');
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const compressedBuffer = await compressImage(buffer, isMainImage);
    
    const fileExt = 'jpg'; // Forzar formato JPEG para mejor compresión
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, compressedBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param url - URL pública de la imagen
 */
export async function deleteProductImage(url: string): Promise<void> {
  const path = url.split('/').pop();
  if (!path) throw new Error('Invalid image URL');

  const { error } = await supabaseAdmin.storage
    .from('products')
    .remove([path]);

  if (error) throw error;
}