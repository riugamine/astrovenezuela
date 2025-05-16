import { create } from 'zustand';

type Size = 'Única' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

interface FilterState {
  // Applied states
  selectedCategories: string[];
  selectedSizes: Size[];
  sortBy: SortOption;
  priceRange: [number, number];

  // Temporary states
  tempSelectedCategories: string[];
  tempSelectedSizes: Size[];
  tempSortBy: SortOption;
  tempPriceRange: [number, number];

  // Dirty state
  isDirty: boolean;

  // Actions
  toggleCategory: (categoryId: string) => void;
  toggleSize: (size: Size) => void;
  setSortBy: (sort: SortOption) => void;
  setTempPriceRange: (range: [number, number]) => void;
  applyFilters: () => void;
  cancelChanges: () => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Applied states
  selectedCategories: [],
  selectedSizes: [],
  sortBy: 'newest',
  priceRange: [0, 1000],

  // Temporary states
  tempSelectedCategories: [],
  tempSelectedSizes: [],
  tempSortBy: 'newest',
  tempPriceRange: [0, 1000],

  // Dirty state
  isDirty: false,

  // Actions
  toggleCategory: (categoryId) =>
    set((state) => {
      const newTempCategories = state.tempSelectedCategories.includes(categoryId)
        ? state.tempSelectedCategories.filter((id) => id !== categoryId)
        : [...state.tempSelectedCategories, categoryId];

      const isDirty =
        newTempCategories.length !== state.selectedCategories.length ||
        newTempCategories.some((cat) => !state.selectedCategories.includes(cat)) ||
        state.selectedCategories.some((cat) => !newTempCategories.includes(cat)) ||
        state.tempSelectedSizes.length !== state.selectedSizes.length ||
        state.tempPriceRange.some((v, i) => v !== state.priceRange[i]) ||
        state.tempSortBy !== state.sortBy;

      return {
        tempSelectedCategories: newTempCategories,
        isDirty,
      };
    }),

  toggleSize: (size) =>
    set((state) => {
      const newTempSizes = state.tempSelectedSizes.includes(size)
        ? state.tempSelectedSizes.filter((s) => s !== size)
        : [...state.tempSelectedSizes, size];

      const isDirty =
        state.tempSelectedCategories.length !== state.selectedCategories.length ||
        state.tempSelectedCategories.some((cat) => !state.selectedCategories.includes(cat)) ||
        newTempSizes.length !== state.selectedSizes.length ||
        newTempSizes.some((s) => !state.selectedSizes.includes(s)) ||
        state.tempPriceRange.some((v, i) => v !== state.priceRange[i]) ||
        state.tempSortBy !== state.sortBy;

      return {
        tempSelectedSizes: newTempSizes,
        isDirty,
      };
    }),

  setSortBy: (sortBy) =>
    set((state) => ({
      tempSortBy: sortBy,
      isDirty:
        state.tempSelectedCategories.length !== state.selectedCategories.length ||
        state.tempSelectedCategories.some((cat) => !state.selectedCategories.includes(cat)) ||
        state.tempSelectedSizes.length !== state.selectedSizes.length ||
        state.tempSelectedSizes.some((s) => !state.selectedSizes.includes(s)) ||
        state.tempPriceRange.some((v, i) => v !== state.priceRange[i]) ||
        sortBy !== state.sortBy,
    })),

  setTempPriceRange: (range) =>
    set((state) => ({
      tempPriceRange: range,
      isDirty:
        state.tempSelectedCategories.length !== state.selectedCategories.length ||
        state.tempSelectedCategories.some((cat) => !state.selectedCategories.includes(cat)) ||
        state.tempSelectedSizes.length !== state.selectedSizes.length ||
        state.tempSelectedSizes.some((s) => !state.selectedSizes.includes(s)) ||
        range.some((v, i) => v !== state.priceRange[i]) ||
        state.tempSortBy !== state.sortBy,
    })),

  applyFilters: () =>
    set((state) => ({
      selectedCategories: [...state.tempSelectedCategories],
      selectedSizes: [...state.tempSelectedSizes],
      sortBy: state.tempSortBy,
      priceRange: [...state.tempPriceRange],
      isDirty: false,
    })),

  cancelChanges: () =>
    set((state) => ({
      tempSelectedCategories: [...state.selectedCategories],
      tempSelectedSizes: [...state.selectedSizes],
      tempSortBy: state.sortBy,
      tempPriceRange: [...state.priceRange],
      isDirty: false,
    })),

  resetFilters: () =>
    set({
      selectedCategories: [],
      selectedSizes: [],
      sortBy: 'newest',
      priceRange: [0, 1000],
      tempSelectedCategories: [],
      tempSelectedSizes: [],
      tempSortBy: 'newest',
      tempPriceRange: [0, 1000],
      isDirty: false,
    }),
}));