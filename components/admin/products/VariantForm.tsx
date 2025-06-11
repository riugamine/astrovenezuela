'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Variant {
  id?: string;
  size: string;
  stock: number;
  reference_number?: string;
  product_id?: string;
}

interface VariantFormProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

// Predefined size options including "única"
const SIZES = ['Única', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function VariantForm({ variants, onChange }: VariantFormProps) {
  const addVariant = () => {
    onChange([...variants, { 
      id: crypto.randomUUID(),
      size: '', 
      stock: 0,
      reference_number: ''
    }]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = variants.map((variant, i) => {
      if (i === index) {
        return { 
          ...variant, 
          [field]: value,
          id: variant.id || crypto.randomUUID()
        };
      }
      return variant;
    });
    onChange(newVariants);
  };

  // Calculate total stock
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

  // Get available sizes by filtering out already selected ones
  const getAvailableSizes = (currentIndex: number) => {
    const selectedSizes = variants.map((v, i) => i !== currentIndex ? v.size : null);
    return SIZES.filter(size => !selectedSizes.includes(size));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Variantes de Talla</h3>
        <div className="text-sm text-gray-500">
          Stock Total: {totalStock}
        </div>
      </div>

      {variants.map((variant, index) => (
        <Card key={variant.id || index} className="relative">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`size-${index}`}>Talla</Label>
              <Select
                value={variant.size}
                onValueChange={(value) => updateVariant(index, 'size', value)}
              >
                <SelectTrigger id={`size-${index}`}>
                  <SelectValue placeholder="Seleccionar talla" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSizes(index).map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                  {variant.size && !getAvailableSizes(index).includes(variant.size) && (
                    <SelectItem key={variant.size} value={variant.size}>
                      {variant.size}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`reference-${index}`}>Referencia (Opcional)</Label>
              <Input
                id={`reference-${index}`}
                type="text"
                placeholder="Ej: REF-001-L"
                value={variant.reference_number || ''}
                onChange={(e) => updateVariant(index, 'reference_number', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stock-${index}`}>Stock</Label>
              <div className="flex gap-2">
                <Input
                  id={`stock-${index}`}
                  type="number"
                  min="0"
                  value={variant.stock === 0 ? 0 : variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeVariant(index)}
                  className="shrink-0"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button
        type="button"
        variant="outline"
        onClick={addVariant}
        className="w-full"
        disabled={variants.some(v => v.size === 'Única') || variants.length >= SIZES.length}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Agregar Variante
      </Button>

      {variants.length === 0 && (
        <p className="text-sm text-gray-500 text-center mt-4">
          Agrega al menos una variante de talla para el producto.
        </p>
      )}
    </div>
  );
}