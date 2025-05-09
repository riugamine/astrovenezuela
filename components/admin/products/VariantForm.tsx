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
  color: string;
  stock: number;
  product_id?: string;
}

interface VariantFormProps {
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

// Opciones predefinidas para tallas y colores
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  'Negro',
  'Blanco',
  'Gris',
  'Azul',
  'Rojo',
  'Verde',
  'Amarillo',
  'Morado',
  'Rosa',
  'Naranja'
];

export function VariantForm({ variants, onChange }: VariantFormProps) {
  const addVariant = () => {
    onChange([...variants, { 
      id: crypto.randomUUID(),
      size: '', 
      color: '', 
      stock: 0 
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

  return (
    <div className="space-y-4">
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
                  {SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`color-${index}`}>Color</Label>
              <Select
                value={variant.color}
                onValueChange={(value) => updateVariant(index, 'color', value)}
              >
                <SelectTrigger id={`color-${index}`}>
                  <SelectValue placeholder="Seleccionar color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`stock-${index}`}>Stock</Label>
              <div className="flex gap-2">
                <Input
                  id={`stock-${index}`}
                  type="number"
                  min="0"
                  value={variant.stock}
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
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Agregar Variante
      </Button>
    </div>
  );
}