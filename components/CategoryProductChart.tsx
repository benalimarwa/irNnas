// components/CategoryProductChart.tsx
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Sparkles } from "lucide-react";
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

type CategoryProductData = {
  category: string;
  products: number;
  fill: string;
  [key: string]: any;
};

function generateUniqueColors(count: number): string[] {
  const baseColors = [
    "#EA580C", // Orange vif
    "#C2410C", // Orange foncé (marron)
    "#F59E0B", // Jaune/Amber
    "#B45309", // Marron doré
    "#FB923C", // Orange clair
    "#D97706", // Jaune foncé
    "#F97316", // Orange intense
    "#92400E", // Marron profond
  ];

  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

export function CategoryProductChart() {
  const [chartData, setChartData] = useState<CategoryProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // components/CategoryProductChart.tsx
useEffect(() => {
  async function fetchCategoryProducts() {
    try {
      const response = await fetch("/api/admin/dashboard/catparprod");
      if (!response.ok) throw new Error("Erreur réseau");

      const data: { category: string; products: number }[] = await response.json();
      
      const colors = generateUniqueColors(data.length);
      
      const coloredData = data.map((item, index) => ({
        ...item,
        fill: colors[index],
      }));

      setChartData(coloredData);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les catégories");
      // Fallback visuel
      setChartData([
        { category: "Homme", products: 45, fill: "#EA580C" },
        { category: "Femme", products: 38, fill: "#C2410C" },
        { category: "Unisexe", products: 27, fill: "#F59E0B" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  fetchCategoryProducts();
}, []);

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center shadow-xl border-none bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>Chargement...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl border-none bg-white dark:bg-gray-800">
        <CardContent className="text-center py-10 text-red-600">{error}</CardContent>
      </Card>
    );
  }

  const totalProducts = chartData.reduce((sum, item) => sum + item.products, 0);

  return (
    <Card className="flex flex-col shadow-xl border-none bg-white dark:bg-gray-800">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-orange-600" />
          Produits par Catégorie
        </CardTitle>
        <CardDescription>Distribution des {totalProducts} produits</CardDescription>
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
              labelLine={true}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
          Distribution des Produits <TrendingUp className="h-4 w-4" />
        </div>

        <div className="flex flex-wrap gap-4">
          {chartData.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span>
                {item.category}: <span className="font-bold">{item.products}</span>
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}