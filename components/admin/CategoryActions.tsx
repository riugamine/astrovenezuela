import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisVertical, 
  faPencilAlt, 
  faTrash, 
  faPlus 
} from '@fortawesome/free-solid-svg-icons';
import type { Category } from '@/lib/types/category';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoryActionsProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSubcategory: (category: Category) => void;
}

const CategoryActions: FC<CategoryActionsProps> = ({
  category,
  onEdit,
  onDelete,
  onAddSubcategory
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!category.parent_id && (
          <DropdownMenuItem
            onClick={() => onAddSubcategory(category)}
            className="text-blue-600 cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
            Agregar Subcategoría
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onEdit(category)}
          className="cursor-pointer"
        >
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(category)}
          className="text-red-600 cursor-pointer"
        >
          <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryActions;