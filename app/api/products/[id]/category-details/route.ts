import { NextRequest, NextResponse } from 'next/server';
import { getProductCategoryDetails } from '@/lib/data/admin/actions/products';

/**
 * GET /api/products/[id]/category-details - Get product category details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const categoryDetails = await getProductCategoryDetails(productId);
    return NextResponse.json(categoryDetails);
  } catch (error) {
    console.error('Error fetching product category details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product category details' },
      { status: 500 }
    );
  }
}

