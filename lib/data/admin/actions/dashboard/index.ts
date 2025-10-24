'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { DashboardStats, SalesData } from './types';

// Función auxiliar para procesar datos de ventas
function processSalesData(salesData: SalesData[]): Array<{date: string, amount: number}> {
  return salesData.reduce((acc: Array<{date: string, amount: number}>, order) => {
    // Format date as YYYY-MM-DD for proper sorting and display
    const date = new Date(order.created_at).toISOString().split('T')[0];
    const existingDate = acc.find(item => item.date === date);
    if (existingDate) {
      existingDate.amount += order.total_amount;
    } else {
      acc.push({ date, amount: order.total_amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
}

// Función auxiliar para calcular tasa de retención
function calculateRetentionRate(orders: any[], totalUsers: number): number {
  const uniqueUsers = new Set(orders.map(order => order.user_id));
  return (uniqueUsers.size / totalUsers) * 100;
}
interface TopProduct {
    quantity: number;
    products: {
      name: string;
    };
  }
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Consultas paralelas para datos básicos
    const [productsResult, usersResult] = await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
    ]);

    // Cálculo de fechas relevantes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(startOfMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Consultas paralelas para órdenes y stock
    // Solo incluir órdenes entregadas (delivered) para las métricas
    const [currentMonthOrdersResult, lastMonthOrdersResult, lowStockResult, outOfStockResult] = await Promise.all([
      supabaseAdmin.from('orders').select('*').gte('created_at', startOfMonth.toISOString()).eq('status', 'delivered'),
      supabaseAdmin.from('orders').select('*').gte('created_at', lastMonth.toISOString()).lt('created_at', startOfMonth.toISOString()).eq('status', 'delivered'),
      supabaseAdmin.from('products').select('*', { count: 'exact' }).lt('stock', 10).gt('stock', 0),
      supabaseAdmin.from('products').select('*', { count: 'exact' }).eq('stock', 0)
    ]);

    // Cálculo de métricas - solo órdenes entregadas (delivered)
    const currentRevenue = currentMonthOrdersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const lastRevenue = lastMonthOrdersResult.data?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const salesGrowth = lastRevenue ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    // Productos más vendidos - solo de órdenes entregadas
    const { data: topProducts } = await supabaseAdmin
    .from('order_items')
    .select('quantity, products(name), orders!inner(status)')
    .eq('orders.status', 'delivered')
    .order('quantity', { ascending: false })
    .limit(5) as { data: TopProduct[] | null };

    // Datos de ventas para gráficos
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: salesData } = await supabaseAdmin
      .from('orders')
      .select('created_at, total_amount')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .eq('status', 'delivered')
      .order('created_at');

    const salesOverTime = processSalesData(salesData || []);

    return {
      totalProducts: productsResult.count || 0,
      totalUsers: usersResult.count || 0,
      monthlyOrders: currentMonthOrdersResult.data?.length || 0,
      totalRevenue: currentRevenue,
      averageOrderValue: currentMonthOrdersResult.data?.length ? currentRevenue / currentMonthOrdersResult.data.length : 0,
      salesGrowth,
      conversionRate: (currentMonthOrdersResult.data?.length || 0) / (usersResult.count || 1) * 100,
      lowStockProducts: lowStockResult.count || 0,
      outOfStockProducts: outOfStockResult.count || 0,
      topSellingProducts: topProducts?.map(item => ({
        name: item.products.name,
        quantity: item.quantity
      })) || [],
      newUsersThisMonth: usersResult.count || 0,
      userRetentionRate: calculateRetentionRate(currentMonthOrdersResult.data || [], usersResult.count || 1),
      salesOverTime,
      ordersOverTime: salesOverTime.map(item => ({ date: item.date, count: 1, total_amount: item.amount }))
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}