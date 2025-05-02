import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import AdminDashboard from '@/components/admin/Dashboard';

/**
 * Metadata para la página de administración
 */
export const metadata: Metadata = {
  title: 'Panel de Administración | Astro Venezuela',
  description: 'Panel de administración para gestionar productos y usuarios de Astro Venezuela',
};

/**
 * Página principal del panel de administración
 * Muestra el dashboard con estadísticas y acciones principales
 */
export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}