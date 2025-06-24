'use client';

import { Sheet, SheetContent, SheetTrigger, SheetDescription, SheetFooter, SheetTitle, SheetClose, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { CategoryFilter } from "./CategoryFilter";
import { SortFilter } from "./SortFilter";
import { Category } from "@/lib/types/database.types";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface ProductFiltersProps {
  categories: Category[];
  disableCategoryFilter?: boolean;
}

const SIZES = ['Única', 'XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export function ProductFilters({ categories, disableCategoryFilter = false }: ProductFiltersProps) {
  const applyFilters = useFilterStore(state => state.applyFilters);
  const cancelChanges = useFilterStore(state => state.cancelChanges);
  const isDirty = useFilterStore(state => state.isDirty);
  const tempSelectedSizes = useFilterStore(state => state.tempSelectedSizes);
  const toggleSize = useFilterStore(state => state.toggleSize);
  const tempPriceRange = useFilterStore(state => state.tempPriceRange);
  const setTempPriceRange = useFilterStore(state => state.setTempPriceRange);
  const priceRange = useFilterStore(state => state.priceRange);

  const showResetButton = isDirty;

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  const handleCancelChanges = useCallback(() => {
    cancelChanges();
  }, [cancelChanges]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
            <span>Filtros</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-[90vw] sm:w-[400px] p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-4 sm:px-6 py-4 border-b">
            <SheetTitle>Filtros de Búsqueda</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Ajusta los filtros para encontrar exactamente lo que buscas
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
            {!disableCategoryFilter && <CategoryFilter categories={categories} />}

            <div>
              <h4 className="text-sm font-medium mb-2">Tallas {tempSelectedSizes.length > 0 && (
                <Badge variant="secondary" className="ml-2">{tempSelectedSizes.length}</Badge>
              )}</h4>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={tempSelectedSizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSize(size)}
                    className="w-full"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Precio {tempPriceRange.some((v, i) => v !== priceRange[i]) && (
                <Badge variant="secondary" className="ml-2">1</Badge>
              )}</h4>
              <div className="space-y-4 pt-4 px-2">
                <Slider
                  value={tempPriceRange}
                  min={0}
                  max={500}
                  step={10}
                  onValueChange={setTempPriceRange}
                />
                <div className="flex items-center justify-between text-sm">
                  <span>${tempPriceRange[0]}</span>
                  <span>${tempPriceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 border-t bg-background px-4 sm:px-6 py-4 mt-auto">
            <div className="flex w-full flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <SheetClose asChild>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleCancelChanges}
                >
                  Cancelar
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button 
                  className="flex-1" 
                  onClick={handleApplyFilters}
                  disabled={!isDirty}
                >
                  Aplicar Filtros
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <div className="w-full sm:w-auto">
        <SortFilter />
      </div>
    </div>
  );
}