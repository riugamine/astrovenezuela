import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Extracts the storage path from a Supabase public URL
 * @param publicUrl - The public URL of the image
 * @param bucketName - The name of the storage bucket
 * @returns The storage path or null if invalid
 */
export function extractStoragePath(publicUrl: string, bucketName: string): string | null {
  try {
    const url = new URL(publicUrl);
    
    // Handle Supabase storage URL format
    // Format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(bucketName);
    
    if (bucketIndex === -1) {
      console.error('Bucket not found in URL:', publicUrl);
      return null;
    }
    
    // Get everything after the bucket name
    const storagePath = pathParts.slice(bucketIndex + 1).join('/');
    
    if (!storagePath) {
      console.error('Invalid storage path in URL:', publicUrl);
      return null;
    }
    
    return storagePath;
  } catch (error) {
    console.error('Error extracting storage path:', error);
    return null;
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param publicUrl - The public URL of the image to delete
 * @param bucketName - The name of the storage bucket (e.g., 'products', 'categories')
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImageFromStorage(
  publicUrl: string,
  bucketName: string
): Promise<boolean> {
  "use server";
  
  try {
    // Extract the storage path from the public URL
    const storagePath = extractStoragePath(publicUrl, bucketName);
    
    if (!storagePath) {
      console.error('Could not extract storage path from URL:', publicUrl);
      return false;
    }
    
    // Delete the file from storage
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([storagePath]);
    
    if (error) {
      console.error('Supabase storage deletion error:', error);
      return false;
    }
    
    console.log('Successfully deleted image:', storagePath);
    return true;
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    return false;
  }
}

/**
 * Deletes multiple images from Supabase Storage
 * @param publicUrls - Array of public URLs to delete
 * @param bucketName - The name of the storage bucket
 * @returns Object with success count and failed URLs
 */
export async function deleteMultipleImagesFromStorage(
  publicUrls: string[],
  bucketName: string
): Promise<{ successCount: number; failedUrls: string[] }> {
  "use server";
  
  const results = await Promise.all(
    publicUrls.map(async (url) => ({
      url,
      success: await deleteImageFromStorage(url, bucketName),
    }))
  );
  
  const successCount = results.filter(r => r.success).length;
  const failedUrls = results.filter(r => !r.success).map(r => r.url);
  
  return { successCount, failedUrls };
}

/**
 * Validates if a URL belongs to the expected Supabase storage bucket
 * @param publicUrl - The URL to validate
 * @param bucketName - Expected bucket name
 * @returns True if URL is valid for the bucket
 */
export function validateStorageUrl(publicUrl: string, bucketName: string): boolean {
  try {
    const url = new URL(publicUrl);
    return url.pathname.includes(`/storage/v1/object/public/${bucketName}/`);
  } catch {
    return false;
  }
}

