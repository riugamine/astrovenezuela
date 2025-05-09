'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function ProductManagement() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Productos</h1>
        <Button onClick={() => setIsCreating(true)}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {isCreating ? (
        <ProductForm onClose={() => setIsCreating(false)} />
      ) : (
        <ProductList />
      )}
    </div>
  );
}