import { useState, useEffect } from "react";
import { ShoppingCart, TrendingUp } from "lucide-react";
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

        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur inconnue est survenue"
        );
        
        setChartData(generateFallbackData());
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
      orders: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 5000) + 2000,
    }));
  };

  // Calculs statistiques
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const avgOrdersPerMonth = Math.round(totalOrders / (chartData.length || 1));
  const avgRevenuePerMonth = Math.round(totalRevenue / (chartData.length || 1));

  // Trouver le mois avec le plus de commandes
  const bestMonth = chartData.reduce((max, item) => 
    item.orders > max.orders ? item : max, 
    chartData[0] || { month: "-", orders: 0 }
  );

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.month}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Commandes: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Revenus: <span className="font-bold">{payload[1].value} TND</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Légende personnalisée
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.value === "orders" ? "Commandes" : "Revenus (TND)"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // État de chargement
  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center shadow-xl border-none bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Chargement...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-none bg-white dark:bg-gray-800">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Commandes par Mois
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Évolution des commandes et revenus - Année {new Date().getFullYear()}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg"
            aria-label="Sélectionner une période"
          >
            <SelectValue placeholder="12 derniers mois" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="12m" className="rounded-lg">
              12 derniers mois
            </SelectItem>
            <SelectItem value="6m" className="rounded-lg">
              6 derniers mois
            </SelectItem>
            <SelectItem value="3m" className="rounded-lg">
              3 derniers mois
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#6B7280' }}
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
            <Legend content={<CustomLegend />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorOrders)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-4 text-sm pt-4 border-t">
        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <div className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total Commandes
            </span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalOrders}
            </span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Revenu Total
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {totalRevenue.toFixed(0)} TND
            </span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Moy. Commandes/Mois
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {avgOrdersPerMonth}
            </span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Moy. Revenus/Mois
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {avgRevenuePerMonth} TND
            </span>
          </div>
        </div>

        {/* Meilleur mois */}
        <div className="flex items-center gap-2 font-medium leading-none text-gray-900 dark:text-gray-100">
          <TrendingUp className="h-4 w-4 text-green-600" />
          Meilleur mois: {bestMonth.month} avec {bestMonth.orders} commandes
        </div>

        {error && (
          <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ Données de démonstration affichées
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}