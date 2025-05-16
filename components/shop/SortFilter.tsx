'use client';

import { useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

export function SortFilter() {
  const { sortBy, setSortBy, applyFilters } = useFilterStore();

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc');
    // Apply filters immediately after setting the sort option
    applyFilters();
  }, [setSortBy, applyFilters]);

  return (
    <Select value={sortBy} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full sm:w-[200px] flex items-center gap-2">
        <FontAwesomeIcon icon={faSort} className="h-4 w-4" />
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent align="end" className="min-w-[200px]">
        <SelectItem value="newest" className="cursor-pointer">
          Más recientes
        </SelectItem>
        <SelectItem value="price-asc" className="cursor-pointer">
          Precio: Menor a Mayor
        </SelectItem>
        <SelectItem value="price-desc" className="cursor-pointer">
          Precio: Mayor a Menor
        </SelectItem>
        <SelectItem value="name-asc" className="cursor-pointer">
          Nombre: A-Z
        </SelectItem>
        <SelectItem value="name-desc" className="cursor-pointer">
          Nombre: Z-A
        </SelectItem>
      </SelectContent>
    </Select>
  );
}