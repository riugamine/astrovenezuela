'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAPI } from "@/lib/api/products";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface ProductDeleteDialogProps {
  productId: string;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDeleteDialog({
  productId,
  productName,
  isOpen,
  onClose,
}: ProductDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteProduct = useMutation({
    mutationFn: async () => {
      await deleteProductAPI(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado exitosamente');
      onClose();
    },
    onError: (error) => {
      console.error('Error al eliminar el producto:', error);
      toast.error('Error al eliminar el producto');
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Producto</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el producto {productName}? Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteProduct.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteProduct.mutate()}
            disabled={deleteProduct.isPending}
          >
            {deleteProduct.isPending ? (
              <>
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="animate-spin mr-2"
                />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}