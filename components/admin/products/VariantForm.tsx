'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

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
        <div key={index} className="flex gap-4 items-start">
          <Input
            placeholder="Talla"
            value={variant.size}
            onChange={(e) => updateVariant(index, 'size', e.target.value)}
          />
          <Input
            placeholder="Color"
            value={variant.color}
            onChange={(e) => updateVariant(index, 'color', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Stock"
            value={variant.stock}
            onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value))}
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeVariant(index)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addVariant}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Agregar Variante
      </Button>
    </div>
  );
}