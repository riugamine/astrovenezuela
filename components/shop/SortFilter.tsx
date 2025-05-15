'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort } from "@fortawesome/free-solid-svg-icons";

export function SortFilter() {
  const { sortBy, setSortBy } = useFilterStore();

  return (
    <div className="space-y-4 bg-card rounded-lg p-4 border shadow-sm">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faSort} className="text-muted-foreground" />
        <h3 className="font-semibold text-lg">Ordenar por</h3>
      </div>
      <Select value={sortBy || undefined} onValueChange={setSortBy}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar orden" />
        </SelectTrigger>
        <SelectContent>
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
    </div>
  );
}