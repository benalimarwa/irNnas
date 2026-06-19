'use client';

import { useEffect, useState, useRef } from "react";
import {
  Package, Users, ShoppingBag, TrendingUp,
  ArrowUpRight, AlertTriangle, Clock, Award,
} from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";
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
}

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  category: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  confirmed: "bg-blue-500/10 text-blue-400",
  shipped: "bg-indigo-500/10 text-indigo-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function AdminDashboard() {
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Lecture automatique de la vidéo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqué:", e));
    }
  }, []);

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

        .admin-dashboard {
          font-family: 'Instrument Sans', system-ui, sans-serif;
          color: #F8F6F2;
        }

        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px -12px rgba(0,0,0,0.6);
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #D4AF37, #F5E6A3);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Vidéo Background */
        .video-background {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .video-background video {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.25;
          filter: brightness(0.65) contrast(1.1);
        }
        .video-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(212,175,55,0.12), rgba(0,0,0,0.85));
          z-index: 1;
          pointer-events: none;
        }
      `}</style>

      <div className="admin-dashboard min-h-screen relative overflow-hidden">
        {/* === Vidéo d'arrière-plan === */}
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="video-overlay" />

        {/* Grille de points dorés */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-6">
              <Award size={16} className="text-[#D4AF37]" />
              ADMINISTRATION
            </div>
            <h1 className="hero-title gradient-text">Tableau de bord</h1>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
              <div key={i} className="glass-card rounded-3xl p-8 border border-white/10 hover:border-[#D4AF37]/50 transition-all group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/10 to-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <kpi.icon className="text-[#D4AF37]" size={32} />
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1 text-sm">
                    <ArrowUpRight size={18} /> +12%
                  </div>
                </div>

                <div className="text-5xl font-bold tracking-tighter mb-2 font-mono">
                  {kpi.value.toLocaleString('fr-FR')}
                  {kpi.unit && <span className="text-2xl font-normal text-white/60"> {kpi.unit}</span>}
                </div>

                <div className="text-white/60">{kpi.label}</div>
                {kpi.sub !== undefined && (
                  <div className="text-sm text-amber-400 mt-1">
                    {kpi.sub} {kpi.subLabel}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6">Niveaux de stock</h3>
              <div className="h-80"><StockProductChart /></div>
            </div>
            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6">Distribution par catégorie</h3>
              <div className="h-80"><CategoryProductChart /></div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between">
              Évolution des commandes
              <span className="text-sm text-white/50">12 derniers mois</span>
            </h3>
            <div className="h-96"><OrdersMonthChart /></div>
          </div>

          {/* Bottom Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="glass-card rounded-3xl p-8">
              <h3 className="text-xl font-semibold mb-6">Top 5 Produits</h3>
              <div className="space-y-5">
                {topProducts.length > 0 ? (
                  topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm font-bold">
                        {i+1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{p.name}</p>
                        <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-[#D4AF37] transition-all" 
                            style={{ width: `${Math.min((p.sales / (topProducts[0]?.sales || 1)) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                      <div className="text-right text-sm">
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
            <div className="glass-card rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="text-amber-400" />
                <h3 className="text-xl font-semibold">Stock faible</h3>
              </div>
              <div className="space-y-3">
                {lowStock.length > 0 ? (
                  lowStock.map((p) => (
                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-white/50">{p.category}</p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-sm ${p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
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
          <div className="glass-card rounded-3xl p-8 mt-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
              <Clock className="text-[#D4AF37]" /> Commandes Récentes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-white/60 text-sm">
                    <th className="text-left pb-4">N°</th>
                    <th className="text-left pb-4">Client</th>
                    <th className="text-left pb-4">Statut</th>
                    <th className="text-left pb-4">Date</th>
                    <th className="text-right pb-4">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition">
                        <td className="py-5">#{order.id}</td>
                        <td className="py-5 font-medium">{order.userName}</td>
                        <td className="py-5">
                          <span className={`px-4 py-1 rounded-full text-xs ${STATUS_STYLES[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="py-5 text-white/60">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-5 text-right font-semibold text-[#D4AF37]">
                          {order.total.toFixed(2)} TND
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/50">
                        Aucune commande récente
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