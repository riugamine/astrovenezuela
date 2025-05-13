'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faUsers, 
  faChartLine, 
  faShoppingCart,
  faMoneyBill 
} from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  monthlyOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

const AdminDashboard: FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Obtener total de productos
      const { count: productsCount } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Obtener total de usuarios
      const { count: usersCount } = await supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Obtener órdenes del mes actual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabaseAdmin
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString());

      // Calcular estadísticas de órdenes
      const totalRevenue = monthlyOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const averageOrderValue = monthlyOrders?.length 
        ? totalRevenue / monthlyOrders.length 
        : 0;

      return {
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        monthlyOrders: monthlyOrders?.length || 0,
        totalRevenue,
        averageOrderValue
      };
    },
    refetchInterval: 300000, // Refrescar cada 5 minutos
  });

  const StatCard = ({ title, value, icon, isLoading }: {
    title: string;
    value: string | number;
    icon: any;
    isLoading: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <FontAwesomeIcon icon={icon} className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Productos"
          value={stats?.totalProducts || 0}
          icon={faBox}
          isLoading={isLoading}
        />
        <StatCard
          title="Usuarios"
          value={stats?.totalUsers || 0}
          icon={faUsers}
          isLoading={isLoading}
        />
        <StatCard
          title="Órdenes del Mes"
          value={stats?.monthlyOrders || 0}
          icon={faShoppingCart}
          isLoading={isLoading}
        />
        <StatCard
          title="Ingresos del Mes"
          value={`$${(stats?.totalRevenue || 0).toLocaleString('es-VE')}`}
          icon={faMoneyBill}
          isLoading={isLoading}
        />
        <StatCard
          title="Valor Promedio"
          value={`$${(stats?.averageOrderValue || 0).toLocaleString('es-VE')}`}
          icon={faChartLine}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;