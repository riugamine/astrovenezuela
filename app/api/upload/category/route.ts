import { NextRequest, NextResponse } from 'next/server';
import { uploadCategoryBanner } from '@/lib/data/admin/actions/categories';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const imageUrl = await uploadCategoryBanner(file);
    
    return NextResponse.json({ url: imageUrl });
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    return NextResponse.json(
      { error: err.message || 'Failed to upload image' },
      { status: err.statusCode || 500 }
    );
  }
}