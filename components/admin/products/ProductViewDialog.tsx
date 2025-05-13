'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Product, ProductVariant, ProductDetailImage } from "@/lib/types/database.types";
interface ProductViewDialogProps {
  product: Product & {
    variants?: ProductVariant[];
    product_images?: ProductDetailImage[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProductViewDialog({ product, isOpen, onClose }: ProductViewDialogProps) {
  if (!product) return null;

  // Manejador del evento de cierre
  const handleClose = () => {
    // Aseguramos que el estado se actualice correctamente
    if (isOpen) {
      onClose();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles del Producto</DialogTitle>
          <DialogDescription>
            Información detallada del producto y sus variantes
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            {/* Imagen Principal y Detalles Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={product.main_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{product.name}</h2>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ref: {product.reference_number}
                </p>
                <div className="prose max-w-none">
                  <p>{product.description}</p>
                </div>
              </div>
            </div>

            {/* Imágenes de Detalle */}
            {(product.product_images && product.product_images.length > 0) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Imágenes de Detalle</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.product_images.map((image: any, index: number) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image.image_url}
                        alt={`Detalle ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Variantes Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.variants.map((variant: ProductVariant) => (
                    <div
                      key={variant.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{variant.color}</p>
                          <p className="text-sm text-muted-foreground">
                            Talla: {variant.size}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          Stock: {variant.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}