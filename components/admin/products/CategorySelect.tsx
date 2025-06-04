'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { getCategories } from '@/lib/data/admin/actions/categories';
import { CreateProductFormData } from './ProductForm'

interface CategorySelectProps {
  control: Control<any>;
  name: keyof CreateProductFormData;
  onCategoryChange?: (categoryId: string) => void;
}

export function CategorySelect({ control, name, onCategoryChange }: CategorySelectProps) {
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const mainCategories = categories.filter(cat => !cat.parent_id);

  if (isError) {
    return (
      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem>
            <FormLabel>Categoría Principal</FormLabel>
            <div className="text-sm text-red-600">
              Error al cargar las categorías. Por favor, recarga la página.
            </div>
          </FormItem>
        )}
      />
    );
  }

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
              <SelectTrigger className={isLoading ? 'animate-pulse' : ''}>
                <SelectValue placeholder={
                  isLoading 
                    ? "Cargando categorías..."
                    : mainCategories.length === 0
                      ? "No hay categorías disponibles"
                      : "Selecciona una categoría"
                } />
              </SelectTrigger>
              <SelectContent>
                {!isLoading && mainCategories.map((category) => (
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