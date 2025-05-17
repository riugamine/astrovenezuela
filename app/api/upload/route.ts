import { NextRequest, NextResponse } from 'next/server';
import { uploadProductImage } from '@/lib/data/admin/actions/products';

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
    const imageUrl = await uploadProductImage(formData);
    
    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: error.statusCode || 500 }
    );
  }
}