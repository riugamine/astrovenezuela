"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge } from "../ui/badge";
import {
  faBox,
  faChartLine,
  faShoppingCart,
  faMoneyBill,
  faPercent,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/data/admin/actions/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { StatCard } from "./components/StatCard";
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
  topSellingProducts: Array<{ name: string; quantity: number }>;

  // Métricas de usuarios
  newUsersThisMonth: number;
  userRetentionRate: number;

  // Métricas de inventario
  lowStockProducts: number;
  outOfStockProducts: number;

  // Datos temporales para gráficos
  // Agregar las propiedades faltantes
  salesOverTime: Array<{ date: string; amount: number }>;
  ordersOverTime: Array<{
    date: string;
    count: number;
    total_amount: number;
  }>;
}
const chartConfig = {
  amount: {
    label: "Ingresos",
    theme: {
      light: "hsl(var(--primary))",
      dark: "hsl(var(--primary))",
    },
  },
} satisfies ChartConfig;
export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    refetchInterval: 300000,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Control</h1>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos del Mes"
          value={`$${(stats?.totalRevenue || 0).toLocaleString("es-VE")}`}
          icon={faMoneyBill}
          isLoading={isLoading}
          trend={stats?.salesGrowth}
          className="col-span-2 md:col-span-1"
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
          title="Valor Promedio"
          value={`$${(stats?.averageOrderValue || 0).toLocaleString("es-VE")}`}
          icon={faChartLine}
          isLoading={isLoading}
        />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Sales Chart - 8 columns */}
        <Card className="md:col-span-8 overflow-hidden py-6">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-base font-medium">
              Tendencia de Ventas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ingresos en los últimos 30 días
            </p>
          </CardHeader>
          <CardContent>
            <div className="min-h-[350px] w-full">
              <ChartContainer config={chartConfig} className="min-h-[350px]">
                <BarChart
                  data={stats?.salesOverTime}
                  margin={{ top: 20, right: 25, bottom: 38, left: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("es", {
                        month: "short",
                      })
                    }
                    className="text-xs"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    interval="preserveStartEnd"
                    minTickGap={5}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) =>
                      `$${value.toLocaleString("es-VE")}`
                    }
                    className="text-xs"
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    width={55}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted-foreground)/0.1)" }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - 4 columns */}
        <div className="md:col-span-4 space-y-4">
          {/* Recent Orders */}

          <Card className="md:col-span-2 py-6">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-medium">
                Órdenes Recientes
              </CardTitle>
              <p className="text-sm text-muted-foreground">Últimas 5 órdenes</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="space-y-3">
                    {stats?.ordersOverTime.slice(0, 5).map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FontAwesomeIcon
                              icon={faShoppingCart}
                              className="text-primary text-sm"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              ${order.total_amount.toLocaleString("es-VE")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.date).toLocaleDateString(
                                "es-VE",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {order.count} productos
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inventory Status */}
          <div className="grid grid-cols-1 gap-4">
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
        </div>
      </div>
    </div>
  );
}
