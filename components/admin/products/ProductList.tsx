'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ProductActions } from './ProductActions';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Product} from '@/lib/types/database.types';
// Definición del tipo para los productos

export function ProductList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Definición de columnas
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img 
            src={row.original.main_image_url} 
            alt={row.getValue("name")} 
            className="w-10 h-10 object-cover rounded-md"
          />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      )
    },
    {
      accessorKey: "reference_number",
      header: "Referencia",
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ row }) => formatCurrency(row.getValue("price"))
    },
    {
      accessorKey: "created_at",
      header: "Fecha de Creación",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString()
    },
    {      accessorKey: "is_active",
      header: "Estado",
      cell: ({ row }) => (
        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${row.original.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${row.original.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ProductActions
          product={row.original}
        />
      )
    }
  ];

  // Consulta para obtener productos
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('products')
          .select(`
            *,
            product_images (
              id,
              product_id,
              image_url,
              order_index
            ),
            variants:product_variants (
              id,
              product_id,
              size,
              color,
              stock,
              image_url,
              created_at,
              updated_at
            )
          `)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error al obtener productos:', error);
          throw error;
        }

        if (!data) {
          console.log('No se encontraron productos');
          return [];
        }
        return data as Product[];
      } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Configuración de la tabla
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Search Bar with Icon */}
        <div className="relative">
          <Input
            placeholder="Buscar productos..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-gray-50/50">
                  {headerGroup.headers.map((header) => (
                    <TableHead 
                      key={header.id}
                      className="font-semibold text-gray-600"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading State with Skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={columns.length}>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md bg-primary" />
                        <Skeleton className="h-4 w-[200px] bg-secondary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell 
                        key={cell.id}
                        className="py-4"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between gap-2 py-2">
          <p className="text-sm text-gray-500">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="min-w-[100px]"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="min-w-[100px]"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}