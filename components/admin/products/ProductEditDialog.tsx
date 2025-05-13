'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductForm } from './ProductForm';

interface ProductEditDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductEditDialog({ product, isOpen, onClose }: ProductEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl md:text-2xl">
            Editar Producto
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Modifica los detalles del producto. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[calc(90vh-100px)] px-6 pb-6">
          <ProductForm 
            initialData={{
              ...product,
              price: Number(product.price),
              isEditing: true,
            }}
            onClose={onClose}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}