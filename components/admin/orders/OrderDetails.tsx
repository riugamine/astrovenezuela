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
import { getOrderById } from '@/lib/data/admin-actions';
interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetails({ orderId, onClose }: OrderDetailsProps) {
  const { data: orderDetails, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
  });

  if (isLoading) return <div>Cargando...</div>;
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
                <dd>{order.profiles.full_name}</dd>
              </div>
              <div>
                <dt className="font-medium">Email:</dt>
                <dd>{order.profiles.email}</dd>
              </div>
              <div>
                <dt className="font-medium">WhatsApp:</dt>
                <dd>{order.whatsapp_number}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="font-medium">Dirección:</dt>
                <dd>{order.shipping_address}</dd>
              </div>
              <div>
                <dt className="font-medium">Método de Pago:</dt>
                <dd>{order.payment_method}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.products.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.products.price}</TableCell>
                  <TableCell>
                    ${(item.quantity * item.products.price).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
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