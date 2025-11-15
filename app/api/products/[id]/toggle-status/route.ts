import { NextRequest, NextResponse } from 'next/server';
import { toggleProductStatus } from '@/lib/data/admin/actions/products';

/**
 * POST /api/products/[id]/toggle-status - Toggle product active status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive must be a boolean' },
        { status: 400 }
      );
    }

    await toggleProductStatus(productId, isActive);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling product status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle product status' },
      { status: 500 }
    );
  }
}

