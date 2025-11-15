import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import SalesManagement from '@/components/admin/sales/SalesManagement';

/**
 * Metadata for the admin sales page
 */
export const metadata: Metadata = {
  title: 'Gestión de Ventas | Astro Venezuela',
  description: 'Panel de administración para gestionar ventas y órdenes de Astro Venezuela',
};

/**
 * Admin sales management page
 * Allows administrators to create and manage sales/orders
 */
export default function AdminSalesPage() {
  return (
    <AdminLayout>
      <SalesManagement />
    </AdminLayout>
  );
}

