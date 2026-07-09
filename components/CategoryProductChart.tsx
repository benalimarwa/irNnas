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
};

function generateUniqueColors(count: number): string[] {
  const baseColors = [
    "#EA580C", "#C2410C", "#F59E0B", "#B45309",
    "#FB923C", "#D97706", "#F97316", "#92400E",
  ];
  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
}

// ⚠️ Normalise n'importe quelle forme de "category" (string OU objet Prisma)
// en string sûre. C'est ce garde-fou qui manquait et qui causait le crash.
function normalizeCategory(raw: any): string {
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && typeof raw.name === "string") return raw.name;
  return "Inconnu";
}

export function CategoryProductChart() {
  const [chartData, setChartData] = useState<CategoryProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategoryProducts() {
      try {
        const response = await fetch("/api/admin/dashboard/catparprod");
        if (!response.ok) throw new Error("Erreur réseau");

        const data: any[] = await response.json();

        // Normalisation défensive : quelle que soit la forme reçue,
        // on garantit que "category" est toujours une string avant
        // d'atteindre le composant Pie / Recharts.
        const safeData = (Array.isArray(data) ? data : []).map((item) => ({
          category: normalizeCategory(item.category),
          products: Number(item.products) || 0,
        }));

        const colors = generateUniqueColors(safeData.length);
        const coloredData = safeData.map((item, index) => ({
          ...item,
          fill: colors[index],
        }));

        setChartData(coloredData);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les catégories");
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

  if (error && chartData.length === 0) {
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
  label={(props: any) => {
    const { category, percent } = props;
    const pct = typeof percent === "number" ? percent : 0;
    return `${category} ${(pct * 100).toFixed(0)}%`;
  }}
  labelLine={true}
>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
          Distribution des Produits <TrendingUp className="h-4 w-4" />
        </div>

        <div className="flex flex-wrap gap-4">
          {chartData.map((item, i) => (
            <div key={`${item.category}-${i}`} className="flex items-center gap-2">
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