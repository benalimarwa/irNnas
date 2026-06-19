// components/OrdersMonthChart.tsx
"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, TrendingUp, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderData = {
  month: string;
  orders: number;
  revenue: number;
};

export function OrdersMonthChart() {
  const [chartData, setChartData] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("12m");

  useEffect(() => {
    async function fetchOrderData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/dashboard/orders-by-month?timeRange=${timeRange}`);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erreur HTTP ${response.status}`);
        }

        const data: OrderData[] = await response.json();

        if (!data || data.length === 0) {
          setChartData(generateFallbackData());
        } else {
          setChartData(data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setChartData(generateFallbackData());
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderData();
  }, [timeRange]);

  const generateFallbackData = (): OrderData[] => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const monthsToShow = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    
    return months.slice(-monthsToShow).map((month) => ({
      month,
      orders: Math.floor(Math.random() * 60) + 25,
      revenue: Math.floor(Math.random() * 8000) + 3500,
    }));
  };

  // Statistiques
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgOrdersPerMonth = Math.round(totalOrders / (chartData.length || 1));
  const avgRevenuePerMonth = Math.round(totalRevenue / (chartData.length || 1));

  const bestMonth = chartData.reduce((max, item) => 
    item.orders > max.orders ? item : max, 
    chartData[0] || { month: "-", orders: 0 }
  );

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-orange-200 dark:border-orange-800">
          <p className="font-bold text-lg text-orange-700 dark:text-orange-300 mb-2">
            {payload[0].payload.month}
          </p>
          <p className="text-sm">
            Commandes : <span className="font-bold text-orange-600">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Revenus : <span className="font-bold text-amber-600">{payload[1].value} TND</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center shadow-xl border-none bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Chargement des commandes...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-none bg-white dark:bg-gray-800">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-600" />
            Commandes par Mois
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Évolution des ventes et revenus - IRNAS
          </CardDescription>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[170px] rounded-xl border-orange-200 focus:border-orange-500">
            <SelectValue placeholder="12 derniers mois" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12m">12 derniers mois</SelectItem>
            <SelectItem value="6m">6 derniers mois</SelectItem>
            <SelectItem value="3m">3 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C2410C" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#C2410C" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: '#6B7280', fontSize: 13 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#6B7280' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="circle"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#EA580C"
              strokeWidth={3}
              fill="url(#colorOrders)"
              name="Commandes"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#C2410C"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              name="Revenus (TND)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-4 text-sm pt-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Commandes</span>
            <span className="text-3xl font-bold text-orange-600">{totalOrders}</span>
          </div>

          <div className="flex flex-col items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Revenu Total</span>
            <span className="text-3xl font-bold text-amber-600">{totalRevenue.toFixed(0)} TND</span>
          </div>

          <div className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Moy. Commandes/Mois</span>
            <span className="text-3xl font-bold text-orange-600">{avgOrdersPerMonth}</span>
          </div>

          <div className="flex flex-col items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Moy. Revenus/Mois</span>
            <span className="text-3xl font-bold text-amber-600">{avgRevenuePerMonth} TND</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400 mt-2">
          <TrendingUp className="h-4 w-4" />
          Meilleur mois : <span className="font-bold">{bestMonth.month}</span> ({bestMonth.orders} commandes)
        </div>

        {error && (
          <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ Données de démonstration affichées
          </div>
        )}
      </CardFooter>
    </Card>
  );
}