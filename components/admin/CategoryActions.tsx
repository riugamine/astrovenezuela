import { FC } from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Category } from '@/lib/types/category';

interface CategoryActionsProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoryActions: FC<CategoryActionsProps> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2">
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