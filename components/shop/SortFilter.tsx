'use client';

import { useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

export function SortFilter() {
  const { sortBy, setSortBy } = useFilterStore();

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value as any);
  }, [setSortBy]);

  return (
    <Select value={sortBy || undefined} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent align="end">
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