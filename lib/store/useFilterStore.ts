import { create } from 'zustand';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface FilterState {
  selectedCategories: string[];
  sortBy: SortOption | null;
  priceRange: [number, number];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (categoryId: string) => void;
  setSortBy: (option: SortOption) => void;
  setPriceRange: (range: [number, number]) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategories: [],
  sortBy: null,
  priceRange: [0, 200],
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  toggleCategory: (categoryId) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(categoryId)
        ? state.selectedCategories.filter((id) => id !== categoryId)
        : [...state.selectedCategories, categoryId],
    })),
  setSortBy: (option) => set({ sortBy: option }),
  setPriceRange: (range) => set({ priceRange: range }),
  resetFilters: () => set({ selectedCategories: [], sortBy: null, priceRange: [0, 200] }),
}));