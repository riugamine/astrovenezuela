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
  
  // URL sync actions
  setFiltersFromURL: (params: URLSearchParams | null | undefined) => void;
  getURLParams: () => URLSearchParams;
  syncToURL: () => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
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
    set((state) => {
      const newState = {
        selectedCategories: [...state.tempSelectedCategories],
        selectedSizes: [...state.tempSelectedSizes],
        sortBy: state.tempSortBy,
        priceRange: [...state.tempPriceRange] as [number, number],
        isDirty: false,
      };
      
      // Sync to URL after applying filters
      setTimeout(() => get().syncToURL(), 0);
      
      return newState;
    }),

  cancelChanges: () =>
    set((state) => ({
      tempSelectedCategories: [...state.selectedCategories],
      tempSelectedSizes: [...state.selectedSizes],
      tempSortBy: state.sortBy,
      tempPriceRange: [...state.priceRange] as [number, number],
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

  // URL sync methods
  setFiltersFromURL: (params) => {
    // Handle the case where params is null/undefined (e.g., accessing /products directly)
    if (!params) {
      // Reset to default state when no params provided
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
      });
      return;
    }

    // Ensure params is a valid URLSearchParams object with get method
    if (typeof params.get !== 'function') {
      console.warn('setFiltersFromURL: Invalid params object provided');
      // Reset to default state when invalid params provided
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
      });
      return;
    }

    try {
      const categories = params.get('categories')?.split(',').filter(Boolean) || [];
      const sizes = (params.get('sizes')?.split(',').filter(Boolean) || []) as Size[];
      const sortBy = (params.get('sort') as SortOption) || 'newest';
      const minPrice = parseInt(params.get('min_price') || '0');
      const maxPrice = parseInt(params.get('max_price') || '1000');
      
      // Ensure valid price range
      const validMinPrice = isNaN(minPrice) ? 0 : Math.max(0, minPrice);
      const validMaxPrice = isNaN(maxPrice) ? 1000 : Math.max(validMinPrice, maxPrice);
      
      set({
        selectedCategories: categories,
        selectedSizes: sizes,
        sortBy,
        priceRange: [validMinPrice, validMaxPrice],
        tempSelectedCategories: [...categories],
        tempSelectedSizes: [...sizes],
        tempSortBy: sortBy,
        tempPriceRange: [validMinPrice, validMaxPrice],
        isDirty: false,
      });
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      // Reset to default state on error
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
      });
    }
  },

  getURLParams: () => {
    const state = get();
    const params = new URLSearchParams();
    
    if (state.selectedCategories.length > 0) {
      params.set('categories', state.selectedCategories.join(','));
    }
    
    if (state.selectedSizes.length > 0) {
      params.set('sizes', state.selectedSizes.join(','));
    }
    
    if (state.sortBy !== 'newest') {
      params.set('sort', state.sortBy);
    }
    
    if (state.priceRange[0] !== 0) {
      params.set('min_price', state.priceRange[0].toString());
    }
    
    if (state.priceRange[1] !== 1000) {
      params.set('max_price', state.priceRange[1].toString());
    }
    
    return params;
  },

  syncToURL: () => {
    if (typeof window === 'undefined') return;
    
    const params = get().getURLParams();
    const newURL = new URL(window.location.href);
    
    // Clear existing filter params
    ['categories', 'sizes', 'sort', 'min_price', 'max_price'].forEach(key => {
      newURL.searchParams.delete(key);
    });
    
    // Add new params
    params.forEach((value, key) => {
      newURL.searchParams.set(key, value);
    });
    
    // Update URL without triggering page reload
    window.history.replaceState({}, '', newURL.toString());
  },
}));