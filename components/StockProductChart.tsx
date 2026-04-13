import { useState, useEffect } from "react";
import { Package, TrendingDown, AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StockData = {
  name: string;
  stock: number;
};

export function StockProductChart() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        const response = await fetch("/api/admin/dashboard/stockparprod");

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Erreur HTTP ${response.status}`);
        }

        const data: StockData[] = await response.json();

        if (!data || data.length === 0) {
          // Données fallback si aucune donnée
          setStockData([
            { name: "Dior Sauvage", stock: 68 },
            { name: "Chanel N°5", stock: 52 },
            { name: "Bleu de Chanel", stock: 45 },
            { name: "La Vie Est Belle", stock: 71 },
            { name: "Black Opium YSL", stock: 39 },
            { name: "Creed Aventus", stock: 28 },
            { name: "J'adore Dior", stock: 61 },
            { name: "One Million", stock: 47 },
          ]);
        } else {
          setStockData(data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des stocks:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur inconnue est survenue"
        );
        
        // Données fallback en cas d'erreur
        setStockData([
          { name: "Dior Sauvage", stock: 68 },
          { name: "Chanel N°5", stock: 52 },
          { name: "Bleu de Chanel", stock: 45 },
          { name: "La Vie Est Belle", stock: 71 },
        ]);
        
        setIsLoading(false);
      }
    }

    fetchStockData();
  }, []);

  // Fonction pour déterminer la couleur selon le niveau de stock
  const getBarColor = (stock: number) => {
    if (stock < 20) return "#EF4444"; // Rouge - stock critique
    if (stock < 40) return "#F59E0B"; // Orange - stock faible
    if (stock < 60) return "#3B82F6"; // Bleu - stock moyen
    return "#10B981"; // Vert - stock bon
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

  const totalStock = stockData.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = stockData.filter(item => item.stock < 30).length;
  const avgStock = Math.round(totalStock / stockData.length);

  // Tooltip personnalisé
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const stockLevel = 
        data.stock < 20 ? "Critique" :
        data.stock < 40 ? "Faible" :
        data.stock < 60 ? "Moyen" : "Bon";
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-gray-100 mb-2">
            {data.name}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Stock: <span className="font-bold text-purple-600">{data.stock} unités</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Niveau: <span className={`font-semibold ${
              stockLevel === "Critique" ? "text-red-600" :
              stockLevel === "Faible" ? "text-orange-600" :
              stockLevel === "Moyen" ? "text-blue-600" : "text-green-600"
            }`}>{stockLevel}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col shadow-xl border-none bg-white dark:bg-gray-800">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Stock par Produit
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Top {stockData.length} produits - Stock total: {totalStock} unités
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={stockData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: '#6B7280', fontSize: 11 }}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
              label={{ 
                value: 'Unités en stock', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6B7280' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="stock"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            >
              {stockData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.stock)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-4">
        {/* Statistiques */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-600" />
            <span className="text-gray-700 dark:text-gray-300">
              Moyenne: <span className="font-bold">{avgStock} unités</span>
            </span>
          </div>
          
          {lowStockItems > 0 && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {lowStockItems} produit{lowStockItems > 1 ? 's' : ''} en stock faible
              </span>
            </div>
          )}
        </div>

        {/* Légende des couleurs */}
        <div className="flex flex-wrap gap-4 w-full justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Critique (&lt;20)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Faible (&lt;40)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Moyen (&lt;60)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Bon (≥60)
            </span>
          </div>
        </div>

        {error && (
          <div className="w-full mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ Données de démonstration affichées
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}