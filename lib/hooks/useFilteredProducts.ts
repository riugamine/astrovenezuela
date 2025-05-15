import { useQuery } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabase/client';
import { useFilterStore } from '@/lib/store/useFilterStore';
import { Product, ProductDetailImage, ProductVariant } from '@/lib/types/database.types';

export function useFilteredProducts() {
  const { selectedCategories, sortBy, priceRange } = useFilterStore();

  return useQuery({
    queryKey: ['products', { selectedCategories, sortBy, priceRange }],
    queryFn: async () => {
      // First, get all subcategories for selected parent categories
      let allCategories = [...selectedCategories];
      
      if (selectedCategories.length > 0) {
        const { data: subcategories } = await supabaseClient
          .from('categories')
          .select('id')
          .eq('is_active', true)
          .in('parent_id', selectedCategories);

        if (subcategories) {
          allCategories = [...allCategories, ...subcategories.map(cat => cat.id)];
        }
      }

      let query = supabaseClient
        .from('products')
        .select(`
          *,
          product_images (id, product_id, image_url, order_index),
          variants:product_variants (id, size, stock),
          category:category_id (id, name, slug, parent_id)
        `)
        .eq('is_active', true)
        .gte('price', priceRange[0])
        .lte('price', priceRange[1]);

      if (allCategories.length > 0) {
        query = query.in('category_id', allCategories);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Product & {
        product_images: ProductDetailImage[];
        variants: ProductVariant[];
      })[];
    },
  });
}