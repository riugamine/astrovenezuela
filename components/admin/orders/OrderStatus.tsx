'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { toast } from 'sonner';
import { Order } from '@/lib/types/database.types';

const STATUS_COLORS = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  delivered: "default"
} as const;

const STATUS_LABELS = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  delivered: "Entregado"
} as const;

export function OrderStatusComponent({ order }: { order: Order }) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Estado de la orden actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge variant={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}>
          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <DropdownMenuItem
            key={status}
            onClick={() => updateStatus.mutate(status)}
            disabled={order.status === status}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}