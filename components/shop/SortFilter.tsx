'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SortFilter() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Ordenar por</h3>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar orden" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Más recientes</SelectItem>
          <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
          <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
          <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
          <SelectItem value="name-desc">Nombre: Z-A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}