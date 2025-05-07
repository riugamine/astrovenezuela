/**
 * Tipos de estado de orden
 */
export type OrderStatus = 'created' | 'pending' | 'completed';

/**
 * Datos estáticos para las órdenes
 */
export const orders = [
  {
    id: '1',
    user_id: 'auth-user-id-2',
    status: 'completed' as OrderStatus,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'auth-user-id-2',
    status: 'pending' as OrderStatus,
    total_amount: 59.98,
    shipping_address: 'Av. Libertador, Caracas, Venezuela',
    payment_method: 'zelle',
    items: [
      {
        product_variant_id: '2',
        quantity: 2,
        price: 29.99
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];