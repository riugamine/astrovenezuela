import { NextRequest, NextResponse } from 'next/server';
import { toggleCategoryStatus } from '@/lib/data/admin/actions/categories';

/**
 * POST /api/categories/[id]/toggle-status - Toggle category active status
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    await toggleCategoryStatus(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error toggling category status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle category status' },
      { status: 500 }
    );
  }
}

