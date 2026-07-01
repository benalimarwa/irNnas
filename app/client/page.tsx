'use client';

import { useUser } from '@clerk/nextjs';
import { Sparkles, ShoppingBag, Heart, Package, Award, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type RecentOrderItem = {
  productName: string;
  productImage: string | null;
};

type RecentOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  items: RecentOrderItem[];
};

type DashboardData = {
  ordersCount: number;
  wishlistCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  recentOrders: RecentOrder[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#fbbf24',
  confirmed: '#3b82f6',
  shipped: '#818cf8',
  delivered: '#34d399',
  cancelled: '#f87171',
};
export default function ClientDashboard() {
  const { user } = useUser();

  const [data, setData] = useState<DashboardData>({
    ordersCount: 0,
    wishlistCount: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard', { cache: 'no-store' });
        if (res.ok) {
          const result: DashboardData = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const quickActions = [
    { title: 'Style Finder', description: 'Personnalisez votre style avec notre IA', icon: Sparkles, href: '/client/quiz', tag: 'IA', color: '#3b82f6' },
    { title: 'Collection', description: 'Pièces exclusives & éditions limitées', icon: ShoppingBag, href: '/catalog', tag: 'SS 25', color: '#60a5fa' },
    { title: 'Wishlist', description: 'Vos pièces sauvegardées', icon: Heart, href: '/favorites', tag: 'Favoris', color: '#818cf8' },
    { title: 'Commandes', description: "Suivi & historique d'achats", icon: Package, href: '/orders', tag: 'Suivi', color: '#38bdf8' },
  ];

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

      {/* Dot grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 0.8px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Subtle radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 10%, rgba(59,130,246,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#60a5fa]/60 font-light mb-6 border border-[#1e3a5f] px-4 py-2 rounded-full">
            <Sparkles size={12} className="text-[#3b82f6]" />
            Espace client exclusif
          </div>

        </div>

        {/* ── Stats ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-14">
          {[
            { icon: Package, label: 'Commandes passées', value: data.ordersCount, color: '#3b82f6' },
            { icon: Heart,   label: 'Pièces sauvegardées', value: data.wishlistCount, color: '#818cf8' },
            { icon: Award,   label: 'Points de fidélité',  value: data.loyaltyPoints, color: '#38bdf8' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${stat.color}18`, border: `1px solid ${stat.color}30` }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-4xl font-light tracking-tight mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[#4a6a8a] text-xs uppercase tracking-widest font-light">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Divider ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#4a6a8a] font-light">Accès rapide</span>
          <div className="flex-1 border-t border-[#1e3a5f]" />
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="group bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-7 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5 block"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="flex items-start justify-between mb-8">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${action.color}18`, border: `1px solid ${action.color}30` }}
                >
                  <action.icon size={20} style={{ color: action.color }} />
                </div>
                <span className="text-[10px] uppercase tracking-[0.15em] font-light text-[#4a6a8a] border border-[#1e3a5f] px-3 py-1 rounded-full">
                  {action.tag}
                </span>
              </div>

              <h3 className="text-base font-light text-white mb-2 tracking-wide">
                {action.title}
              </h3>
              <p className="text-[#4a6a8a] text-xs font-light leading-relaxed mb-6">
                {action.description}
              </p>

              <div
                className="flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] font-light transition-colors"
                style={{ color: action.color }}
              >
                Accéder
                <ChevronRight
                  size={12}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        {/* ── Total spent teaser ────────────────────────────────────────────── */}
       {/* ── Commandes récentes ───────────────────────────────────────────── */}
        {data.recentOrders.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-4 mb-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#4a6a8a] font-light">
                Commandes récentes
              </span>
              <div className="flex-1 border-t border-[#1e3a5f]" />
              <Link
                href="/client/orders"
                className="text-[10px] uppercase tracking-[0.15em] text-[#3b82f6] hover:text-[#60a5fa] font-light flex items-center gap-1 transition"
              >
                Tout voir <ChevronRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.recentOrders.map((order) => {
                const statusColor = STATUS_COLORS[order.status] || '#4a6a8a';
                return (
                  <Link
                    key={order.id}
                    href={`/client/orders/${order.id}`}
                    className="group bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-5 sm:p-6 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5 block"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {/* Images produits en cascade */}
                    <div className="flex items-center mb-5 -space-x-3">
                      {order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0f1f33] bg-[#0a1628] flex-shrink-0"
                            style={{ zIndex: order.items.length - idx }}
                          >
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-contain p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={18} className="text-[#4a6a8a]" />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="w-14 h-14 rounded-2xl border-2 border-[#0f1f33] bg-[#0a1628] flex items-center justify-center">
                          <Package size={18} className="text-[#4a6a8a]" />
                        </div>
                      )}
                      {order.itemsCount > order.items.length && (
                        <div className="w-14 h-14 rounded-2xl border-2 border-[#0f1f33] bg-[#1a2a44] flex items-center justify-center text-[11px] text-[#8aabca] font-light">
                          +{order.itemsCount - order.items.length}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light">
                        #{String(order.id).padStart(8, '0')}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-[0.15em] font-light px-3 py-1 rounded-full"
                        style={{ background: `${statusColor}18`, border: `1px solid ${statusColor}30`, color: statusColor }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-light text-white tracking-tight">
                        {order.total.toFixed(2)} <span className="text-xs text-[#4a6a8a]">TND</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] text-[#4a6a8a] font-light">
                        <Clock size={11} />
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

       
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
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