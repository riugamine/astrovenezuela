'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { getOrderById } from '@/lib/data/admin/actions/orders';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

// Loading skeleton component for the table
function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

export function OrderDetails({ orderId, onClose }: OrderDetailsProps) {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className='py-6'>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <TableSkeleton />
            </CardContent>
          </Card>
          <Card className='py-6'>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <TableSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!orderDetails) return null;

  const { order, items } = orderDetails;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Volver
        </Button>
        <h2 className="text-2xl font-bold">Detalles de la Orden</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className='py-6'>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Nombre:</dt>
                <dd>
                  {order.user_id 
                    ? order.profiles?.full_name || 'Usuario no encontrado'
                    : `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Cliente invitado'
                  }
                  {!order.user_id && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Cliente invitado
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium">Email:</dt>
                <dd>{order.user_id ? order.profiles?.email : order.customer_email}</dd>
              </div>
              <div>
                <dt className="font-medium">WhatsApp:</dt>
                <dd>{order.whatsapp_number}</dd>
              </div>
              {!order.user_id && order.customer_dni && (
                <div>
                  <dt className="font-medium">DNI:</dt>
                  <dd>{order.customer_dni}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card className='py-6'>
          <CardHeader>
            <CardTitle>Información de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Dirección:</dt>
                <dd>{order.shipping_address}</dd>
              </div>
              {!order.user_id && order.shipping_method && (
                <div>
                  <dt className="font-medium">Método de Envío:</dt>
                  <dd>{order.shipping_method}</dd>
                </div>
              )}
              {!order.user_id && order.agency_address && (
                <div>
                  <dt className="font-medium">Dirección de Agencia:</dt>
                  <dd>{order.agency_address}</dd>
                </div>
              )}
              <div>
                <dt className="font-medium">Método de Pago:</dt>
                <dd>{order.payment_method}</dd>
              </div>
              {!order.user_id && order.order_notes && (
                <div>
                  <dt className="font-medium">Notas del Pedido:</dt>
                  <dd className="text-sm text-muted-foreground">{order.order_notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className='py-6'>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.products.name}</TableCell>
                  <TableCell>{item.product_variants?.size || 'N/A'}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.products.price}</TableCell>
                  <TableCell>
                    ${(item.quantity * item.products.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">
                  Total:
                </TableCell>
                <TableCell className="font-bold">
                  ${order.total_amount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}