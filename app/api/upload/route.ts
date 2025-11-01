import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { compressImage, ImageType, validateFileSize, validateFileType } from '@/lib/utils/image-compression';
import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

/**
 * Unified image upload endpoint for products and categories
 * Handles POST requests with multipart form data
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const uploadType = formData.get('uploadType') as string || 'product'; // 'product' or 'category'
    const path = formData.get('path') as string; // For products: 'main-images' or 'detail-images'
    
    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file is actually a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (!validateFileSize(file, 10)) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 400 }
      );
    }

    // Determine bucket and image type based on uploadType
    let bucketName: string;
    let imageType: ImageType;
    let storagePath: string;

    if (uploadType === 'category') {
      bucketName = 'categories';
      imageType = ImageType.CATEGORY_BANNER;
      storagePath = 'banners';
    } else {
      // Product upload
      bucketName = 'products';
      if (!path) {
        return NextResponse.json(
          { error: 'Path parameter is required for product uploads' },
          { status: 400 }
        );
      }
      imageType = path.includes('main-images') ? ImageType.PRODUCT_MAIN : ImageType.PRODUCT_DETAIL;
      storagePath = path;
    }

    // Process the image
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Compress image with proper error handling
    const { buffer: compressedBuffer, ext, contentType } = await compressImage(
      buffer,
      file.type,
      imageType
    );

    // Generate unique filename
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${storagePath}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, compressedBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: `Storage bucket "${bucketName}" not found. Please check Supabase Storage configuration.` },
          { status: 500 }
        );
      }
      if (error.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Permission denied. Please check storage bucket policies.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Storage error: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Upload succeeded but no data returned' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate public URL for uploaded image' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload API error:', error);
    
    const err = error as { message?: string; statusCode?: number };
    
    // Return appropriate error message and status
    return NextResponse.json(
      { error: err.message || 'Failed to upload image' },
      { status: err.statusCode || 500 }
    );
  }
}