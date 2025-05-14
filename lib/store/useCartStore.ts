import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderStatus, PaymentMethod } from '../types/database.types';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image_url: string;
  variant_id: string;
  max_stock: number;
  slug: string; // Añadimos el slug para la navegación
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
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
            (i) => i.id === item.id && i.size === item.size
          );

          if (existingItem) {
            const newQuantity = Math.min(
              existingItem.quantity + item.quantity,
              item.max_stock
            );

            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size
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
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.size === size)
          ),
          totalItems:
            state.totalItems -
            (state.items.find((i) => i.id === id && i.size === size)?.quantity ||
              0),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => {
          const item = state.items.find(
            (i) => i.id === id && i.size === size
          );
          if (!item) return state;

          const newQuantity = Math.min(Math.max(1, quantity), item.max_stock);

          return {
            items: state.items.map((i) =>
              i.id === id && i.size === size
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