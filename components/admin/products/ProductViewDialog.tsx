'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { ProductData, ProductVariant, ProductImage } from "@/lib/data/admin/actions/products/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faToggleOn, faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleProductStatus } from "@/lib/data/admin/actions/products";
import { toast } from "sonner";

interface ProductViewDialogProps {
  product: ProductData & {
    variants?: ProductVariant[];
    product_images?: ProductImage[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export function ProductViewDialog({ product, isOpen, onClose }: ProductViewDialogProps) {
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: () => toggleProductStatus(product.id, !product.is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        product.is_active 
          ? 'Producto desactivado exitosamente' 
          : 'Producto activado exitosamente'
      );
    },
    onError: (error) => {
      console.error('Error toggling product status:', error);
      toast.error('Error al cambiar el estado del producto');
    }
  });

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate();
  };

  const handleViewPublic = () => {
    const publicUrl = `${window.location.origin}/products/${product.slug}`;
    window.open(publicUrl, '_blank', 'noopener,noreferrer');
  };

  if (!product) return null;

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-4xl lg:max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl lg:text-2xl">Detalles del Producto</DialogTitle>
              <DialogDescription className="text-sm lg:text-base">
                Información detallada del producto y sus variantes
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1 max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Imagen Principal y Detalles Básicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Imagen Principal */}
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Imágenes de Detalle - Movidas aquí para mejor visibilidad */}
                {(product.product_images && product.product_images.length > 0) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-600">Imágenes de Detalle</h3>
                    <ScrollArea className="w-full">
                      <div className="flex gap-3 pb-2">
                        {product.product_images
                          .sort((a, b) => a.order_index - b.order_index)
                          .map((image) => (
                            <div
                              key={image.id}
                              className="relative aspect-square w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200 hover:border-primary transition-colors cursor-pointer"
                            >
                              <Image
                                src={image.image_url}
                                alt={`${product.name} - Imagen ${image.order_index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-semibold leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-2xl lg:text-3xl font-bold text-primary">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Información de Stock Detallada */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3">Información de Stock</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Stock Total</p>
                      <p className="text-2xl font-bold text-blue-900">{product.stock} unidades</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Variantes</p>
                      <p className="text-2xl font-bold text-blue-900">{product.variants?.length || 0} tallas</p>
                    </div>
                  </div>
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-600 mb-2">Stock por talla:</p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant) => (
                          <Badge 
                            key={variant.id}
                            variant={variant.stock > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {variant.size}: {variant.stock}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* URL del Producto */}
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">URL del Producto</h4>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border flex-1">
                      /products/{product.slug}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/products/${product.slug}`);
                        toast.success('URL copiada al portapapeles');
                      }}
                      className="text-xs"
                    >
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleViewPublic}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="h-4 w-4" />
                    Ver Producto en Público
                  </Button>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={handleToggleStatus}
                      disabled={toggleStatusMutation.isPending}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {product.is_active ? 'Desactivar' : 'Activar'} Producto
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.is_active 
                          ? 'El producto será ocultado del catálogo público' 
                          : 'El producto será visible en el catálogo público'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción con HTML renderizado */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Descripción</h3>
                  <ScrollArea className="max-h-60">
                    <div 
                      className="text-muted-foreground space-y-3 pr-4
                                 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4
                                 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mb-3
                                 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-2
                                 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-gray-900 [&_h4]:mb-2
                                 [&_h5]:text-sm [&_h5]:font-semibold [&_h5]:text-gray-900 [&_h5]:mb-1
                                 [&_h6]:text-xs [&_h6]:font-semibold [&_h6]:text-gray-900 [&_h6]:mb-1
                                 [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-3
                                 [&_strong]:font-semibold [&_strong]:text-gray-900
                                 [&_em]:italic [&_em]:text-gray-800
                                 [&_u]:underline
                                 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-3
                                 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-3
                                 [&_li]:mb-1 [&_li]:text-gray-700
                                 [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800 [&_a]:font-medium
                                 [&_div]:mb-2
                                 [&_span]:text-gray-700"
                      dangerouslySetInnerHTML={{ 
                        __html: sanitizeHtml(product.description || '') 
                      }}
                    />
                  </ScrollArea>
                </div>
              </div>
            </div>

            {/* Variantes Disponibles */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Variantes Disponibles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-4 rounded-lg border bg-card hover:bg-gray-50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">
                            Talla: {variant.size}
                          </p>
                          <Badge 
                            variant={variant.stock > 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {variant.stock > 0 ? `${variant.stock} unidades` : "Agotado"}
                          </Badge>
                        </div>
                        {variant.reference_number && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {variant.reference_number}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-600">Información del Producto</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">ID:</span> {product.id}</p>
                  <p><span className="font-medium">Slug:</span> {product.slug}</p>
                  <p><span className="font-medium">Categoría ID:</span> {product.category_id}</p>
                  <p><span className="font-medium">Estado:</span> 
                    <Badge variant={product.is_active ? "default" : "secondary"} className="ml-2">
                      {product.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-600">Fechas</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Creado:</span> {new Date(product.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Actualizado:</span> {new Date(product.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}