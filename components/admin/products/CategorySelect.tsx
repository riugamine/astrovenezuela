'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control, UseFormGetValues, UseFormSetValue } from 'react-hook-form';

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategorySelectProps {
  control: Control<any>;
  name: string;
  setValue: UseFormSetValue<any>;
  getValues: UseFormGetValues<any>;
}

export function CategorySelect({ control, name, setValue, getValues }: CategorySelectProps) {
  // Consulta para obtener todas las categorías
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

  // Filtrar categorías principales y subcategorías
  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={`${name}.categoryId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría Principal</FormLabel>
            <FormControl>
              <Select
                value={field.value || ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Resetear subcategoría cuando cambia la categoría principal
                  setValue(`${name}.subcategoryId`, undefined);
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

      <FormField
        control={control}
        name={`${name}.subcategoryId`}
        render={({ field }) => {
          // Usar getValues para obtener el valor actual de categoryId
          const formValues = getValues();
          const selectedCategoryId = formValues[name]?.categoryId;
          const subcategories = categories.filter(cat => cat.parent_id === selectedCategoryId);
          
          if (!selectedCategoryId) return <div />;

          return (
            <FormItem>
              <FormLabel>Subcategoría (Opcional)</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
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
          );
        }}
      />
    </div>
  );
}