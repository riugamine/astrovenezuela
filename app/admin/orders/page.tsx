import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import OrdersManagement from '@/components/admin/orders/OrdersManagement';

export const metadata: Metadata = {
  title: 'Gestión de Órdenes | Astro Venezuela',
  description: 'Administración de órdenes y pedidos de Astro Venezuela',
};

export default function OrdersPage() {
  return (
    <AdminLayout>
      <OrdersManagement />
    </AdminLayout>
  );
}