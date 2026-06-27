// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  ArrowLeft,
  Truck,
  Store,
  ChevronRight,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  size: string | null;
  product: {
    id: number;
    name: string;
    images: string[];
    category: string;
  };
};

type Order = {
  id: number;
  total: number;
  status: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  createdAt: string;
  items: OrderItem[];
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusLabels: Record<string, string> = {
    pending: "En attente",
    confirmed: "Confirmée",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    confirmed: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
    shipped: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    cancelled: "bg-red-500/10 text-red-400 border border-red-500/30",
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-30"
          src="/video/mm.mp4"
        />
        <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 z-[-1]" />
        
        <div className="flex flex-col items-center relative z-10">
          <div className="w-16 h-16 border-4 border-white/20 border-t-[#D4AF37] rounded-full animate-spin" />
          <p className="mt-6 text-lg text-white/70">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden overflow-x-hidden">
      {/* === VIDÉO D'ARRIÈRE-PLAN === */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-[-2] opacity-40"
        src="/video/mm.mp4"
      />
      
      {/* Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/80 z-[-1]" />
      
      {/* Texture subtile */}
      <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-[-1]" />

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-20 relative z-10">
        
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="group-hover:-translate-x-1 transition" size={20} />
            Retour à l’accueil
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-10 sm:mb-12 flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl font-semibold transition-all duration-300 text-sm ${
              filter === "all"
                ? "bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black shadow-xl shadow-[#D4AF37]/40"
                : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
            }`}
          >
            Toutes ({orders.length})
          </button>

          {Object.entries(statusLabels).map(([status, label]) => {
            const count = orders.filter((o) => o.status === status).length;
            if (count === 0) return null;

            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl font-semibold transition-all duration-300 text-sm flex items-center gap-2 ${
                  filter === status
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black shadow-xl shadow-[#D4AF37]/40"
                    : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/80"
                }`}
              >
                <span className={`p-1 rounded-xl ${statusColors[status]}`}>
                  {status === "pending" || status === "cancelled" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </span>
                {label}
                <span className="text-xs opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 sm:py-28">
            <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 mb-6 sm:mb-8">
              <ShoppingBag size={48} className="text-white/40" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4">Aucune commande trouvée</h2>
            <p className="text-white/60 max-w-md mx-auto text-base sm:text-lg">
              {filter === "all" 
                ? "Vous n'avez pas encore passé de commande." 
                : "Aucune commande correspond à ce filtre."}
            </p>
            {filter === "all" && (
              <Link
                href="/catalog"
                className="mt-8 sm:mt-10 inline-block bg-gradient-to-r from-[#D4AF37] to-white text-black px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl sm:rounded-3xl font-semibold text-base sm:text-lg hover:scale-105 transition"
              >
                Explorer la Collection
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredOrders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const firstThreeItems = order.items.slice(0, 3);

              return (
                <div
                  key={order.id}
                  className="group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-[#D4AF37]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D4AF37]/10"
                >
                  <div className="p-6 sm:p-9">
                    {/* En-tête */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-white/10">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/10 to-white/5 flex items-center justify-center border border-[#D4AF37]/20">
                          {order.deliveryMethod === "DELIVERY" ? (
                            <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                          ) : (
                            <Store className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                          )}
                        </div>

                        <div>
                          <p className="text-xs sm:text-sm text-white/50">Commande #{String(order.id).padStart(6, "0")}</p>
                          <p className="text-lg sm:text-2xl font-semibold mt-1 break-words">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium ${statusColors[order.status]}`}>
                        {order.status === "delivered" ? (
                          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                        {statusLabels[order.status]}
                      </div>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 sm:gap-10 mt-8 sm:mt-10">
                      {/* Articles */}
                      <div className="lg:col-span-7">
                        <p className="uppercase text-xs tracking-widest text-white/50 mb-4">Articles commandés</p>
                        <div className="flex gap-3 sm:gap-5 overflow-x-auto pb-4">
                          {firstThreeItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-black/60 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 relative"
                            >
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-contain p-2 sm:p-3"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl sm:text-5xl">👕</div>
                              )}

                              {item.quantity > 1 && (
                                <div className="absolute top-1 sm:top-3 right-1 sm:right-3 bg-[#D4AF37] text-black text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ring-2 ring-black">
                                  {item.quantity}
                                </div>
                              )}
                              {item.size && (
                                <div className="absolute bottom-1 sm:bottom-3 left-1 sm:left-3 text-[10px] sm:text-xs font-mono bg-black/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded text-[#D4AF37]">
                                  {item.size}
                                </div>
                              )}
                            </div>
                          ))}

                          {order.items.length > 3 && (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 bg-black/60 rounded-xl sm:rounded-2xl flex items-center justify-center border border-dashed border-white/20">
                              <div className="text-center">
                                <p className="text-xl sm:text-2xl font-semibold text-[#D4AF37]">+{order.items.length - 3}</p>
                                <p className="text-[10px] sm:text-xs text-white/50">autres</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total & Action */}
                      <div className="lg:col-span-5 flex flex-col justify-between">
                        <div className="text-right">
                          <p className="text-sm text-white/50">Montant total</p>
                          <p className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-white bg-clip-text text-transparent tracking-tighter mt-2">
                            {order.total.toFixed(2)} <span className="text-xl sm:text-2xl font-normal text-white/60">TND</span>
                          </p>
                          <p className="text-white/60 mt-1">{totalItems} article{totalItems > 1 ? "s" : ""}</p>
                        </div>

                        <Link
                          href={`/client/orders/${order.id}`}
                          className="mt-6 sm:mt-8 lg:mt-0 group flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-white hover:brightness-110 text-black font-semibold py-4 sm:py-5 px-8 sm:px-10 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:scale-[1.03]"
                        >
                          Voir les détails
                          <ChevronRight className="group-hover:translate-x-1 transition" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}