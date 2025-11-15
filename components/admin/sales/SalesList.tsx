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
import { OrderStatusComponent } from "../orders/OrderStatus";
import { fetchAllSalesAPI } from "@/lib/api/sales";
import { OrderWithProfile } from "@/lib/data/admin/actions/sales/types";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesListProps {
  onSelectSale: (saleId: string) => void;
}

/**
 * SalesList component displays all sales/orders for admin view
 */
export function SalesList({ onSelectSale }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: sales = [],
    isLoading,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: fetchAllSalesAPI,
  });

  const filteredSales = sales.filter(
    (sale: OrderWithProfile) => {
      const customerName = sale.user_id 
        ? sale.profiles?.full_name || ''
        : `${sale.customer_first_name || ''} ${sale.customer_last_name || ''}`.trim();
      
      return sale.whatsapp_number.includes(searchTerm) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.customer_email && sale.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    }
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
                <TableHead>Número de Venta</TableHead>
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
                : filteredSales.map((sale: OrderWithProfile) => {
                    const customerName = sale.user_id 
                      ? sale.profiles?.full_name || 'Usuario no encontrado'
                      : `${sale.customer_first_name || ''} ${sale.customer_last_name || ''}`.trim() || 'Cliente invitado';
                    
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-xs">{sale.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{customerName}</div>
                            {!sale.user_id && (
                              <div className="text-xs text-muted-foreground">
                                Cliente invitado
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{sale.whatsapp_number}</TableCell>
                        <TableCell>
                          <OrderStatusComponent order={sale} />
                        </TableCell>
                        <TableCell>${sale.total_amount}</TableCell>
                        <TableCell>
                          {new Date(sale.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectSale(sale.id)}
                          >
                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

