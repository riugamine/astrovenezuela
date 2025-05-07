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
    reference_number: 'SP-001',
    category_id: '1',
    main_image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/camiseta-sport-pro.jpg',
    detail_images: [
      {
        id: '1-1',
        image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/camiseta-sport-pro-detail-1.jpg',
        order_index: 1
      },
      {
        id: '1-2',
        image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/camiseta-sport-pro-detail-2.jpg',
        order_index: 2
      }
    ],
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Shorts Training Elite',
    slug: 'shorts-training-elite',
    description: 'Shorts deportivos con tejido transpirable y bolsillos laterales',
    price: 34.99,
    reference_number: 'SP-002',
    category_id: '1',
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/shorts-training-elite.jpg',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Medias Deportivas Pro',
    slug: 'medias-deportivas-pro',
    description: 'Medias deportivas con soporte de arco y tecnología anti-ampollas',
    price: 12.99,
    reference_number: 'SP-003',
    category_id: '2',
    image_url: 'https://mhldtcjzkmgolvqjwnro.supabase.co/storage/v1/products/medias-deportivas-pro.jpg',
    created_at: new Date().toISOString()
  }
];