import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faPencilAlt, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProductActionsProps {
  product: any; // Reemplazar con el tipo correcto de Product
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const ProductActions: FC<ProductActionsProps> = ({
  product,
  onEdit,
  onDelete,
  onView
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onView} className="cursor-pointer">
          <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
          Ver Detalles
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600 cursor-pointer">
          <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};