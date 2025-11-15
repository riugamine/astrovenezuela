import { NextRequest, NextResponse } from 'next/server';
import { updateCategory, deleteCategory } from '@/lib/data/admin/actions/categories';
import { CategoryData } from '@/lib/data/admin/actions/categories/types';

/**
 * PATCH /api/categories/[id] - Update a category
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryData: Partial<CategoryData> = {};
    
    if (body.name !== undefined) categoryData.name = body.name;
    if (body.description !== undefined) categoryData.description = body.description;
    if (body.banner_url !== undefined) categoryData.banner_url = body.banner_url;
    if (body.is_active !== undefined) categoryData.is_active = body.is_active;
    if (body.parent_id !== undefined) categoryData.parent_id = body.parent_id;

    const category = await updateCategory(categoryId, categoryData);
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update category' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id] - Delete a category
 */
export async function DELETE(
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

    await deleteCategory(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete category' },
      { status: 500 }
    );
  }
}

