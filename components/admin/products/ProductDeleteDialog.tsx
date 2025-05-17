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
import { supabaseAdmin } from "@/lib/supabase/admin";
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
      // Primero eliminamos las imágenes de detalle
      const { error: imagesError } = await supabaseAdmin
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      if (imagesError) throw imagesError;

      // Luego eliminamos las variantes
      const { error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', productId);

      if (variantsError) throw variantsError;

      // Finalmente eliminamos el producto
      const { error: productError } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', productId);

      if (productError) throw productError;
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
            ¿Estás seguro de que deseas eliminar el producto "{productName}"? Esta
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