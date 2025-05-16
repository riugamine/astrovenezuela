import { create } from 'zustand';
import { Category } from '@/lib/types/database.types';
import { getCategories } from '@/lib/data/categories';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const categories = await getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
}));