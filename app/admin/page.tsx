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
  status: string;
  createdAt: string;
  confirmedBy?: string;        // ← Ajouté
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

const STATUS_STYLES: Record<string, string> = { /* ... identique */ };
const STATUS_LABELS: Record<string, string> = { /* ... identique */ };

export default function AdminDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [expandedStock, setExpandedStock] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(false);

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0, pendingOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.log("Autoplay bloqué:", err));

      video.onerror = () => console.error("❌ Erreur vidéo - Vérifie que /public/video/mm.mp4 existe");
      video.onloadeddata = () => console.log("✅ Vidéo chargée correctement");
    }
  }, []);

  // Chargement du dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [s, tp, ro, ls] = await Promise.all([
          fetch("/api/admin/dashboard/stats").then(r => r.json()),
          fetch("/api/admin/dashboard/top-products").then(r => r.json()),
          fetch("/api/admin/dashboard/recent-orders").then(r => r.json()),
          fetch("/api/admin/dashboard/low-stock").then(r => r.json()),
        ]);

        setStats(s);
        setTopProducts(Array.isArray(tp) ? tp : []);
        setRecentOrders(Array.isArray(ro) ? ro : []);
        setLowStock(Array.isArray(ls) ? ls : []);
      } catch (e) {
        console.error("Erreur chargement dashboard:", e);
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

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');
        :root {
          --bg-primary: #0A0A0A;
          --accent-gold: #D4AF37;
          --glass-bg: rgba(17, 17, 17, 0.85);
          --glass-border: rgba(255, 255, 255, 0.08);
        }
        .admin-dashboard { font-family: 'Instrument Sans', system-ui, sans-serif; color: #F8F6F2; }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px -12px rgba(0,0,0,0.6);
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }
        .gradient-text {
          background: linear-gradient(135deg, #D4AF37, #F5E6A3);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .video-background {
          position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
        }
        .video-background video {
          width: 100%; height: 100%; object-fit: cover; opacity: 0.25;
          filter: brightness(0.65) contrast(1.1);
        }
        .video-overlay {
          position: fixed; inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(212,175,55,0.12), rgba(0,0,0,0.85));
          z-index: 1; pointer-events: none;
        }
      `}</style>

      <div className="admin-dashboard min-h-screen relative overflow-x-hidden">
   {/* === VIDÉO D'ARRIÈRE-PLAN === */}
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
    onError={(e) => {
      console.error("❌ Erreur chargement vidéo");
      e.currentTarget.style.display = 'none';
    }}
    onLoadedData={() => console.log("✅ Vidéo chargée avec succès")}
  >
    <source src="/video/mm.mp4" type="video/mp4" />
  </video>
</div>

<div className="video-overlay" />
        <div className="video-overlay" />

        {/* Grille de points dorés */}
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

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { 
                label: "Chiffre d'affaires", 
                value: stats.totalRevenue, 
                unit: "TND", 
                icon: TrendingUp, 
                color: "#D4AF37" 
              },
              { 
                label: "Commandes", 
                value: stats.totalOrders, 
                sub: stats.pendingOrders, 
                subLabel: "en attente", 
                icon: ShoppingBag, 
                color: "#D4AF37" 
              },
              { 
                label: "Produits", 
                value: stats.totalProducts, 
                icon: Package, 
                color: "#D4AF37" 
              },
              { 
                label: "Clients", 
                value: stats.totalUsers, 
                icon: Users, 
                color: "#D4AF37" 
              },
            ].map((kpi, i) => (
              <div key={i} className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 hover:border-[#D4AF37]/50 transition-all group">
                <div className="flex justify-between items-start mb-4 sm:mb-8">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#D4AF37]/10 to-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <kpi.icon className="text-[#D4AF37]" size={24} />
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1 text-xs sm:text-sm">
                    <ArrowUpRight size={16} /> +12%
                  </div>
                </div>

                <div className="text-2xl sm:text-5xl font-bold tracking-tighter mb-1 font-mono">
                  {kpi.value.toLocaleString('fr-FR')}
                  {kpi.unit && <span className="text-lg sm:text-2xl font-normal text-white/60"> {kpi.unit}</span>}
                </div>

                <div className="text-sm sm:text-base text-white/60">{kpi.label}</div>
                {kpi.sub !== undefined && (
                  <div className="text-xs sm:text-sm text-amber-400 mt-1">
                    {kpi.sub} {kpi.subLabel}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts - première ligne : Stock et Catégorie */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Stock Chart */}
            <div className={`glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all ${
              expandedStock ? 'lg:col-span-2' : ''
            }`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold">Niveaux de stock</h3>
                <button
                  onClick={() => setExpandedStock(!expandedStock)}
                  className="p-2 rounded-full hover:bg-white/10 transition"
                  aria-label={expandedStock ? "Réduire" : "Agrandir"}
                >
                  {expandedStock ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
              <div className={`transition-all duration-300 ${
                expandedStock ? 'h-[70vh]' : 'h-48 sm:h-64 md:h-80'
              }`}>
                <StockProductChart />
              </div>
            </div>

            {/* Category Chart */}
            <div className={`glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-all ${
              expandedCategory ? 'lg:col-span-2' : ''
            }`}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold">Distribution par catégorie</h3>
                <button
                  onClick={() => setExpandedCategory(!expandedCategory)}
                  className="p-2 rounded-full hover:bg-white/10 transition"
                  aria-label={expandedCategory ? "Réduire" : "Agrandir"}
                >
                  {expandedCategory ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
              <div className={`transition-all duration-300 ${
                expandedCategory ? 'h-[70vh]' : 'h-48 sm:h-64 md:h-80'
              }`}>
                <CategoryProductChart />
              </div>
            </div>
          </div>

          {/* Orders Chart (pleine largeur) */}
          <div className={`glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 transition-all ${
            expandedOrders ? 'h-[80vh]' : ''
          }`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold flex items-center justify-between w-full">
                <span>Évolution des commandes</span>
                <span className="text-sm text-white/50 hidden sm:inline">12 derniers mois</span>
              </h3>
              <button
                onClick={() => setExpandedOrders(!expandedOrders)}
                className="p-2 rounded-full hover:bg-white/10 transition ml-2"
                aria-label={expandedOrders ? "Réduire" : "Agrandir"}
              >
                {expandedOrders ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
            </div>
            <div className={`transition-all duration-300 ${
              expandedOrders ? 'h-[70vh]' : 'h-56 sm:h-72 md:h-96'
            }`}>
              <OrdersMonthChart />
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Top 5 Produits</h3>
              <div className="space-y-4 sm:space-y-5">
                {topProducts.length > 0 ? (
                  topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-xs sm:text-sm font-bold">
                        {i+1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{p.name}</p>
                        <div className="h-1.5 bg-white/10 rounded-full mt-1 sm:mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-[#D4AF37] transition-all" 
                            style={{ width: `${Math.min((p.sales / (topProducts[0]?.sales || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                      <div className="text-right text-xs sm:text-sm flex-shrink-0">
                        <p>{p.sales} ventes</p>
                        <p className="text-[#D4AF37]">{p.revenue.toFixed(0)} TND</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50">Aucune donnée disponible</p>
                )}
              </div>
            </div>

            {/* Low Stock */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <AlertTriangle className="text-amber-400" size={20} />
                <h3 className="text-lg sm:text-xl font-semibold">Stock faible</h3>
              </div>
              <div className="space-y-3">
                {lowStock.length > 0 ? (
                  lowStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                      <div>
                        <p className="font-medium text-sm sm:text-base">{p.name}</p>
                        <p className="text-xs text-white/50">{p.category}</p>
                      </div>
                      <span className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {p.stock} restants
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50">Aucun produit en stock faible</p>
                )}
              </div>
            </div>
          </div>

{/* Recent Orders */}
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