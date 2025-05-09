import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import type { Category } from '@/lib/types/category';

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
    <div className="flex space-x-2">
      {!category.parent_id && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSubcategory(category)}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Subcategoría
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(category)}
      >
        <FontAwesomeIcon icon={faEdit} className="mr-2" />
        Editar
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-500 hover:text-red-700"
        onClick={() => onDelete(category)}
      >
        <FontAwesomeIcon icon={faTrash} className="mr-2" />
        Eliminar
      </Button>
    </div>
  );
};

export default CategoryActions;