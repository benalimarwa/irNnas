'use client';

import { useState, useEffect, useRef } from "react";
import {
  Package, Truck, Clock, CheckCircle, XCircle, MapPin, TrendingUp,
} from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  total: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "En attente",  color: "bg-amber-500/10 text-amber-400 border-amber-500/30",  icon: Clock        },
  confirmed: { label: "Confirmée",   color: "bg-blue-500/10 text-blue-400 border-blue-500/30",    icon: CheckCircle  },
  shipped:   { label: "Expédiée",    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30", icon: Truck     },
  delivered: { label: "Livrée",      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  cancelled: { label: "Annulée",     color: "bg-red-500/10 text-red-400 border-red-500/30",       icon: XCircle      },
};

const FILTER_OPTIONS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Lecture automatique de la vidéo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(o => o.status === filter);

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-medium border ${cfg.color}`}>
        <Icon className="w-4 h-4" />
        {cfg.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] flex items-center gap-4 text-xl">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          Chargement des commandes...
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        .admin-orders {
          font-family: 'Instrument Sans', system-ui, sans-serif;
          background: #0A0A0A;
          color: #F8F6F2;
        }

        .glass-card {
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .video-background {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 0;
          overflow: hidden;
        }
        .video-background video {
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.22;
          filter: brightness(0.7) contrast(1.1);
        }
        .video-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(212,175,55,0.12), rgba(0,0,0,0.88));
          z-index: 1;
        }
      `}</style>

      <div className="admin-orders min-h-screen relative overflow-hidden">
        {/* Vidéo d'arrière-plan */}
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="video-overlay" />

        {/* Grille dorée subtile */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />


        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-6">
              <Package size={16} className="text-[#D4AF37]" />
              ADMINISTRATION
            </div>
            
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Commandes", count: orders.length, icon: Package },
              { label: "En Attente", count: orders.filter(o => o.status === "pending").length, icon: Clock },
              { label: "En Cours", count: orders.filter(o => ["confirmed","shipped"].includes(o.status)).length, icon: TrendingUp },
              { label: "Livrées", count: orders.filter(o => o.status === "delivered").length, icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 hover:border-[#D4AF37]/50 transition-all">
                <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-8">
                  <stat.icon className="text-[#D4AF37]" size={32} />
                </div>
                <div className="text-5xl font-bold tracking-tighter mb-2">{stat.count}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="glass-card rounded-3xl p-8 mb-10">
            <h3 className="text-lg font-semibold mb-6">Filtrer par statut</h3>
            <div className="flex flex-wrap gap-3">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all ${
                    filter === f 
                      ? "bg-[#D4AF37] text-black" 
                      : "bg-white/5 border border-white/10 hover:border-white/30"
                  }`}
                >
                  {f === "all" ? `Toutes (${orders.length})` : STATUS_CONFIG[f]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liste des commandes */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="glass-card rounded-3xl p-20 text-center">
                <Package size={80} className="mx-auto mb-8 text-white/30" />
                <p className="text-2xl font-semibold">Aucune commande trouvée</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="glass-card rounded-3xl overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                      <div>
                        <p className="text-white/60 text-sm">Commande #{String(order.id).padStart(6, '0')}</p>
                        <p className="text-4xl font-bold text-[#D4AF37] mt-2">
                          {order.total.toFixed(2)} <span className="text-xl text-white/60">TND</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <div className="text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <p className="text-white/60 text-sm mb-2">CLIENT</p>
                        <p className="font-semibold text-lg">{order.userName}</p>
                        <p className="text-white/60">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-2">LIVRAISON</p>
                        <div className="flex items-center gap-3 text-lg">
                          {order.deliveryMethod === "DELIVERY" ? (
                            <>🚚 Livraison à domicile</>
                          ) : (
                            <>🏬 Retrait en magasin</>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Articles */}
                    <div>
                      <p className="text-white/60 text-sm mb-4">ARTICLES ({order.items.length})</p>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between bg-white/5 rounded-2xl p-5">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-white/60">Quantité : {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-[#D4AF37]">
                              {(item.price * item.quantity).toFixed(2)} TND
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-10 flex flex-wrap gap-4">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            disabled={updatingOrderId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-2xl font-semibold transition flex-1 md:flex-none"
                          >
                            Confirmer la commande
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            disabled={updatingOrderId === order.id}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-8 py-4 rounded-2xl font-semibold transition"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          disabled={updatingOrderId === order.id}
                          className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-2xl font-semibold transition"
                        >
                          Marquer comme expédiée
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={updatingOrderId === order.id}
                          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-2xl font-semibold transition"
                        >
                          Marquer comme livrée
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}