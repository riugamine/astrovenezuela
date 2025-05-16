import { create } from 'zustand';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface FilterState {
  selectedCategories: string[];
  sortBy: SortOption | null;
  priceRange: [number, number];
  tempPriceRange: [number, number];
  tempSelectedCategories: string[];
  isDirty: boolean;
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (categoryId: string) => void;
  setSortBy: (option: SortOption) => void;
  setTempPriceRange: (range: [number, number]) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  cancelChanges: () => void;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  selectedCategories: [],
  tempSelectedCategories: [],
  sortBy: null,
  priceRange: [0, 200],
  tempPriceRange: [0, 200],
  isDirty: false,
  setSelectedCategories: (categories) => set({ 
    tempSelectedCategories: [...categories],
    isDirty: true
  }),
  toggleCategory: (categoryId) =>
    set((state) => ({
      tempSelectedCategories: state.tempSelectedCategories.includes(categoryId)
        ? state.tempSelectedCategories.filter((id) => id !== categoryId)
        : [...state.tempSelectedCategories, categoryId],
      isDirty: true
    })),
  setSortBy: (option) => set({ sortBy: option }),
  setTempPriceRange: (range) => set({ 
    tempPriceRange: [...range] as [number, number],
    isDirty: true
  }),
  applyFilters: () => set((state) => ({ 
    priceRange: [...state.tempPriceRange] as [number, number],
    selectedCategories: [...state.tempSelectedCategories],
    isDirty: false
  })),
  cancelChanges: () => set((state) => ({
    tempPriceRange: [...state.priceRange] as [number, number],
    tempSelectedCategories: [...state.selectedCategories],
    isDirty: false
  })),
  resetFilters: () => set({ 
    selectedCategories: [], 
    tempSelectedCategories: [],
    sortBy: null, 
    priceRange: [0, 200],
    tempPriceRange: [0, 200],
    isDirty: false
  }),
}));