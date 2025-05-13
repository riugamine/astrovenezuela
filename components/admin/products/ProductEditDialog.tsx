'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from './ProductForm';

interface ProductEditDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductEditDialog({ product, isOpen, onClose }: ProductEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>
            Modifica los detalles del producto. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>
        <ProductForm 
          initialData={{
            ...product,
            price: Number(product.price),
            isEditing:true,
          }}
          onClose={onClose}
          
        />
      </DialogContent>
    </Dialog>
  );
}