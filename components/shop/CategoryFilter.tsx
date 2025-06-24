'use client';

import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/lib/types/database.types";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CategoryFilterProps {
  categories: Category[];
}

// Available sizes for filtering
const SIZES = ['Única', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

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
    tempSelectedCategories,
    tempSelectedSizes, 
    toggleCategory,
    toggleSize, 
    resetFilters, 
    tempPriceRange, 
    setTempPriceRange,
    priceRange,
    isDirty
  } = useFilterStore();
  
  const { mainCategories, subcategoriesMap } = useMemo(
    () => organizeCategories(categories),
    [categories]
  );

  const showResetButton = useMemo(
    () => isDirty,
    [isDirty]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {showResetButton && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Limpiar
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] pr-4">
        <Accordion type="multiple" className="space-y-4" defaultValue={["categories"]}>
          <AccordionItem value="categories">
            <AccordionTrigger className="text-sm font-medium">
              Categorías
              {tempSelectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {tempSelectedCategories.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                {mainCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={tempSelectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label htmlFor={category.id} className="text-sm font-medium cursor-pointer">
                        {category.name}
                      </label>
                    </div>
                    {subcategoriesMap[category.id] && (
                      <div className="ml-6 space-y-2">
                        {subcategoriesMap[category.id].map((subcat) => (
                          <div key={subcat.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={subcat.id}
                              checked={tempSelectedCategories.includes(subcat.id)}
                              onCheckedChange={() => toggleCategory(subcat.id)}
                            />
                            <label htmlFor={subcat.id} className="text-sm cursor-pointer">
                              {subcat.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}