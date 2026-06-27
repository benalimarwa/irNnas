// app/client/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, ArrowLeft, Truck, Store,
  ChevronRight, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";

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

const STATUS_LABELS: Record<string, string> = {
  pending:   "En attente",
  confirmed: "Confirmée",
  shipped:   "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  confirmed: "bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/30",
  shipped:   "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
  delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/30",
};

export default function MyOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>("all");

  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setOrders(d.orders || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />

      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#3b82f6 0.8px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">

        {/* ── Back link ──────────────────────────────────────────────────────── */}
        <Link
          href="/client"
          className="inline-flex items-center gap-2 text-[#4a6a8a] hover:text-[#3b82f6] transition mb-10 group text-sm uppercase tracking-[0.15em] font-light"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Retour à l'accueil
        </Link>

        {/* ── Title ──────────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Mes <span className="text-[#3b82f6]">Commandes</span>
          </h1>
          <p className="mt-2 text-sm text-[#4a6a8a] tracking-widest uppercase font-light">
            {orders.length} commande{orders.length !== 1 ? "s" : ""} au total
          </p>
        </div>

        {/* ── Filtres ────────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-12">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-light border transition ${
              filter === "all"
                ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                : "border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-white"
            }`}
          >
            Toutes ({orders.length})
          </button>

          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = orders.filter(o => o.status === status).length;
            if (count === 0) return null;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-light border transition flex items-center gap-2 ${
                  filter === status
                    ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                    : "border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-white"
                }`}
              >
                {label}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Empty state ────────────────────────────────────────────────────── */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-28 border border-[#1e3a5f] rounded-3xl">
            <div className="mx-auto w-20 h-20 bg-[#0f1f33] border border-[#1e3a5f] rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={36} className="text-[#4a6a8a]" />
            </div>
            <h2 className="text-2xl font-light mb-3">Aucune commande trouvée</h2>
            <p className="text-[#4a6a8a] text-sm font-light max-w-sm mx-auto">
              {filter === "all"
                ? "Vous n'avez pas encore passé de commande."
                : "Aucune commande ne correspond à ce filtre."}
            </p>
            {filter === "all" && (
              <Link
                href="/client/catalog"
                className="mt-8 inline-block px-8 py-3 rounded-full border border-[#3b82f6] text-[#3b82f6] text-xs uppercase tracking-[0.15em] font-light hover:bg-[#3b82f6]/10 transition"
              >
                Explorer la collection
              </Link>
            )}
          </div>
        ) : (
          // ── Order cards ──────────────────────────────────────────────────────
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const totalItems      = order.items.reduce((s, i) => s + i.quantity, 0);
              const firstThreeItems = order.items.slice(0, 3);

              return (
                <div
                  key={order.id}
                  className="group bg-[#0f1f33] border border-[#1a2a44] rounded-3xl overflow-hidden transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5"
                >
                  <div className="p-6 sm:p-8">

                    {/* Card header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1e3a5f]">
                      <div className="flex items-center gap-4">

                        {/* Icon */}
                        <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                          {order.deliveryMethod === "DELIVERY"
                            ? <Truck className="w-5 h-5 text-[#3b82f6]" />
                            : <Store className="w-5 h-5 text-[#3b82f6]" />
                          }
                        </div>

                        <div>
                          <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest font-light">
                            Commande #{String(order.id).padStart(6, "0")}
                          </p>
                          <p className="text-base font-light text-white mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              weekday: "long", day: "numeric",
                              month: "long",   year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-light uppercase tracking-[0.15em] ${STATUS_COLORS[order.status]}`}>
                        {["delivered", "confirmed", "shipped"].includes(order.status)
                          ? <Package className="w-3 h-3" />
                          : <AlertCircle className="w-3 h-3" />
                        }
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="grid lg:grid-cols-12 gap-6 mt-6">

                      {/* Product thumbnails */}
                      <div className="lg:col-span-7">
                        <p className="text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mb-4">
                          Articles commandés
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {firstThreeItems.map(item => (
                            <div
                              key={item.id}
                              className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#0a1628] border border-[#1e3a5f] rounded-2xl overflow-hidden"
                            >
                              {item.product.images?.[0] ? (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">👕</div>
                              )}

                              {item.quantity > 1 && (
                                <div className="absolute top-1.5 right-1.5 bg-[#3b82f6] text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                  {item.quantity}
                                </div>
                              )}
                              {item.size && (
                                <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono bg-[#0a1628]/90 px-1.5 py-0.5 rounded text-[#60a5fa]">
                                  {item.size}
                                </div>
                              )}
                            </div>
                          ))}

                          {order.items.length > 3 && (
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-[#0a1628] border border-dashed border-[#1e3a5f] rounded-2xl flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-lg font-light text-[#3b82f6]">+{order.items.length - 3}</p>
                                <p className="text-[9px] text-[#4a6a8a] uppercase tracking-widest">autres</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total + CTA */}
                      <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                        <div className="sm:text-right">
                          <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest font-light">
                            Montant total
                          </p>
                          <p className="text-3xl sm:text-4xl font-light text-white mt-1 tracking-tight">
                            {order.total.toFixed(2)}{" "}
                            <span className="text-lg text-[#4a6a8a]">TND</span>
                          </p>
                          <p className="text-xs text-[#4a6a8a] mt-1 font-light">
                            {totalItems} article{totalItems > 1 ? "s" : ""}
                            {" · "}
                            {order.deliveryMethod === "DELIVERY" ? "Livraison" : "Retrait magasin"}
                          </p>
                        </div>

                        <Link
                          href={`/client/orders/${order.id}`}
                          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-[#3b82f6] text-[#3b82f6] text-xs uppercase tracking-[0.15em] font-light hover:bg-[#3b82f6]/10 transition group/btn"
                        >
                          Voir les détails
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition" />
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

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1a2a44] py-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
          </div>
          <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">© 2026 IRNAS — Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[10px] text-[#2a3f6a] tracking-widest font-light uppercase">
            <Link href="#" className="hover:text-[#3b82f6] transition">Mentions</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Confidentialité</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}