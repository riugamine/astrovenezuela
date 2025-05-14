'use client';

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge } from '../ui/badge';
import { 
  faBox, 
  faUsers, 
  faChartLine, 
  faShoppingCart,
  faMoneyBill,
  faChartBar,
  faPercent,
  faTruck
} from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { StatCard } from './components/StatCard';
interface DashboardStats {
  // Métricas generales
  totalProducts: number;
  totalUsers: number;
  monthlyOrders: number;
  totalRevenue: number;
  averageOrderValue: number;

  // Métricas de ventas
  salesGrowth: number;
  conversionRate: number;
  topSellingProducts: Array<{name: string, quantity: number}>;
  
  // Métricas de usuarios
  newUsersThisMonth: number;
  userRetentionRate: number;
  
  // Métricas de inventario
  lowStockProducts: number;
  outOfStockProducts: number;
  
  // Datos temporales para gráficos
  // Agregar las propiedades faltantes
  salesOverTime: Array<{date: string, amount: number}>;
  ordersOverTime: Array<{date: string, count: number}>;
}
interface OrderItemWithProduct {
  quantity: number;
  products_id: string;
  products: {
    name: string;
  };
}
const AdminDashboard: FC = () => {
  const chartConfig = {
    chart1: {
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))"
      }
    }
  };
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Obtener datos básicos
      const { count: productsCount } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact', head: true });

      const { count: usersCount } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Calcular fechas relevantes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Obtener órdenes y calcular métricas
      const { data: currentMonthOrders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .gte('created_at', startOfMonth.toISOString());

      const { data: lastMonthOrders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', startOfMonth.toISOString());

      // Calcular crecimiento de ventas
      const currentRevenue = currentMonthOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const lastRevenue = lastMonthOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const salesGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      // Obtener productos con bajo stock
      const { count: lowStock } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .lt('stock', 10)
        .gt('stock', 0);

      const { count: outOfStock } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' })
        .eq('stock', 0);

      // Calcular tasa de conversión (órdenes / usuarios totales)
      const conversionRate = (currentMonthOrders?.length || 0) / (usersCount || 1) * 100;

      // Calcular datos temporales para gráficos
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: salesData } = await supabaseAdmin
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Procesar datos para gráficos
      const salesOverTime = salesData?.reduce((acc: Array<{date: string, amount: number}>, order) => {
        const date = new Date(order.created_at).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
          existingDate.amount += order.total_amount;
        } else {
          acc.push({ date, amount: order.total_amount });
        }
        return acc;
      }, []) || [];

      // Calcular productos más vendidos
      const { data: topProducts } = await supabaseAdmin
        .from('order_items')
        .select(`
          quantity,
          products_id,
          products!inner (name)
        `)
        .order('quantity', { ascending: false })
        .limit(5) as {data: OrderItemWithProduct[] | null };

      const topSellingProducts = topProducts?.map(item => ({
        name: item.products.name,
        quantity: item.quantity
      })) || [];

      // Calcular nuevos usuarios del mes
      const { count: newUsers } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact' })
        .gte('created_at', startOfMonth.toISOString());

      // Calcular tasa de retención (usuarios que han hecho más de una orden)
      const { data: returningUsers } = await supabaseAdmin
        .from('orders')
        .select('user_id')
        .gte('created_at', lastMonth.toISOString());

      const uniqueReturningUsers = new Set(returningUsers?.map(order => order.user_id));
      const userRetentionRate = (uniqueReturningUsers.size / (usersCount || 1)) * 100;

      return {
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0,
        monthlyOrders: currentMonthOrders?.length || 0,
        totalRevenue: currentRevenue,
        averageOrderValue: currentMonthOrders?.length 
          ? currentRevenue / currentMonthOrders.length 
          : 0,
        salesGrowth,
        conversionRate,
        lowStockProducts: lowStock || 0,
        outOfStockProducts: outOfStock || 0,
        // Nuevas propiedades requeridas
        topSellingProducts,
        newUsersThisMonth: newUsers || 0,
        userRetentionRate,
        salesOverTime,
        ordersOverTime: salesOverTime.map(item => ({
          date: item.date,
          count: 1
        }))
      };
    },
    refetchInterval: 300000,
});


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ingresos del Mes"
              value={`$${(stats?.totalRevenue || 0).toLocaleString('es-VE')}`}
              icon={faMoneyBill}
              isLoading={isLoading}
              trend={stats?.salesGrowth}
            />
            <StatCard
              title="Órdenes del Mes"
              value={stats?.monthlyOrders || 0}
              icon={faShoppingCart}
              isLoading={isLoading}
            />
            <StatCard
              title="Tasa de Conversión"
              value={`${stats?.conversionRate.toFixed(2)}%`}
              icon={faPercent}
              isLoading={isLoading}
            />
            <StatCard
              title="Valor Promedio de Orden"
              value={`$${(stats?.averageOrderValue || 0).toLocaleString('es-VE')}`}
              icon={faChartLine}
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4">
            {/* Gráfico de Ventas */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg lg:text-xl">Tendencia de Ventas</CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] sm:h-[300px] lg:h-[400px] p-2 sm:p-4">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={stats?.salesOverTime} 
                      margin={{ 
                        top: 5, 
                        right: 10, 
                        bottom: 20, 
                        left: 20 
                      }}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        className="stroke-muted" 
                        horizontal={true}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        className="text-[10px] sm:text-xs"
                        interval="preserveStartEnd"
                        tick={{ dy: 10 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        className="text-[10px] sm:text-xs"
                        tick={{ dx: -10 }}
                        width={60}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />} 
                        wrapperClassName="!bg-background"
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, className: "fill-primary" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Tabla de Órdenes Recientes */}
            <Card>
              <CardHeader>
                <CardTitle>Órdenes Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="space-y-4">
                      {stats?.ordersOverTime.slice(0, 5).map((order, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <FontAwesomeIcon icon={faShoppingCart} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Orden #{order.date}</p>
                              <p className="text-sm text-muted-foreground">${order.count}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{order.date}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Productos con Bajo Stock"
              value={stats?.lowStockProducts || 0}
              icon={faBox}
              isLoading={isLoading}
              variant="warning"
            />
            <StatCard
              title="Productos Agotados"
              value={stats?.outOfStockProducts || 0}
              icon={faTruck}
              isLoading={isLoading}
              variant="destructive"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;