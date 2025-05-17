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
  } catch (error: any) {
    console.error('Error uploading category image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: error.statusCode || 500 }
    );
  }
}