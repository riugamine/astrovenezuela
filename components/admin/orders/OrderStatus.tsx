"use client";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus } from "@/lib/data/admin/actions/orders";
import { type OrderWithProfile } from "@/lib/data/admin/actions/orders/types";
import { toast } from "sonner";

const STATUS_COLORS = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  delivered: "delivered",
} as const;
const STATUS_LABELS: Record<OrderWithProfile["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  delivered: "Entregado",
} as const;

export function OrderStatusComponent({ order }: { order: OrderWithProfile }) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: (status: OrderWithProfile["status"]) =>
      updateOrderStatus(order.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Estado actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el estado"
      );
    },
  });
  // Get available status options based on current status
  const getAvailableStatuses = (
    currentStatus: OrderWithProfile["status"]
  ): OrderWithProfile["status"][] => {
    const transitions: Record<
      OrderWithProfile["status"],
      OrderWithProfile["status"][]
    > = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["delivered", "cancelled"],
      delivered: [], // No transitions allowed from delivered
      cancelled: [], // No transitions allowed from cancelled
    };
    return transitions[currentStatus] || [];
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Badge
          variant={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}
        >
          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {getAvailableStatuses(order.status as OrderWithProfile["status"]).map(
          (status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => updateStatus.mutate(status)}
            >
              {STATUS_LABELS[status]}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
