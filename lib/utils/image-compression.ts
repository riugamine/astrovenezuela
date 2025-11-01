import sharp from "sharp";

/**
 * Image compression configuration type
 */
export interface CompressionConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compression result type
 */
export interface CompressionResult {
  buffer: Buffer;
  ext: string;
  contentType: string;
}

/**
 * Image type enum for different use cases
 */
export enum ImageType {
  PRODUCT_MAIN = "product_main",
  PRODUCT_DETAIL = "product_detail",
  CATEGORY_BANNER = "category_banner",
}

/**
 * Get default compression config based on image type
 */
function getDefaultConfig(imageType: ImageType): CompressionConfig {
  switch (imageType) {
    case ImageType.PRODUCT_MAIN:
      return { maxWidth: 1920, maxHeight: 1440, quality: 95 };
    case ImageType.PRODUCT_DETAIL:
      return { maxWidth: 1200, maxHeight: 1200, quality: 95 };
    case ImageType.CATEGORY_BANNER:
      return { maxWidth: 800, maxHeight: 600, quality: 95 };
    default:
      return { maxWidth: 1200, maxHeight: 1200, quality: 95 };
  }
}

/**
 * Validates if a file is a valid image
 * @param file - The file to validate
 * @returns True if valid image file
 */
export async function isValidImageFile(file: File): Promise<boolean> {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  const fileName = file.name.toLowerCase();
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  const hasValidMime = allowedMimeTypes.includes(file.type);

  return hasValidExtension || hasValidMime;
}

/**
 * Compresses and converts image with proper error handling
 * Supports JPEG, PNG, WebP, and GIF formats
 * 
 * @param buffer - Image buffer to compress
 * @param mimeType - Original MIME type of the image
 * @param imageType - Type of image for compression settings
 * @param customConfig - Optional custom compression configuration
 * @returns Compression result with buffer, extension, and content type
 */
export async function compressImage(
  buffer: Buffer,
  mimeType: string = 'image/jpeg',
  imageType: ImageType = ImageType.PRODUCT_DETAIL,
  customConfig?: CompressionConfig
): Promise<CompressionResult> {
  try {
    // Get compression config
    const config = customConfig || getDefaultConfig(imageType);
    
    let imageProcessor = sharp(buffer);
    let ext = 'jpg';
    let contentType = 'image/jpeg';

    // Detect and preserve image format with proper PNG handling
    if (mimeType === 'image/png' || mimeType === 'image/x-png') {
      ext = 'png';
      contentType = 'image/png';
      
      // PNG-specific compression with error handling
      try {
        imageProcessor = imageProcessor.png({ 
          quality: config.quality || 95,
          compressionLevel: 9,
          palette: true, // Optimize for web
          progressive: false, // PNG doesn't support progressive
        });
      } catch (pngError) {
        console.error('PNG compression error, falling back to default:', pngError);
        // Fallback to basic PNG processing
        imageProcessor = imageProcessor.png({ quality: 90 });
      }
    } else if (mimeType === 'image/webp') {
      ext = 'webp';
      contentType = 'image/webp';
      imageProcessor = imageProcessor.webp({ 
        quality: config.quality || 95,
        effort: 4 // Balance between compression and speed
      });
    } else if (mimeType === 'image/gif') {
      ext = 'gif';
      contentType = 'image/gif';
      // GIF handling - preserve animation if present
      imageProcessor = imageProcessor.gif();
    } else {
      // JPEG for all others (default)
      imageProcessor = imageProcessor.jpeg({ 
        quality: config.quality || 95,
        progressive: true,
        mozjpeg: true 
      });
    }

    // Apply resize if dimensions are specified
    if (config.maxWidth && config.maxHeight) {
      imageProcessor = imageProcessor.resize(config.maxWidth, config.maxHeight, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    }

    // Process the image
    const compressedBuffer = await imageProcessor.toBuffer();
    
    return { buffer: compressedBuffer, ext, contentType };
  } catch (error) {
    console.error('Error compressing image:', error);
    
    // If compression fails, try to return original with basic format detection
    const ext = mimeType.includes('png') ? 'png' : 
                mimeType.includes('webp') ? 'webp' : 
                mimeType.includes('gif') ? 'gif' : 'jpg';
    
    const contentType = mimeType.includes('png') ? 'image/png' :
                        mimeType.includes('webp') ? 'image/webp' :
                        mimeType.includes('gif') ? 'image/gif' : 'image/jpeg';
    
    return { buffer, ext, contentType };
  }
}

/**
 * Validates image file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @returns True if file size is valid
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Validates image file type
 * @param file - File to validate
 * @returns True if file type is valid
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(file.type);
}

