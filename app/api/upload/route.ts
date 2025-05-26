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
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number };
    return NextResponse.json(
      { error: err.message || 'Failed to upload image' },
      { status: err.statusCode || 500 }
    );
  }
}