/**
 * Datos estáticos para las variantes de productos
 */
export const productVariants = [
  {
    id: '1',
    product_id: '1',
    size: 'M',
    color: 'Negro',
    stock: 10,
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/variants/camiseta-sport-pro-negro-m.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    product_id: '1',
    size: 'L',
    color: 'Negro',
    stock: 15,
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/variants/camiseta-sport-pro-negro-l.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    product_id: '2',
    size: 'M',
    color: 'Azul',
    stock: 8,
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/variants/shorts-training-elite-azul-m.jpg',
    created_at: new Date().toISOString()
  }
];