import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEllipsisVertical, 
  faPencilAlt,
  faToggleOn,
  faToggleOff,
  faPlus 
} from '@fortawesome/free-solid-svg-icons';
import type { Category } from '@/lib/data/admin/actions/categories/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CategoryActionsProps {
  category: Category;
  onEdit: (category: Category) => void;
  onToggleActive: (category: Category) => void;
  onAddSubcategory: (category: Category) => void;
}

const CategoryActions: FC<CategoryActionsProps> = ({
  category,
  onEdit,
  onToggleActive,
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
          onClick={() => onToggleActive(category)}
          className={`cursor-pointer ${category.is_active ? 'text-red-600' : 'text-green-600'}`}
        >
          <FontAwesomeIcon 
            icon={category.is_active ? faToggleOff : faToggleOn} 
            className="mr-2 h-4 w-4" 
          />
          {category.is_active ? 'Desactivar' : 'Activar'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategoryActions;