import { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Category } from '@/lib/types/category';

interface SubcategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentCategory: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  isLoading: boolean;
}

const subcategorySchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine(value => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
      message: "El nombre solo puede contener letras y espacios"
    }),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .optional(),
    parent_id: z.string().optional(),
  is_active: z.boolean().optional(),
  banner_url: z.string()
   .min(10, "La URL del banner debe tener al menos 10 caracteres")
   .optional(),
});

type CategoryFormData = z.infer<typeof subcategorySchema>;

export const SubcategoryDialog: FC<SubcategoryDialogProps> = ({
  isOpen,
  onClose,
  parentCategory,
  onSubmit,
  isLoading
}) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      is_active: true
    }
  });

  const handleFormSubmit = (data: CategoryFormData) => {
    if (!parentCategory) return;
    onSubmit({
      ...data,
      parent_id: parentCategory?.id
    });
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Subcategoría</DialogTitle>
          <DialogDescription>
            Añadir subcategoría a {parentCategory?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="banner_url">URL del Banner</Label>
              <Input id="banner_url" {...register('banner_url')} />
              {errors.banner_url && (
                <p className="text-sm text-red-500 mt-1">{errors.banner_url.message}</p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Subcategoría'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};