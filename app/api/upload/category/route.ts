import { NextRequest, NextResponse } from 'next/server';
import { uploadCategoryBanner } from '@/lib/data/admin/actions/categories';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

/**
 * Handles POST requests for uploading category banner images
 * Validates the file and uploads it to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
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

    // Upload the image
    const imageUrl = await uploadCategoryBanner(file);
    
    // Validate URL was returned
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error: unknown) {
    console.error('Category upload API error:', error);
    
    const err = error as { message?: string; statusCode?: number };
    
    // Return appropriate error message and status
    return NextResponse.json(
      { error: err.message || 'Failed to upload image' },
      { status: err.statusCode || 500 }
    );
  }
}