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

interface ProductFiltersProps {
  categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const applyFilters = useFilterStore(state => state.applyFilters);
  const isDirty = useFilterStore(state => state.isDirty);

  const handleApplyFilters = useCallback(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="flex items-center justify-between mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} />
            Filtros
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Filtros de Búsqueda</SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Ajusta los filtros para encontrar exactamente lo que buscas
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <CategoryFilter categories={categories} />
          </div>

          <SheetFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
            <div className="flex w-full items-center justify-between gap-2">
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button 
                  className="w-full" 
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
      <SortFilter />
    </div>
  );
}