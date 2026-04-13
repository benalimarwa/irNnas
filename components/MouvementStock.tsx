"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MouvementStock() {
  const [timeRange, setTimeRange] = React.useState("12m");
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chartConfig, setChartConfig] = React.useState<ChartConfig>({});

  const productColors = [
    "hsl(120, 70%, 50%)",
    "hsl(0, 70%, 50%)",
    "hsl(240, 70%, 50%)",
    "hsl(60, 70%, 50%)",
    "hsl(300, 70%, 50%)",
    "hsl(180, 70%, 50%)",
    "hsl(30, 70%, 50%)",
    "hsl(270, 70%, 50%)",
    "hsl(150, 70%, 50%)",
    "hsl(210, 70%, 50%)",
    "hsl(90, 70%, 50%)",
    "hsl(330, 70%, 50%)",
  ];

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        console.log("🔄 Fetching data for timeRange:", timeRange);
        
        const response = await fetch(
          `/api/admin/dashboard/stock?timeRange=${timeRange}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Erreur HTTP ${response.status}`
          );
        }

        const data = await response.json();
        console.log("📊 Data received:", data);

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("⚠️ No data or empty array");
          setChartData([]);
          setError("Aucune donnée disponible");
          setLoading(false);
          return;
        }

        // Extraire tous les produits (toutes les clés sauf "month")
        const products = Array.from(
          new Set(
            data.flatMap((item: any) =>
              Object.keys(item).filter((key: string) => key !== "month")
            )
          )
        ) as string[];

        console.log("🏷️ Products found:", products);

        if (products.length === 0) {
          console.warn("⚠️ No products found in data");
          setError("Aucun produit trouvé");
          setLoading(false);
          return;
        }

        // Construire la config avec couleurs
        const newConfig: ChartConfig = {};
        products.forEach((product, index) => {
          newConfig[product] = {
            label: product,
            color: productColors[index % productColors.length],
          };
        });

        console.log("🎨 Chart config:", newConfig);
        console.log("📈 Chart data:", data);

        setChartConfig(newConfig);
        setChartData(data);
        
      } catch (err: any) {
        console.error("❌ Error fetching data:", err);
        setError(err.message || "Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Stock Movement - Suivi des Stocks</CardTitle>
            <CardDescription>
              Affichage du niveau de stock par produit dans le temps
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Stock Movement - Suivi des Stocks</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] bg-red-50 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.length > 0;
  const products = Object.keys(chartConfig);

  if (!hasData || products.length === 0) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row justify-between">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Stock Movement - Suivi des Stocks</CardTitle>
            <CardDescription>
              Affichage du niveau de stock par produit dans le temps
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]" aria-label="Période">
              <SelectValue placeholder="12 derniers mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12m">12 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px]">
          <p className="text-gray-500">
            Aucune donnée de stock disponible pour cette période.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row justify-between">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Stock Movement - Suivi des Stocks</CardTitle>
          <CardDescription>
            {products.length} produits suivis sur {chartData.length} mois
          </CardDescription>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]" aria-label="Période">
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
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            {products.map((product) => (
              <Bar
                key={product}
                dataKey={product}
                fill={chartConfig[product]?.color || "#8884d8"}
                radius={[4, 4, 0, 0]}
                stackId="stack"
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}