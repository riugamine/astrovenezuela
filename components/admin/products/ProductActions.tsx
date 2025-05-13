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
import { ProductEditDialog } from './ProductEditDialog';
interface ProductActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  product: Product;
  onView: () => void;
}

export const ProductActions: FC<ProductActionsProps> = ({ product }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const queryClient = useQueryClient();

  // Separamos los manejadores para cada diálogo
  const handleViewClose = () => {
    setIsViewOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
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
            onClick={() => setIsEditOpen(true)}
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
        onClose={handleViewClose}
      />

      <ProductEditDialog
        product={product}
        isOpen={isEditOpen}
        onClose={handleEditClose}
      />

      <ProductDeleteDialog
        productId={product.id}
        productName={product.name}
        isOpen={isDeleteOpen}
        onClose={handleDeleteClose}
      />
    </>
  );
};