"use client";

import { useEffect, useState } from "react";
import {useQuery} from '@tanstack/react-query';
import { getCategories, getSubcategories } from '@/lib/data/admin/actions/categories';
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ImageUploaderEdit } from "./ImageUploaderEdit";
import { VariantFormEdit } from "./VariantFormEdit";
import { CategorySelect } from "./CategorySelect";
import { SubcategorySelect } from "./SubcategorySelect";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProduct, getProductCategoryDetails, getCategoryDetails } from '@/lib/data/admin/actions/products';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { type ProductData } from '@/lib/data/admin/actions/products/types';

// Define the schemas for editing
const editVariantSchema = z.object({
  id: z.string(),
  size: z.string(),
  stock: z.number().int().positive("El stock debe ser un número entero positivo"),
  product_id: z.string()
});

const editProductImageSchema = z.object({
  id: z.string(),
  image_url: z.string().url(),
  order_index: z.number(),
  product_id: z.string()
});

const editProductSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  reference_number: z.string().min(1, "El número de referencia es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  subcategory_id: z.string().optional(),
  main_image_url: z.string().url("La imagen principal es requerida"),
  is_active: z.boolean(),
  slug: z.string(),
  stock: z.number(),
  product_images: z.array(editProductImageSchema),
  variants: z.array(editVariantSchema)
    .min(1, "Debe agregar al menos una variante con talla y stock")
    .refine(
      (variants) => variants.reduce((total, variant) => total + variant.stock, 0) > 0,
      "El stock total debe ser mayor a 0"
    ),
  updated_at: z.string()
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface ProductFormEditProps {
  onClose: () => void;
  initialData: ProductData;
}

export function ProductFormEdit({ onClose, initialData }: ProductFormEditProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  
  const form = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      ...initialData,
      product_images: initialData.product_images || [],
      variants: initialData.variants || []
    }
  });

  // Query para cargar las categorías
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // Query para cargar las subcategorías cuando se selecciona una categoría
  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['subcategories', form.watch('category_id')],
    queryFn: () => getSubcategories(form.watch('category_id')),
    enabled: !!form.watch('category_id')
  });

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setIsLoading(true);
        const categoryDetails = await getProductCategoryDetails(initialData.id);

        if (categoryDetails.parent_id) {
          form.setValue('category_id', categoryDetails.parent_id);
          form.setValue('subcategory_id', categoryDetails.category_id);
        } else {
          form.setValue('category_id', categoryDetails.category_id);
        }
      } catch (error) {
        console.error('Error al cargar datos de la categoría:', error);
        toast.error('Error al cargar datos de la categoría');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [initialData.id, form]);

  // Determinar si el formulario está listo para editar
  const isFormReady = !isLoading && !categoriesLoading && 
    (!form.watch('category_id') || !subcategoriesLoading);

  if (!isFormReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando datos del producto...</span>
      </div>
    );
  }
  const updateProductMutation = useMutation({
    mutationFn: async (data: EditProductFormData) => {
      const totalStock = data.variants.reduce((sum, variant) => sum + variant.stock, 0);
      
      const submitData = {
        ...data,
        stock: totalStock,
        updated_at: new Date().toISOString()
      };

      return updateProduct(data.id, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado exitosamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  });

  const onSubmit = (data: EditProductFormData) => {
    updateProductMutation.mutate(data);
  };

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        const categoryDetails = await getProductCategoryDetails(initialData.id);

        if (categoryDetails.parent_id) {
          form.setValue('category_id', categoryDetails.parent_id);
          form.setValue('subcategory_id', categoryDetails.category_id);
        } else {
          form.setValue('category_id', categoryDetails.category_id);
        }
      } catch (error) {
        console.error('Error al cargar datos de la categoría:', error);
        toast.error('Error al cargar datos de la categoría');
      }
    };

    loadCategoryData();
  }, [initialData.id, form]);
  const handleCategoryChange = async (categoryId: string) => {
    try {
      // Get the category details to check if it's a main category or subcategory
      const categoryDetails = await getCategoryDetails(categoryId);
  
      if (categoryDetails.parent_id) {
        // If it has a parent_id, it's a subcategory
        form.setValue('subcategory_id', categoryId);
        form.setValue('category_id', categoryDetails.parent_id);
      } else {
        // If it doesn't have a parent_id, it's a main category
        form.setValue('category_id', categoryId);
        form.setValue('subcategory_id', ''); // Clear subcategory when selecting a main category
      }
  
      // Trigger validation after setting values
      await form.trigger(['category_id', 'subcategory_id']);
    } catch (error) {
      console.error('Error getting category details:', error);
      toast.error('Error al cambiar la categoría');
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Información Básica
            </h2>
            <div className="text-sm text-gray-500">* Campos requeridos</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Camisa Casual"
                      {...field}
                    />
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
                  <FormLabel>Número de Referencia *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: REF-001"
                      {...field}
                    />
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
                  <FormLabel>Precio *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FontAwesomeIcon
                        icon={faDollarSign}
                        className="absolute left-3 top-1/4 -translate-y-1/2 text-gray-500 text-sm"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <CategorySelect
                control={form.control}
                name="category_id" 
                onCategoryChange={handleCategoryChange}
              />

              <SubcategorySelect
                control={form.control}
                name="subcategory_id"
                parentCategoryId={form.watch("category_id")}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe las características principales del producto..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Imágenes</h2>
          <Card>
            <CardContent className="p-6">
              <ImageUploaderEdit
                mainImage={form.watch("main_image_url")}
                detailImages={form.watch("product_images")}
                onMainImageChange={(url) =>
                  form.setValue("main_image_url", url)
                }
                onDetailImagesChange={(images) =>
                  form.setValue("product_images", images)
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Variants Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Variantes</h2>
          <Card>
            <CardContent className="p-6">
              <VariantFormEdit
                variants={form.watch("variants")}
                onChange={(variants) => form.setValue("variants", variants)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-white border-t py-4 px-6 -mx-6 mt-8">
          <div className="flex justify-end gap-4 max-w-[1400px] mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-w-[100px]"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin mr-2"
                  />
                  Guardando...
                </>
              ) : (
                "Guardar Producto"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}