import { create } from 'zustand';
import { Product } from '@/lib/types/database.types';
import { products as initialProducts } from '@/lib/data/products';

interface ProductStore {
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product) => void;
  getProductBySlug: (slug: string) => Product | null;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: initialProducts.map(product => ({
    ...product,
    stock: 10 // Valor por defecto para el stock
  })),
  selectedProduct: null,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  getProductBySlug: (slug: string): Product | null => {
    const product = get().products.find(p => p.slug === slug);
    if (product) {
      set({ selectedProduct: product });
    }
    return product || null;
  }
}));