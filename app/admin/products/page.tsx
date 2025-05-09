import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import ProductManagement from '@/components/admin/products/ProductManagement';

export const metadata: Metadata = {
  title: 'Gestión de Productos | Astro Venezuela',
  description: 'Panel de administración para gestionar productos de Astro Venezuela',
};

export default function ProductsAdminPage() {
  return (
    <AdminLayout>
      <ProductManagement />
    </AdminLayout>
  );
}