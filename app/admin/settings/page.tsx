import type { Metadata } from 'next';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import ExchangeRateManagement from '@/components/admin/settings/ExchangeRateManagement';

/**
 * Metadata para la página de configuración de administración
 */
export const metadata: Metadata = {
  title: 'Configuración | Astro Venezuela',
  description: 'Configuración del sistema - tasas de cambio y configuraciones generales',
};

/**
 * Página de configuración del panel de administración
 * Permite gestionar las tasas de cambio BCV y dólar negro
 */
export default function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona las configuraciones del sistema, incluyendo tasas de cambio
          </p>
        </div>
        
        <ExchangeRateManagement />
      </div>
    </AdminLayout>
  );
}
