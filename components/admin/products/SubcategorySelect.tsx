'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { getSubcategories } from '@/lib/data/admin/actions/categories';

interface SubcategorySelectProps {
  control: Control<any>;
  name: string;
  parentCategoryId?: string;
}

export function SubcategorySelect({ control, name, parentCategoryId }: SubcategorySelectProps) {
  const { data: subcategories = [], isLoading, isError } = useQuery({
    queryKey: ['subcategories', parentCategoryId],
    queryFn: async () => {
      if (!parentCategoryId) return [];
      return getSubcategories(parentCategoryId);
    },
    enabled: !!parentCategoryId,
  });

  if (!parentCategoryId) {
    return null;
  }

  if (isError) {
    return (
      <FormField
        control={control}
        name={name}
        render={() => (
          <FormItem>
            <FormLabel>Subcategoría (Opcional)</FormLabel>
            <div className="text-sm text-red-600">
              Error al cargar las subcategorías. Por favor, selecciona otra categoría.
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
          <FormLabel>Subcategoría (Opcional)</FormLabel>
          <FormControl>
            <Select
              value={field.value || 'none'}
              onValueChange={(value) => {
                field.onChange(value === 'none' ? '' : value);
              }}
              disabled={isLoading}
            >
              <SelectTrigger className={isLoading ? 'animate-pulse' : ''}>
                <SelectValue placeholder={
                  isLoading 
                    ? "Cargando subcategorías..." 
                    : subcategories.length === 0 
                      ? "No hay subcategorías disponibles"
                      : "Selecciona una subcategoría"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin subcategoría</SelectItem>
                {!isLoading && subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
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