'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategorySelectProps {
  control: Control<any>;
  name: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function CategorySelect({ control, name, onCategoryChange }: CategorySelectProps) {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Category[];
    }
  });

  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría Principal</FormLabel>
          <FormControl>
            <Select
              value={field.value || ''}
              onValueChange={(value) => {
                field.onChange(value);
                onCategoryChange?.(value);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {mainCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}