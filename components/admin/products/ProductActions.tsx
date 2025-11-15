'use client';

import { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faPencilAlt, faEye, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductViewDialog } from './ProductViewDialog';
import { useQueryClient } from '@tanstack/react-query';
import { ProductWithRelations } from '@/lib/data/admin/actions/products/types';
import { ProductEditDialog } from './ProductEditDialog';
import { toggleProductStatusAPI } from '@/lib/api/products';
import { toast } from 'sonner';

interface ProductActionsProps {
  product: ProductWithRelations;
}

export const ProductActions: FC<ProductActionsProps> = ({ product }) => {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  // Manejadores actualizados para cerrar el dropdown
  const handleViewClick = () => {
    setIsViewOpen(true);
    setIsDropdownOpen(false);
  };

  const handleEditClick = () => {
    setIsEditOpen(true);
    setIsDropdownOpen(false);
  };


  const handleToggleActive = async () => {
    try {
      await toggleProductStatusAPI(product.id, !product.is_active);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Producto ${product.is_active ? 'desactivado' : 'activado'} exitosamente`);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error al cambiar estado del producto:', error);
      toast.error('Error al cambiar estado del producto');
    }
  };

  // Manejadores para cerrar los diálogos
  const handleViewClose = () => {
    setIsViewOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleEditClose = () => {
    setIsEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };


  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleViewClick}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleEditClick}
            className="cursor-pointer"
          >
            <FontAwesomeIcon icon={faPencilAlt} className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleToggleActive}
            className="cursor-pointer"
          >
            <FontAwesomeIcon 
              icon={product.is_active ? faToggleOff : faToggleOn} 
              className="mr-2 h-4 w-4" 
            />
            {product.is_active ? 'Desactivar' : 'Activar'}
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

    </>
  );
};