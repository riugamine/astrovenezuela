import { NextRequest, NextResponse } from 'next/server';
import { createAdminSale, getAllSales } from '@/lib/data/admin/actions/sales';
import { CreateSaleData } from '@/lib/data/admin/actions/sales/types';
import { VALID_PAYMENT_METHODS } from '@/lib/constants';

/**
 * GET /api/sales - Get all sales/orders
 */
export async function GET() {
  try {
    const sales = await getAllSales();
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales - Create a new admin sale
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customer_first_name || !body.customer_last_name || !body.customer_phone) {
      return NextResponse.json(
        { error: 'Customer first name, last name, and phone are required' },
        { status: 400 }
      );
    }

    // Validate shipping method and payment method
    if (!body.shipping_method || !body.payment_method || !body.whatsapp_number) {
      return NextResponse.json(
        { error: 'Shipping method, payment method, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    // Validate payment method is one of the allowed values
    if (!VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return NextResponse.json(
        { error: `Invalid payment method. Allowed values: ${VALID_PAYMENT_METHODS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate shipping address based on shipping method
    if (body.shipping_method === 'delivery' && (!body.shipping_address || body.shipping_address.trim() === '')) {
      return NextResponse.json(
        { error: 'Shipping address is required for delivery method' },
        { status: 400 }
      );
    }

    // Validate agency address for MRW and Zoom
    if ((body.shipping_method === 'MRW' || body.shipping_method === 'Zoom') && 
        (!body.agency_address || body.agency_address.trim() === '')) {
      return NextResponse.json(
        { error: 'Agency address is required for MRW and Zoom shipping methods' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of body.items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
        return NextResponse.json(
          { error: 'Each item must have a valid product_id, quantity > 0, and price > 0' },
          { status: 400 }
        );
      }
    }

    // For pickup method, use a default address or agency_address if available
    // For MRW/Zoom, use agency_address as shipping_address
    let finalShippingAddress = body.shipping_address;
    if (body.shipping_method === 'pickup') {
      // For pickup, we can use a default store address or leave it empty
      // The database function requires shipping_address, so we'll use a default
      finalShippingAddress = body.agency_address || 'Recoger en tienda';
    } else if (body.shipping_method === 'MRW' || body.shipping_method === 'Zoom') {
      // For MRW/Zoom, use agency_address as shipping_address
      finalShippingAddress = body.agency_address || '';
    }

    const saleData: CreateSaleData = {
      customer_first_name: body.customer_first_name,
      customer_last_name: body.customer_last_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email,
      customer_dni: body.customer_dni,
      shipping_address: finalShippingAddress || '',
      shipping_method: body.shipping_method,
      agency_address: body.agency_address,
      payment_method: body.payment_method,
      whatsapp_number: body.whatsapp_number,
      items: body.items,
      status: body.status || 'pending',
      order_notes: body.order_notes,
    };

    const sale = await createAdminSale(saleData);
    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sale' },
      { status: 500 }
    );
  }
}

