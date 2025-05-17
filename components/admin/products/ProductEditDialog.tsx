'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductFormEdit } from './ProductFormEdit';

interface ProductEditDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductEditDialog({ product, isOpen, onClose }: ProductEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90%] lg:max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-xl md:text-2xl">
            Editar Producto
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Modifica los detalles del producto. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6 max-h-[300px] sm:max-h-[400px] lg:max-h-[700px]">
          <ProductFormEdit
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