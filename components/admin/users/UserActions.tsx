'use client';

import { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faUserPlus, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
}

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const queryClient = useQueryClient();

  // Manejador para cerrar el dropdown después de seleccionar una acción
  const handleActionClick = () => {
    setIsActionOpen(true);
    setIsDropdownOpen(false);
  };

  const toggleUserStatus = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(user.is_active ? 'Usuario desactivado exitosamente' : 'Usuario activado exitosamente');
      setIsActionOpen(false);
    },
    onError: () => {
      toast.error('Error al cambiar el estado del usuario');
    },
  });

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleActionClick}
            className={cn(
              "cursor-pointer",
              user.is_active ? "text-red-600" : "text-green-600"
            )}
          >
            <FontAwesomeIcon 
              icon={user.is_active ? faUserSlash : faUserPlus} 
              className="mr-2 h-4 w-4" 
            />
            {user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user.is_active ? 'Desactivar Usuario' : 'Activar Usuario'}
            </DialogTitle>
            <DialogDescription>
              {user.is_active 
                ? `¿Estás seguro de que deseas desactivar al usuario ${user.full_name}?`
                : `¿Estás seguro de que deseas activar al usuario ${user.full_name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsActionOpen(false)}
              disabled={toggleUserStatus.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant={user.is_active ? "destructive" : "default"}
              onClick={() => toggleUserStatus.mutate()}
              disabled={toggleUserStatus.isPending}
            >
              {toggleUserStatus.isPending 
                ? (user.is_active ? 'Desactivando...' : 'Activando...') 
                : (user.is_active ? 'Desactivar' : 'Activar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}