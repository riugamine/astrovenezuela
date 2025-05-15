import { create } from 'zustand';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface FilterState {
  selectedCategories: string[];
  sortBy: SortOption | null;
  priceRange: [number, number];
  tempPriceRange: [number, number];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (categoryId: string) => void;
  setSortBy: (option: SortOption) => void;
  setTempPriceRange: (range: [number, number]) => void;
  applyPriceRange: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedCategories: [],
  sortBy: null,
  priceRange: [0, 200],
  tempPriceRange: [0, 200],
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  toggleCategory: (categoryId) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(categoryId)
        ? state.selectedCategories.filter((id) => id !== categoryId)
        : [...state.selectedCategories, categoryId],
    })),
  setSortBy: (option) => set({ sortBy: option }),
  setTempPriceRange: (range) => set({ tempPriceRange: range }),
  applyPriceRange: () => set((state) => ({ priceRange: state.tempPriceRange })),
  resetFilters: () => set({ 
    selectedCategories: [], 
    sortBy: null, 
    priceRange: [0, 200],
    tempPriceRange: [0, 200]
  }),
}));