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
 * Valida si un archivo es una imagen válida usando múltiples métodos
 * @param file - Archivo a validar
 * @returns true si es una imagen válida
 */
async function isValidImageFile(file: File): Promise<boolean> {
  // Verificar extensión del archivo
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

  // Verificar MIME type (puede fallar en iOS)
  const hasValidMimeType = file.type.startsWith('image/');

  // Si el MIME type es válido y la extensión también, aceptar
  if (hasValidMimeType && hasValidExtension) {
    return true;
  }

  // En iOS, el MIME type puede estar vacío o incorrecto
  // Usar extensión como fallback pero verificar magic bytes
  if ((!file.type || file.type === 'application/octet-stream') && hasValidExtension) {
    return await isValidImageByMagicBytes(file);
  }

  // Si solo tiene MIME type válido, verificar magic bytes también
  if (hasValidMimeType) {
    return await isValidImageByMagicBytes(file);
  }

  // Rechazar si no cumple ningún criterio
  return false;
}

/**
 * Verifica si un archivo es una imagen válida usando magic bytes
 * @param file - Archivo a verificar
 * @returns true si los magic bytes indican que es una imagen válida
 */
async function isValidImageByMagicBytes(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return true;
    }
    
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
        bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A) {
      return true;
    }
    
    // WebP: RIFF ... WEBP
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      // Verificar si es WebP leyendo más bytes
      const webpBuffer = await file.slice(8, 12).arrayBuffer();
      const webpBytes = new Uint8Array(webpBuffer);
      if (webpBytes[0] === 0x57 && webpBytes[1] === 0x45 && webpBytes[2] === 0x42 && webpBytes[3] === 0x50) {
        return true;
      }
    }
    
    // GIF: GIF87a o GIF89a
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
      return true;
    }
    
    return false;
  } catch {
    // Si no se puede leer el archivo, usar solo la extensión
    return false;
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

  // Validar tamaño del archivo (10MB para imágenes principales, 8MB para detalles)
  const maxSize = isMainImage ? 10 * 1024 * 1024 : 8 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds ${isMainImage ? '10MB' : '8MB'} limit`);
  }

  // Validar tipo de archivo con múltiples métodos para mejor compatibilidad iOS
  if (!(await isValidImageFile(file))) {
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