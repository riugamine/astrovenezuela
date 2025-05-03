/**
 * Datos estáticos para las categorías de productos
 */
export const categories = [
  {
    id: '1',
    name: 'Entrenamiento',
    slug: 'entrenamiento',
    parent_id: null,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'CrossFit',
    slug: 'crossfit',
    parent_id: '1',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Gimnasio',
    slug: 'gimnasio',
    parent_id: '1',
    created_at: new Date().toISOString()
  }
];