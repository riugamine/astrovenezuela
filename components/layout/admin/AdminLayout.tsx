import type { ReactNode } from 'react';
import AdminHeader from '@/components/layout/admin/AdminHeader';
import AdminSidebar from '@/components/layout/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Layout principal para el panel administrativo
 * @param {ReactNode} children - Contenido a renderizar dentro del layout
 */
const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;