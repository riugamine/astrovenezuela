"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEye } from "@fortawesome/free-solid-svg-icons";
import { OrderStatusComponent } from "./OrderStatus";
import { getOrders } from "@/lib/data/admin/actions/orders";
import { OrderWithProfile } from "@/lib/data/admin/actions/orders/types";
import { Skeleton } from "@/components/ui/skeleton";
interface OrderListProps {
  onSelectOrder: (orderId: string) => void;
}

export function OrderList({ onSelectOrder }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: orders = [],
    isLoading,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const filteredOrders = orders.filter(
    (order: OrderWithProfile) =>
      order.whatsapp_number.includes(searchTerm) ||
      order.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative mb-4">
          <Input
            placeholder="Buscar por nombre o número de WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número de Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-[120px]" />
                      </TableCell>
                    </TableRow>
                  ))
                : filteredOrders.map((order: OrderWithProfile) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.profiles.full_name}</TableCell>
                      <TableCell>{order.whatsapp_number}</TableCell>
                      <TableCell>
                        <OrderStatusComponent order={order} />
                      </TableCell>
                      <TableCell>${order.total_amount}</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectOrder(order.id)}
                        >
                          <FontAwesomeIcon icon={faEye} className="mr-2" />
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
