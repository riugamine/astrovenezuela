'use client';

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
    applyPriceRange,
    priceRange 
  } = useFilterStore();
  
  const { mainCategories, subcategoriesMap } = organizeCategories(categories);

  const priceRangeChanged = 
    tempPriceRange[0] !== priceRange[0] || 
    tempPriceRange[1] !== priceRange[1];

  return (
    <div className="space-y-6 bg-card rounded-lg p-4 border shadow-sm">
      {/* Header with Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-muted-foreground" />
          <h3 className="font-semibold text-lg">Filtros</h3>
        </div>
        {(selectedCategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 200) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Rango de Precio</h4>
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
          {priceRangeChanged && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={applyPriceRange}
            >
              Aplicar
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Categories Accordion */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Categorías</h4>
        <Accordion type="multiple" className="w-full">
          {mainCategories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-sm hover:text-primary transition-colors">
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  {selectedCategories.includes(category.id) && (
                    <Badge variant="secondary" className="ml-2">
                      Seleccionado
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {/* Main Category Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors"
                    >
                      Todos los productos
                    </label>
                  </div>

                  {/* Subcategories */}
                  {subcategoriesMap[category.id]?.length > 0 && (
                    <div className="mt-2 space-y-2 border-l pl-4">
                      {subcategoriesMap[category.id].map((subcategory) => (
                        <div key={subcategory.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${subcategory.id}`}
                            checked={selectedCategories.includes(subcategory.id)}
                            onCheckedChange={() => toggleCategory(subcategory.id)}
                          />
                          <label
                            htmlFor={`category-${subcategory.id}`}
                            className="text-sm leading-none cursor-pointer hover:text-primary transition-colors"
                          >
                            {subcategory.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}