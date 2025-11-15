import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/data/admin/actions/products';
import { CreateProductData } from '@/lib/data/admin/actions/products/types';

/**
 * GET /api/products - Get all products
 */
export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products - Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.category_id) {
      return NextResponse.json(
        { error: 'Name, price, and category_id are required' },
        { status: 400 }
      );
    }

    const productData: CreateProductData = body;

    const product = await createProduct(productData);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
}

