'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUploader } from './ImageUploader';
import { VariantForm } from './VariantForm';
import { CategorySelect } from './CategorySelect';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().positive('El precio debe ser mayor a 0'),
  reference_number: z.string().min(1, 'El número de referencia es requerido'),
  category_id: z.string().min(1, 'La categoría es requerida'),
  main_image_url: z.string().url('La imagen principal es requerida'),
  detail_images: z.array(z.object({
    id: z.string(),
    image_url: z.string().url(),
    order_index: z.number()
  })).max(10, 'Máximo 10 imágenes de detalle'),
  variants: z.array(z.object({
    size: z.string(),
    color: z.string(),
    stock: z.number().int().positive()
  }))
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onClose: () => void;
  initialData?: ProductFormData;
}

export function ProductForm({ onClose, initialData }: ProductFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      detail_images: [],
      variants: []
    }
  });

  const createProduct = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Crear el producto
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .insert([{
          name: data.name,
          description: data.description,
          price: data.price,
          reference_number: data.reference_number,
          category_id: data.category_id,
          main_image_url: data.main_image_url,
          slug: data.name.toLowerCase().replace(/\s+/g, '-')
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Insertar imágenes de detalle
      if (data.detail_images.length > 0) {
        const { error: imagesError } = await supabaseAdmin
          .from('product_images')
          .insert(
            data.detail_images.map(img => ({
              ...img,
              product_id: product.id
            }))
          );

        if (imagesError) throw imagesError;
      }

      // Insertar variantes
      if (data.variants.length > 0) {
        const { error: variantsError } = await supabaseAdmin
          .from('product_variants')
          .insert(
            data.variants.map(variant => ({
              ...variant,
              product_id: product.id
            }))
          );

        if (variantsError) throw variantsError;
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error al crear el producto:', error);
      toast.error('Error al crear el producto');
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    createProduct.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Referencia</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <CategorySelect {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imágenes</h3>
          <ImageUploader
            mainImage={form.watch('main_image_url')}
            detailImages={form.watch('detail_images')}
            onMainImageChange={(url) => form.setValue('main_image_url', url)}
            onDetailImagesChange={(images) => form.setValue('detail_images', images)}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variantes</h3>
          <VariantForm
            variants={form.watch('variants')}
            onChange={(variants) => form.setValue('variants', variants)}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Producto
          </Button>
        </div>
      </form>
    </Form>
  );
}