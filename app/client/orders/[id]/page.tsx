'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Package, Truck, Store, Calendar, Home, ArrowLeft, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  size: string | null;
  product: { id: number; name: string; images: string[]; category: string };
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
  pending:   "En attente de confirmation",
  confirmed: "Commande confirmée",
  shipped:   "En cours d'expédition",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-500/10 border-amber-500/30 text-amber-400",
  confirmed: "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#60a5fa]",
  shipped:   "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  delivered: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  cancelled: "bg-red-500/10 border-red-500/30 text-red-400",
};

export default function OrderConfirmationPage() {
  const params  = useParams();
  const orderId = params?.id as string;

  const [order,   setOrder]   = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setOrder(d.order); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">
          IRNAS
        </div>
      </div>
    </div>
  );

  // ── Not found ────────────────────────────────────────────────────────────
  if (!order) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-[#0f1f33] border border-[#1e3a5f] rounded-full flex items-center justify-center mb-6">
          <Package size={36} className="text-[#4a6a8a]" />
        </div>
        <h2 className="text-2xl font-light text-white mb-3">Commande introuvable</h2>
        <Link href="/client/catalog"
          className="text-[#3b82f6] hover:text-white text-sm uppercase tracking-[0.15em] font-light transition">
          Retour au catalogue →
        </Link>
      </div>
    </div>
  );

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const displayId  = String(order.id).padStart(8, "0");

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage:"radial-gradient(#3b82f6 0.8px,transparent 1px)", backgroundSize:"60px 60px" }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">

        {/* Back */}
        <Link href="/client/orders"
          className="inline-flex items-center gap-2 text-[#4a6a8a] hover:text-[#3b82f6] transition mb-10 group text-sm uppercase tracking-[0.15em] font-light">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Mes commandes
        </Link>

        {/* ── Success header ─────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2">
            Commande <span className="text-[#3b82f6]">confirmée</span>
          </h1>
          <p className="text-[#4a6a8a] text-sm uppercase tracking-widest font-light">
            Merci pour votre achat
          </p>
        </div>

        {/* ── Order ID & Status ───────────────────────────────────────────── */}
        <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 mb-6 hover:border-[#3b82f6]/30 transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest font-light mb-2">
                Numéro de commande
              </p>
              <p className="text-3xl sm:text-4xl font-light tracking-tight text-white">
                #<span className="text-[#3b82f6]">{displayId}</span>
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest font-light mb-2">Statut</p>
              <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-light border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                {["delivered","confirmed","shipped"].includes(order.status)
                  ? <CheckCircle className="w-3.5 h-3.5" />
                  : <AlertCircle className="w-3.5 h-3.5" />
                }
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-6 mb-10">

          {/* LEFT */}
          <div className="lg:col-span-7 space-y-6">

            {/* Delivery info */}
            <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 hover:border-[#3b82f6]/30 transition">
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                {order.deliveryMethod === "DELIVERY"
                  ? <Truck  className="w-5 h-5 text-[#3b82f6]" />
                  : <Store  className="w-5 h-5 text-[#3b82f6]" />
                }
                Mode de livraison
              </h2>

              <div className={`flex items-start gap-4 p-5 rounded-2xl border ${
                order.deliveryMethod === "DELIVERY"
                  ? "bg-[#3b82f6]/5 border-[#3b82f6]/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  order.deliveryMethod === "DELIVERY"
                    ? "bg-[#3b82f6]/10"
                    : "bg-emerald-500/10"
                }`}>
                  {order.deliveryMethod === "DELIVERY"
                    ? <Truck  className="w-5 h-5 text-[#3b82f6]" />
                    : <Store  className="w-5 h-5 text-emerald-400" />
                  }
                </div>
                <div>
                  <p className="text-sm font-light text-white mb-1">
                    {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                  </p>
                  <p className="text-[#4a6a8a] text-xs font-light leading-relaxed">
                    {order.deliveryMethod === "DELIVERY"
                      ? "Votre commande sera livrée à l'adresse indiquée dans les 2 à 5 jours ouvrables."
                      : "Votre commande sera prête dans les 24h. Nous vous contacterons par téléphone."}
                  </p>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 hover:border-[#3b82f6]/30 transition">
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#3b82f6]" />
                Date de commande
              </h2>
              <p className="text-2xl sm:text-3xl font-light tracking-tight text-white">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              <p className="text-[#4a6a8a] text-sm font-light mt-2">
                à {new Date(order.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* RIGHT — Order summary */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 h-full hover:border-[#3b82f6]/30 transition">
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                <Package className="w-5 h-5 text-[#3b82f6]" />
                Articles ({totalItems})
              </h2>

              <div className="space-y-4 mb-6 max-h-[340px] overflow-y-auto pr-1"
                style={{ scrollbarWidth:"thin", scrollbarColor:"#1e3a5f transparent" }}>
                {order.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#1e3a5f] flex-shrink-0 bg-[#0a1628]">
                      <img
                        src={item.product.images[0] || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-light text-white truncate">{item.product.name}</h4>
                      {item.size && (
                        <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest mt-0.5">
                          Taille : {item.size}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[#4a6a8a] text-xs font-light">×{item.quantity}</span>
                        <span className="text-[#60a5fa] text-sm font-light">
                          {(item.price * item.quantity).toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1e3a5f] pt-5">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-[0.15em] font-light text-white">Total</span>
                  <span className="text-2xl font-light text-white">
                    {order.total.toFixed(2)} <span className="text-sm text-[#4a6a8a]">TND</span>
                  </span>
                </div>
                <p className="text-[#4a6a8a] text-[10px] uppercase tracking-[0.15em] font-light mt-2 text-right">
                  Paiement à la {order.deliveryMethod === "DELIVERY" ? "livraison" : "récupération"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/client/catalog"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#3b82f6] text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-[#2563eb] transition">
            <Home size={15} /> Continuer mes achats
          </Link>
          <Link href="/client/orders"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-[#1e3a5f] text-[#8aabca] text-xs uppercase tracking-[0.15em] font-light hover:border-[#3b82f6]/40 hover:text-[#3b82f6] transition">
            Toutes mes commandes
          </Link>
        </div>
      </div>

      {/* Footer */}
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