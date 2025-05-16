'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { getSubcategories } from '@/lib/data/admin/actions/categories';
interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface SubcategorySelectProps {
  control: Control<any>;
  name: string;
  parentCategoryId?: string;
}

export function SubcategorySelect({ control, name, parentCategoryId }: SubcategorySelectProps) {
  const { data: subcategories = [], isLoading } = useQuery({
    queryKey: ['subcategories', parentCategoryId],
    queryFn: async () => {
      if (!parentCategoryId) return [];
      return getSubcategories(parentCategoryId);
    },
  });

  if (!parentCategoryId) {
    return null;
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
              value={field.value || "none"}  // Cambiamos el valor por defecto a "none"
              onValueChange={(value) => {
                field.onChange(value === "none" ? "" : value); // Convertimos "none" a "" cuando se envía el formulario
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
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
                {subcategories.map((subcategory) => (
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