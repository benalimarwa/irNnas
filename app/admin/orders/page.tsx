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
  size: string | null;
  color: string;
  colorHex: string;
  category: string | null;
  image: string | null;
}

interface OrderSnapshot {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  deliveryMethod: string;
  deliveryFee: number;
  total: number;
  address: string | null;
  city: string | null;
  governorate: string | null;
  postalCode: string | null;
  country: string | null;
  notes: string | null;
  products: any;
  createdAt: string;
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
  snapshot: OrderSnapshot | null;
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
      <span className={`inline-flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium border ${cfg.color}`}>
        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
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
          font-size: clamp(2rem, 5vw, 4.5rem);
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

      <div className="admin-orders min-h-screen relative overflow-x-hidden">
        {/* Vidéo d'arrière-plan */}
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="video-overlay" />

        {/* Grille dorée subtile */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 relative z-10">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-4 sm:px-6 py-2 rounded-full mb-4 sm:mb-6">
              <Package size={14} className="text-[#D4AF37]" />
              ADMINISTRATION
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[
              { label: "Total Commandes", count: orders.length, icon: Package },
              { label: "En Attente", count: orders.filter(o => o.status === "pending").length, icon: Clock },
              { label: "En Cours", count: orders.filter(o => ["confirmed","shipped"].includes(o.status)).length, icon: TrendingUp },
              { label: "Livrées", count: orders.filter(o => o.status === "delivered").length, icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 hover:border-[#D4AF37]/50 transition-all">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#D4AF37]/10 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-8">
                  <stat.icon className="text-[#D4AF37]" size={24} />
                </div>
                <div className="text-3xl sm:text-5xl font-bold tracking-tighter mb-1">{stat.count}</div>
                <div className="text-sm sm:text-base text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 sm:mb-10">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Filtrer par statut</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium transition-all ${
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
              <div className="glass-card rounded-2xl sm:rounded-3xl p-12 sm:p-20 text-center">
                <Package size={64} className="mx-auto mb-6 text-white/30" />
                <p className="text-xl sm:text-2xl font-semibold">Aucune commande trouvée</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div key={order.id} className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="p-5 sm:p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 mb-6 sm:mb-8">
                      <div>
                        <p className="text-white/60 text-xs sm:text-sm">Commande #{String(order.id).padStart(6, '0')}</p>
                        <p className="text-2xl sm:text-4xl font-bold text-[#D4AF37] mt-1 sm:mt-2">
                          {order.total.toFixed(2)} <span className="text-base sm:text-xl text-white/60">TND</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <StatusBadge status={order.status} />
                        <div className="text-xs sm:text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
                      <div>
                        <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">CLIENT</p>
                        <p className="font-semibold text-base sm:text-lg">{order.userName}</p>
                        <p className="text-white/60 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-white/60 text-xs sm:text-sm mb-1 sm:mb-2">LIVRAISON</p>
                        <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-lg">
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
  <p className="text-white/60 text-xs sm:text-sm mb-2 sm:mb-4">ARTICLES ({order.items.length})</p>
  <div className="space-y-3 sm:space-y-4">
    {order.items.map((item) => (
      <div key={item.id} className="flex items-center gap-3 sm:gap-4 bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-5">
        {item.image && (
          <img
            src={item.image}
            alt={item.productName}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm sm:text-base truncate">{item.productName}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-white/60">
            {item.category && <span>{item.category}</span>}
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border border-white/20 inline-block"
                style={{ backgroundColor: item.colorHex }}
              />
              {item.color}
            </span>
            {item.size && <span>Taille : {item.size}</span>}
            <span>Quantité : {item.quantity}</span>
          </div>
        </div>
        <p className="font-semibold text-[#D4AF37] text-sm sm:text-base ml-2 flex-shrink-0">
          {(item.price * item.quantity).toFixed(2)} TND
        </p>
      </div>
    ))}
  </div>
</div>
                        {/* Détails enregistrés (nouvelle table OrderSnapshot) */}
{order.snapshot && (
  <div className="mt-6 sm:mt-8 border-t border-white/10 pt-6 sm:pt-8">
    <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4">
      DÉTAILS DE LA COMMANDE (SNAPSHOT)
    </p>
    <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
      <div>
        <p className="text-white/40 text-xs mb-1">Contact au moment de la commande</p>
        <p className="text-sm sm:text-base">
          {order.snapshot.customerFirstName} {order.snapshot.customerLastName}
        </p>
        <p className="text-white/60 text-sm">{order.snapshot.customerEmail}</p>
        <p className="text-white/60 text-sm">{order.snapshot.customerPhone}</p>
      </div>

      {order.snapshot.deliveryMethod === "DELIVERY" && (
        <div>
          <p className="text-white/40 text-xs mb-1">Adresse de livraison</p>
          <p className="text-sm sm:text-base flex items-start gap-2">
            <MapPin size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <span>
              {order.snapshot.address && <>{order.snapshot.address}<br /></>}
              {order.snapshot.city}
              {order.snapshot.governorate ? `, ${order.snapshot.governorate}` : ""}
              {order.snapshot.postalCode ? ` — ${order.snapshot.postalCode}` : ""}
              {order.snapshot.country ? `, ${order.snapshot.country}` : ""}
            </span>
          </p>
        </div>
      )}

      {order.snapshot.notes && (
        <div className="sm:col-span-2">
          <p className="text-white/40 text-xs mb-1">Notes / Instructions</p>
          <p className="text-sm sm:text-base text-white/80">{order.snapshot.notes}</p>
        </div>
      )}

      <div>
        <p className="text-white/40 text-xs mb-1">Frais de livraison</p>
        <p className="text-sm sm:text-base">
          {order.snapshot.deliveryFee > 0 ? `${order.snapshot.deliveryFee} TND` : "Gratuit"}
        </p>
      </div>

      {order.snapshot.total > 0 && (
        <div>
          <p className="text-white/40 text-xs mb-1">Montant total (snapshot)</p>
          <p className="text-sm sm:text-base font-semibold text-[#D4AF37]">
            {order.snapshot.total.toFixed(2)} TND
          </p>
        </div>
      )}
    </div>
  </div>
)}
                    {/* Actions */}
                    <div className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4">
                      {order.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "confirmed")}
                            disabled={updatingOrderId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition flex-1 sm:flex-none text-sm sm:text-base"
                          >
                            Confirmer la commande
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "cancelled")}
                            disabled={updatingOrderId === order.id}
                            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition flex-1 sm:flex-none text-sm sm:text-base"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                          disabled={updatingOrderId === order.id}
                          className="bg-indigo-600 hover:bg-indigo-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition text-sm sm:text-base"
                        >
                          Marquer comme expédiée
                        </button>
                      )}
                      {order.status === "shipped" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "delivered")}
                          disabled={updatingOrderId === order.id}
                          className="bg-emerald-600 hover:bg-emerald-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition text-sm sm:text-base"
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