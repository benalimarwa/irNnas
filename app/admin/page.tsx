"use client";

import { useEffect, useState } from "react";
import { Package, Users, ShoppingCart, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryProductChart } from "@/components/CategoryProductChart";
import { StockProductChart } from "@/components/StockProductChart";
import { OrdersMonthChart } from "@/components/CommandeParMois";
import AdminNavbar from "@/components/AdminNavbar";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch("/api/admin/dashboard/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        console.error("Erreur lors de la récupération des stats");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"           // Ajout important
    className="absolute inset-0 w-full h-full object-cover"
    style={{ objectPosition: 'center' }}
  >
    <source src="/video/femme.mp4" type="video/mp4" />
    Votre navigateur ne supporte pas la vidéo.
  </video>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Users */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">Utilisateurs</CardTitle>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{stats.totalUsers}</div>
              <p className="text-blue-100 text-sm">Clients inscrits</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">Commandes</CardTitle>
                <ShoppingCart className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{stats.totalOrders}</div>
              <p className="text-green-100 text-sm">
                {stats.pendingOrders} en attente
              </p>
            </CardContent>
          </Card>

          {/* Total Products */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">Produits</CardTitle>
                <Package className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{stats.totalProducts}</div>
              <p className="text-purple-100 text-sm">Articles au catalogue</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-none shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">Revenus</CardTitle>
                <DollarSign className="h-8 w-8 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black mb-1">{stats.totalRevenue.toFixed(2)} TND</div>
              <p className="text-amber-100 text-sm">Chiffre d'affaires total</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Stock Chart */}
          <StockProductChart />

          {/* Category Distribution */}
          <CategoryProductChart />
        </div>

        {/* Stock Movement Chart - Full Width */}
        <div className="mb-10">
          <OrdersMonthChart />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Meilleures Ventes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Consultez les produits les plus vendus
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                Commandes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Gérez les dernières commandes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-600" />
                Nouveaux Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Découvrez vos nouveaux utilisateurs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}