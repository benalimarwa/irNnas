'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Package, Truck, Store, Calendar, Home, ArrowLeft
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

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de confirmation",
  confirmed: "Commande confirmée",
  shipped: "En cours d'expédition",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] text-2xl flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          Chargement de la commande...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <Package size={80} className="mx-auto mb-6 text-white/30" />
          <h2 className="text-3xl font-bold mb-4">Commande introuvable</h2>
          <Link href="/client/catalog" className="text-[#D4AF37] hover:text-white text-lg">
            Retour au catalogue →
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const displayId = String(order.id).padStart(8, "0");

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        .order-page {
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
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #D4AF37, #F5E6A3, #D4AF37);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
      `}</style>

      <div className="order-page min-h-screen relative overflow-hidden overflow-x-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0" />

        <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 relative z-10">
          {/* Back Button */}
          <Link
            href="/client/orders"
            className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-white mb-6 sm:mb-10 transition"
          >
            <ArrowLeft size={20} /> Mes commandes
          </Link>

          {/* Success Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full mb-6 sm:mb-8 border border-emerald-500/30">
              <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-400" />
            </div>

            <h1 className="hero-title gradient-text mb-2">Commande confirmée !</h1>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
              Merci pour votre commande. Nous vous tiendrons informé de son évolution.
            </p>
          </div>

          {/* Order ID & Status */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
              <div>
                <p className="text-white/60 text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">Numéro de commande</p>
                <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-[#D4AF37]">#{displayId}</p>
              </div>

              <div className="sm:text-right">
                <p className="text-white/60 text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">Statut</p>
                <span className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Delivery Info */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                  {order.deliveryMethod === "DELIVERY" ? (
                    <Truck className="text-[#D4AF37]" size={28} />
                  ) : (
                    <Store className="text-[#D4AF37]" size={28} />
                  )}
                  Mode de livraison
                </h2>

                <div className="text-base sm:text-lg">
                  <p className="font-semibold mb-2">
                    {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                  </p>
                  <p className="text-white/70 leading-relaxed">
                    {order.deliveryMethod === "DELIVERY"
                      ? "Votre commande sera livrée à l'adresse indiquée dans les 2 à 5 jours ouvrables."
                      : "Votre commande sera prête pour retrait en magasin dans les 24h. Nous vous contacterons par téléphone."}
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                  <Calendar className="text-[#D4AF37]" size={28} />
                  Date de commande
                </h2>
                <p className="text-2xl sm:text-4xl font-light tracking-tight">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-white/60 mt-2 text-sm sm:text-base">
                  à {new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-10 h-full">
                <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
                  <Package className="text-[#D4AF37]" size={28} />
                  Vos articles ({totalItems})
                </h2>

                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 sm:gap-5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                        <img
                          src={item.product.images[0] || "/placeholder.jpg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-base sm:text-lg leading-tight break-words">
                          {item.product.name}
                        </h4>
                        {item.size && (
                          <p className="text-white/50 text-xs sm:text-sm">Taille : {item.size}</p>
                        )}
                        <div className="flex justify-between items-center mt-2 sm:mt-3">
                          <span className="text-white/60 text-sm sm:text-base">×{item.quantity}</span>
                          <span className="font-semibold text-[#D4AF37] text-sm sm:text-base">
                            {(item.price * item.quantity).toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 sm:pt-8 border-t border-white/10">
                  <div className="flex justify-between text-2xl sm:text-3xl font-bold">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{order.total.toFixed(2)} TND</span>
                  </div>
                  <p className="text-white/50 text-xs sm:text-sm mt-2 sm:mt-3 text-right">
                    Paiement à la {order.deliveryMethod === "DELIVERY" ? "livraison" : "récupération"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 sm:mt-16">
            <Link
              href="/client/catalog"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg hover:brightness-110 transition"
            >
              <Home size={22} />
              Continuer mes achats
            </Link>

            <Link
              href="/client/orders"
              className="inline-flex items-center justify-center gap-3 border border-white/30 hover:border-white/60 px-6 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-medium transition text-sm sm:text-base"
            >
              Voir toutes mes commandes
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}