export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  monthlyOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesGrowth: number;
  conversionRate: number;
  topSellingProducts: Array<{name: string, quantity: number}>;
  newUsersThisMonth: number;
  userRetentionRate: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  salesOverTime: Array<{date: string, amount: number}>;
  ordersOverTime: Array<{date: string, count: number, total_amount: number}>;
}

export interface SalesData {
  created_at: string;
  total_amount: number;
}