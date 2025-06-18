'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductData, ProductWithRelations, CreateProductData } from './types';
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

  // Si hay un subcategory_id, usarlo como category_id en lugar del category_id original
  // Esto es porque las subcategorías son categorías con parent_id en la estructura de BD
  const finalProductData = {
    ...mainProductData,
    category_id: subcategory_id || mainProductData.category_id
  };

  // Create main product (finalProductData ya no contiene subcategory_id)
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .insert(finalProductData)
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
  
  // Si hay un subcategory_id, usarlo como category_id
  const finalProductData = {
    ...mainProductData,
    category_id: subcategory_id || mainProductData.category_id
  };

  // Update main product
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .update(finalProductData)
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
          .update({ 
            stock: variant.stock,
            reference_number: variant.reference_number || null
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new variant
        const { error } = await supabaseAdmin
          .from('product_variants')
          .insert({
            size: variant.size,
            stock: variant.stock,
            reference_number: variant.reference_number || null,
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

// Valid extensions and MIME types
const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates if a file is an allowed image (simple check for admin use)
 */
async function isValidImageFile(file: File): Promise<boolean> {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMime = validMimeTypes.includes(file.type);

  // iOS sometimes sends empty MIME, so allow if extension is valid
  return hasValidExtension || hasValidMime;
}

/**
 * Compresses and converts image to JPEG or WebP with high quality
 */
async function compressImage(buffer: Buffer, isMainImage: boolean = false, mimeType: string = 'image/jpeg'): Promise<{ buffer: Buffer, ext: string, contentType: string }> {
  try {
    let imageProcessor = sharp(buffer);
    let ext = 'jpg';
    let contentType = 'image/jpeg';

    // Detect if original is webp and keep it if possible
    if (mimeType === 'image/webp') {
      ext = 'webp';
      contentType = 'image/webp';
      imageProcessor = imageProcessor.webp({ quality: 95 });
    } else {
      imageProcessor = imageProcessor.jpeg({ quality: 95, progressive: true, mozjpeg: true });
    }

    // Resize
    if (isMainImage) {
      imageProcessor = imageProcessor.resize(1920, 1440, { fit: 'inside', withoutEnlargement: true });
    } else {
      imageProcessor = imageProcessor.resize(1200, 1200, { fit: 'inside', withoutEnlargement: true });
    }

    return { buffer: await imageProcessor.toBuffer(), ext, contentType };
  } catch (error) {
    console.error('Error compressing image:', error);
    return { buffer, ext: 'jpg', contentType: 'image/jpeg' };
  }
}

/**
 * Uploads a product image to Supabase Storage
 */
export async function uploadProductImage(formData: FormData): Promise<string> {
  const file = formData.get('file') as File;
  const path = formData.get('path') as string;
  const isMainImage = path.includes('main-images');

  if (!file || !path) {
    throw new Error('File and path are required');
  }

  // New general size limit: 50MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 50MB limit');
  }

  // Simple validation for admin context
  if (!(await isValidImageFile(file))) {
    throw new Error('Invalid file type. Only images are allowed');
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { buffer: compressedBuffer, ext, contentType } = await compressImage(buffer, isMainImage, file.type);

    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(filePath, compressedBuffer, {
        contentType,
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