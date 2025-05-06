/**
 * Datos estáticos para las órdenes
 */
export const orders = [
  {
    id: '1',
    user_id: 'auth-user-id-2',
    status: 'completed',
    total_amount: 94.97,
    shipping_address: 'Calle Principal 123, Caracas, Venezuela',
    payment_method: 'zelle',
    items: [
      {
        product_variant_id: '1',
        quantity: 2,
        price: 29.99
      },
      {
        product_variant_id: '4',
        quantity: 1,
        price: 34.99
      }
    ],
    created_at: new Date().toISOString()
  }
];