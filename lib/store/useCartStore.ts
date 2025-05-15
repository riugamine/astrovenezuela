import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image_url: string;
  variant_id: string;
  max_stock: number;
  slug: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem) => void;
  removeItem: (variant_id: string) => void;
  updateQuantity: (variant_id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.variant_id === item.variant_id
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              item.max_stock
            );

            return {
              items: state.items.map((i) =>
                i.variant_id === item.variant_id
                  ? { ...i, quantity: newQuantity }
                  : i
              ),
              totalItems:
                state.totalItems + (newQuantity - existingItem.quantity),
            };
          }

          return {
            items: [...state.items, item],
            totalItems: state.totalItems + item.quantity,
          };
        }),
      removeItem: (variant_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.variant_id !== variant_id),
          totalItems:
            state.totalItems -
            (state.items.find((i) => i.variant_id === variant_id)?.quantity || 0),
        })),
      updateQuantity: (variant_id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.variant_id === variant_id);
          if (!item) return state;

          const newQuantity = Math.min(Math.max(1, quantity), item.max_stock);

          return {
            items: state.items.map((i) =>
              i.variant_id === variant_id
                ? { ...i, quantity: newQuantity }
                : i
            ),
            totalItems:
              state.totalItems - item.quantity + newQuantity,
          };
        }),
      clearCart: () => set({ items: [], totalItems: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
);