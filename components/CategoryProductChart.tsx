//// components/CategoryProductChart.tsx
"use client";

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Type avec index signature pour éviter les erreurs de typage Recharts
type CategoryProductData = {
  category: string;
  products: number;
  fill: string;
  [key: string]: any; // Nécessaire pour la compatibilité avec ChartDataInput[] de Recharts
};

// Générateur de couleurs uniques
function generateUniqueColors(count: number): string[] {
  const baseColors = [
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#8B5A00", // Brown
  ];

  // Si plus de catégories que de couleurs de base, on répète ou on pourrait générer dynamiquement
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

export function CategoryProductChart() {
  const [chartData, setChartData] = useState<CategoryProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const response = await fetch("/api/admin/dashboard/catparprod");

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erreur HTTP ${response.status}`);
        }

        const data: { category: string; products: number }[] = await response.json();

        const colors = generateUniqueColors(data.length);
        const coloredData: CategoryProductData[] = data.map((item, index) => ({
          ...item,
          fill: colors[index],
        }));

        setChartData(coloredData);
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur inconnue est survenue"
        );
        setIsLoading(false);
      }
    }

    fetchCategoryProducts();
  }, []);

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

  // État d'erreur
  if (error) {
    return (
      <Card className="flex flex-col items-center justify-center shadow-xl border-none bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const totalProducts = chartData.reduce((sum, item) => sum + item.products, 0);

  // Label personnalisé pour le PieChart
  const renderCustomLabel = (props: any) => {
    const { payload, percent } = props;
    if (!payload || percent === undefined) return null;

    const category: string = payload.category;
    const products: number = payload.products;

    return `${category}: ${products} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <Card className="flex flex-col shadow-xl border-none bg-white dark:bg-gray-800">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Produits par Catégorie
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Distribution des {totalProducts} produits
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="products"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomLabel}
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none text-gray-900 dark:text-gray-100">
          Distribution des Produits <TrendingUp className="h-4 w-4 text-purple-600" />
        </div>

        <div className="flex flex-wrap gap-4 leading-none">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {item.category}: <span className="font-bold">{item.products}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Total: {totalProducts} produits • {chartData.length} catégories
        </div>
      </CardFooter>
    </Card>
  );
}