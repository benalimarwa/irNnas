'use client';

import { useEffect, useState, useRef } from "react";
import {
  Package, Users, ShoppingBag, TrendingUp,
  ArrowUpRight, AlertTriangle, Clock, Award,
  Maximize2, Minimize2,
} from "lucide-react";
import { CategoryProductChart } from "@/components/CategoryProductChart";
import { StockProductChart } from "@/components/StockProductChart";
import { OrdersMonthChart } from "@/components/CommandeParMois";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface RecentOrder {
  id: number;
  userName: string;
  total: number;
  status?: string;
  createdAt: string;
  confirmedBy?: string;        // Nom de l'admin qui a confirmé
  confirmedById?: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

export default function AdminDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [expandedStock, setExpandedStock] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vidéo background
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.log("Autoplay bloqué:", err));
    }
  }, []);

  // Chargement des données du dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setError(null);
        
        const [statsRes, topRes, recentRes, lowRes] = await Promise.all([
          fetch("/api/admin/dashboard/stats"),
          fetch("/api/admin/dashboard/top-products"),
          fetch("/api/admin/dashboard/recent-orders"),
          fetch("/api/admin/dashboard/low-stock"),
        ]);

        if (!statsRes.ok || !topRes.ok || !recentRes.ok || !lowRes.ok) {
          throw new Error("Une ou plusieurs requêtes ont échoué");
        }

        const [s, tp, ro, ls] = await Promise.all([
          statsRes.json(),
          topRes.json(),
          recentRes.json(),
          lowRes.json(),
        ]);

        setStats({
          totalUsers: s.totalUsers || 0,
          totalOrders: s.totalOrders || 0,
          totalProducts: s.totalProducts || 0,
          totalRevenue: s.totalRevenue || 0,
          pendingOrders: s.pendingOrders || 0,
        });

        setTopProducts(Array.isArray(tp) ? tp : []);
        setRecentOrders(Array.isArray(ro) ? ro : []);
        setLowStock(Array.isArray(ls) ? ls : []);

      } catch (e) {
        console.error("Erreur chargement dashboard:", e);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] flex items-center gap-4 text-xl">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-xl mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#D4AF37] text-black rounded-full font-medium hover:bg-[#F5E6A3] transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Styles globaux */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');
        :root {
          --bg-primary: #0A0A0A;
          --accent-gold: #D4AF37;
          --glass-bg: rgba(17, 17, 17, 0.85);
          --glass-border: rgba(255, 255, 255, 0.08);
        }
        .admin-dashboard { 
          font-family: 'Instrument Sans', system-ui, sans-serif; 
          color: #F8F6F2; 
        }
        /* ... reste de tes styles ... */
      `}</style>

      <div className="admin-dashboard min-h-screen relative overflow-x-hidden">
        {/* Vidéo + overlays (gardé tel quel) */}
        <div className="video-background">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.25, filter: 'brightness(0.65) contrast(1.1)' }}
          >
            <source src="/video/pp.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="video-overlay" />
        <div className="video-overlay" />

        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 relative z-10">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6">
              <Award size={14} className="text-[#D4AF37]" />
              ADMINISTRATION
            </div>
            <h1 className="hero-title gradient-text">Tableau de bord</h1>
          </div>

          {/* KPI Cards - inchangé */}
          {/* Charts - inchangé */}
          {/* Top Products & Low Stock - inchangé */}

          {/* Recent Orders - adapté */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-3">
              <Clock className="text-[#D4AF37]" size={20} /> 
              Commandes Confirmées
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-white/10 text-white/60 text-xs sm:text-sm">
                    <th className="text-left pb-3 sm:pb-4">N°</th>
                    <th className="text-left pb-3 sm:pb-4">Client</th>
                    <th className="text-left pb-3 sm:pb-4">Confirmée par</th>
                    <th className="text-left pb-3 sm:pb-4 hidden md:table-cell">Date</th>
                    <th className="text-right pb-3 sm:pb-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition">
                        <td className="py-3 sm:py-5">#{order.id}</td>
                        <td className="py-3 sm:py-5 font-medium">{order.userName}</td>
                        <td className="py-3 sm:py-5 text-emerald-400 font-medium">
                          {order.confirmedBy || "Admin"}
                        </td>
                        <td className="py-3 sm:py-5 text-white/60 hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 sm:py-5 text-right font-semibold text-[#D4AF37]">
                          {order.total.toFixed(2)} TND
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/50">
                        Aucune commande confirmée pour le moment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}