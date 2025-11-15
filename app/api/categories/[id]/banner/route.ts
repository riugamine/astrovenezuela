import { NextRequest, NextResponse } from 'next/server';
import { deleteCategoryBanner } from '@/lib/data/admin/actions/categories';

/**
 * DELETE /api/categories/[id]/banner - Delete category banner
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await request.json();
    const { bannerUrl } = body;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    if (!bannerUrl) {
      return NextResponse.json(
        { error: 'Banner URL is required' },
        { status: 400 }
      );
    }

    await deleteCategoryBanner(categoryId, bannerUrl);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category banner:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete category banner' },
      { status: 500 }
    );
  }
}

