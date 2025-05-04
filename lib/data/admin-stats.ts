/**
 * Datos estáticos para estadísticas del admin
 */
export const adminStats = {
  sales: {
    daily: 1250.00,
    weekly: 8750.50,
    monthly: 35000.00
  },
  inventory: {
    total_products: 25,
    low_stock_items: 3,
    out_of_stock: 1
  },
  orders: {
    pending: 5,
    processing: 3,
    completed: 12,
    cancelled: 1
  },
  top_products: [
    {
      id: '1',
      name: 'Camiseta Sport Pro',
      sales: 45
    },
    {
      id: '2',
      name: 'Shorts Training Elite',
      sales: 32
    }
  ]
};