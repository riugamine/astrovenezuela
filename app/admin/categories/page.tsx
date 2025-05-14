import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import CategoriesManagement from '@/components/admin/categories/CategoriesManagement';

export const metadata: Metadata = {
  title: 'Gestión de Categorías | Astro Venezuela',
  description: 'Administración de categorías y subcategorías de productos',
};

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <CategoriesManagement />
    </AdminLayout>
  );
}