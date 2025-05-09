'use client';

import { FC, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Category } from '@/lib/types/category';
import CategoryActions from './CategoryActions';
import { cn } from "@/lib/utils"
import { SubcategoryDialog } from './SubcategoryDialog';
// Schema para validación de categorías
const categorySchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .refine(value => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value), {
      message: "El nombre solo puede contener letras y espacios"
    }),
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .optional(),
  image_url: z.string()
    .url("Debe ser una URL válida")
    .optional(),
  parent_id: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// Definición de columnas para la tabla
const CategoriesManagement: FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const depth = row.original.parent_id ? 1 : 0;
        return (
          <div 
            className={cn(
              "font-medium flex items-center",
              row.original.parent_id && "pl-8 border-l-2 border-primary/20 bg-secondary/5"
            )}
          >
            {row.getValue("name")}
          </div>
        );
      }
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => row.getValue("description") || "Sin descripción"
    },
    {
      accessorKey: "created_at",
      header: "Fecha de Creación",
      cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString()
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CategoryActions
          category={row.original}
          onEdit={(category) => {
            setSelectedCategory(category);
            setIsEditOpen(true);
          }}
          onDelete={(category) => {
            setSelectedCategory(category);
            setIsDeleteOpen(true);
          }}
          onAddSubcategory={(category) => {
            setSelectedCategory(category);
            setIsSubcategoryOpen(true); 
          }}
        />
      )
    }
  ];
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  });

  // Obtener categorías
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*, subcategories:categories(*)')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Category[];
    }
  });

  // Configuración de la tabla
  const table = useReactTable({
    data: categories || [],
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

  // Crear categoría
  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .insert([{ 
          ...newCategory,
          slug: newCategory.name.toLowerCase().replace(/\s+/g, '-')
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Mensaje personalizado según si es categoría o subcategoría
      const message = variables.parent_id 
        ? 'Subcategoría creada exitosamente'
        : 'Categoría creada exitosamente';
      toast.success(message);
      setIsCreateOpen(false);
      setIsSubcategoryOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error('Error al crear la categoría');
      console.error(error);
    }
  });

  // Actualizar categoría
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const { error } = await supabaseAdmin
        .from('categories')
        .update({ 
          ...data,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría actualizada exitosamente');
      setIsEditOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error('Error al actualizar la categoría');
      console.error(error);
    }
  });

  // Eliminar categoría
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoría eliminada exitosamente');
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error) => {
      toast.error('Error al eliminar la categoría');
      console.error(error);
    }
  });


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Categorías</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Categoría</DialogTitle>
              <DialogDescription>
                Añade una nueva categoría o subcategoría para los productos
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(data => createMutation.mutate(data))}>
              <div className="space-y-4">                
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input 
                    id="slug" 
                    disabled 
                    value={watch('name')?.toLowerCase().replace(/\s+/g, '-') || ''}
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Este será el identificador único en la URL
                  </p>
                </div>
            
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" {...register('description')} />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear Categoría'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <div className="flex items-center py-4 px-4">
          <Input
            placeholder="Filtrar categorías..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      Cargando categorías...
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No se encontraron categorías.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4 px-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal de Edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la categoría
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(data => 
            selectedCategory && updateMutation.mutate({ id: selectedCategory.id, data })
          )}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre</Label>
                <Input
                  id="edit-name"
                  defaultValue={selectedCategory?.name}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  defaultValue={selectedCategory?.description}
                  {...register('description')}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Categoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Creación de Subcategoría */}
      <SubcategoryDialog
        isOpen={isSubcategoryOpen}
        onClose={() => {
          setIsSubcategoryOpen(false);
          setSelectedCategory(null);
        }}
        parentCategory={selectedCategory}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};

export default CategoriesManagement;