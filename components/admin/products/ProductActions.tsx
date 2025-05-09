'use client';

import { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faPencilAlt, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductViewDialog } from './ProductViewDialog';
import { ProductDeleteDialog } from './ProductDeleteDialog';
import { useQueryClient } from '@tanstack/react-query';
import { Product } from '@/lib/types/database.types';
interface ProductActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  product: Product; // Reemplazar con el tipo correcto cuando esté disponible
  onView: () => void;
}

export const ProductActions: FC<ProductActionsProps> = ({ product }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleClose = () => {
    setIsViewOpen(false);
    setIsDeleteOpen(false);
    // Resetear el caché de productos para actualizar los índices
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setIsViewOpen(true)}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => window.location.href = `/admin/products/edit/${product.id}`}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={faPencilAlt} className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 cursor-pointer"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProductViewDialog
        product={product}
        isOpen={isViewOpen}
        onClose={handleClose}
      />

      <ProductDeleteDialog
        productId={product.id}
        productName={product.name}
        isOpen={isDeleteOpen}
        onClose={handleClose}
      />
    </>
  );
};