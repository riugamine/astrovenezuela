/**
 * Datos estáticos para los productos
 */
export const products = [
  {
    id: '1',
    name: 'Camiseta Sport Pro',
    slug: 'camiseta-sport-pro',
    description: 'Camiseta deportiva de alto rendimiento con tecnología de secado rápido',
    price: 29.99,
    category_id: '1',
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/camiseta-sport-pro.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Shorts Training Elite',
    slug: 'shorts-training-elite',
    description: 'Shorts deportivos con tejido transpirable y bolsillos laterales',
    price: 34.99,
    category_id: '1',
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/shorts-training-elite.jpg',
    created_at: new Date().toISOString()
  }
];