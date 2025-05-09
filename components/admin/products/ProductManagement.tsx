'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductForm } from './ProductForm';
import { ProductList } from './ProductList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductManagement() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isCreating && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsCreating(false)}
                  className="mr-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold">
                {isCreating ? 'Nuevo Producto' : 'Gestión de Productos'}
              </h1>
            </div>
            
            {!isCreating && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="w-full sm:w-auto"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Nuevo Producto
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        <motion.div
          key={isCreating ? 'form' : 'list'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {isCreating ? (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <ProductForm onClose={() => setIsCreating(false)} />
              </CardContent>
            </Card>
          ) : (
            <ProductList />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}