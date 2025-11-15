import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getCategories } from '@/lib/data/admin/actions/categories';
import { CategoryData } from '@/lib/data/admin/actions/categories/types';

/**
 * GET /api/categories - Get all categories
 */
export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories - Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const categoryData: CategoryData = {
      name: body.name,
      description: body.description || '',
      banner_url: body.banner_url || '',
      is_active: body.is_active ?? true,
      parent_id: body.parent_id || null,
    };

    const category = await createCategory(categoryData);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}

