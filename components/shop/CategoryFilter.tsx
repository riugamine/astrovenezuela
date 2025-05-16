'use client';

import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/lib/types/database.types";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface CategoryFilterProps {
  categories: Category[];
}

// Helper function to organize categories by parent
function organizeCategories(categories: Category[]) {
  const mainCategories = categories.filter(cat => !cat.parent_id);
  const subcategoriesMap = categories
    .filter(cat => cat.parent_id)
    .reduce((acc, cat) => {
      if (!acc[cat.parent_id!]) {
        acc[cat.parent_id!] = [];
      }
      acc[cat.parent_id!].push(cat);
      return acc;
    }, {} as Record<string, Category[]>);

  return { mainCategories, subcategoriesMap };
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const { 
    selectedCategories, 
    toggleCategory, 
    resetFilters, 
    tempPriceRange, 
    setTempPriceRange,
    priceRange 
  } = useFilterStore();
  
  const { mainCategories, subcategoriesMap } = useMemo(
    () => organizeCategories(categories),
    [categories]
  );

  const showResetButton = useMemo(
    () => selectedCategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 200,
    [selectedCategories, priceRange]
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        {showResetButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Limpiar todo
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Rango de Precio</h3>
        <Slider
          defaultValue={tempPriceRange}
          max={200}
          step={10}
          value={tempPriceRange}
          onValueChange={(value) => setTempPriceRange(value as [number, number])}
          className="w-full"
        />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>${tempPriceRange[0]}</span> - <span>${tempPriceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Categorías</h3>
        <div className="space-y-2">
          {mainCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm leading-none cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
              
              {/* Subcategories */}
              {subcategoriesMap[category.id] && (
                <div className="ml-6 space-y-2">
                  {subcategoriesMap[category.id].map((subcat) => (
                    <div key={subcat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${subcat.id}`}
                        checked={selectedCategories.includes(subcat.id)}
                        onCheckedChange={() => toggleCategory(subcat.id)}
                      />
                      <label
                        htmlFor={`category-${subcat.id}`}
                        className="text-sm leading-none cursor-pointer"
                      >
                        {subcat.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}