'use client';

import { useUser } from '@clerk/nextjs';
import {
    Sparkles,
    ShoppingBag,
    Heart,
    Package,
    Award,
    ChevronRight,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Star,
    Zap,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

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
    const [counters, setCounters] = useState({ orders: 0, wishlist: 0, points: 0 });
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/dashboard', { cache: 'no-store' });
                if (res.ok) {
                    const result: DashboardData = await res.json();
                    setData(result);
                    // Animate counters
                    animateCounters(result.ordersCount, result.wishlistCount, result.loyaltyPoints);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const animateCounters = (orders: number, wishlist: number, points: number) => {
        const duration = 1500;
        const steps = 40;
        const stepTime = duration / steps;

        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const ease = 1 - Math.pow(1 - progress, 3);

            setCounters({
                orders: Math.round(orders * ease),
                wishlist: Math.round(wishlist * ease),
                points: Math.round(points * ease),
            });

            if (currentStep >= steps) {
                clearInterval(interval);
                setCounters({ orders, wishlist, points });
            }
        }, stepTime);
    };

    const quickActions = [
        {
            title: 'Style Finder',
            description: 'Personnalisez votre style avec notre IA',
            icon: Sparkles,
            href: '/client/quiz',
            tag: 'IA',
            color: '#3b82f6',
            gradient: 'from-blue-500/20 to-blue-600/10',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'Collection',
            description: 'Pièces exclusives & éditions limitées',
            icon: ShoppingBag,
            href: '/catalog',
            tag: 'SS 25',
            color: '#60a5fa',
            gradient: 'from-sky-500/20 to-sky-600/10',
            bg: 'bg-sky-500/10',
        },
        {
            title: 'Wishlist',
            description: 'Vos pièces sauvegardées',
            icon: Heart,
            href: '/favorites',
            tag: 'Favoris',
            color: '#818cf8',
            gradient: 'from-indigo-500/20 to-indigo-600/10',
            bg: 'bg-indigo-500/10',
        },
        {
            title: 'Commandes',
            description: "Suivi & historique d'achats",
            icon: Package,
            href: '/orders',
            tag: 'Suivi',
            color: '#38bdf8',
            gradient: 'from-cyan-500/20 to-cyan-600/10',
            bg: 'bg-cyan-500/10',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-[#1a2a44] border-t-[#3b82f6] animate-spin shadow-[0_0_40px_rgba(59,130,246,0.15)]" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.4em] animate-pulse">
                        IRNAS
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080e1a] text-white overflow-x-hidden">

            {/* ── Ambient background ────────────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sky-500/4 rounded-full blur-[90px]" />
            </div>

            {/* ── Dot grid ──────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04]"
                style={{
                    backgroundImage: 'radial-gradient(#3b82f6 0.8px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">

                {/* ── Header ────────────────────────────────────────────────── */}
                <header className="mb-16">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#60a5fa]/50 font-light mb-4 border border-[#1a2a44]/60 px-4 py-2 rounded-full bg-[#0f1f33]/30 backdrop-blur-sm">
                                <Sparkles size={12} className="text-[#3b82f6]" />
                                Espace client exclusif
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white/90">
                                Bonjour, <span className="text-[#60a5fa]">{user?.firstName || 'Client'}</span>
                            </h1>
                            <p className="text-[#4a6a8a] text-sm font-light mt-2 tracking-wide">
                                Bienvenue dans votre espace personnel — gérez vos commandes, favoris et bien plus.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1a2a44] bg-[#0f1f33]/50 backdrop-blur-sm">
                                <Shield size={14} className="text-[#3b82f6]" />
                                <span className="text-[10px] tracking-[0.15em] text-[#4a6a8a] font-light">Compte vérifié</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Stats ────────────────────────────────────────────────── */}
                <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-16">
                    {[
                        { icon: Package, label: 'Commandes passées', value: counters.orders, color: '#3b82f6', suffix: '' },
                        { icon: Heart, label: 'Pièces sauvegardées', value: counters.wishlist, color: '#818cf8', suffix: '' },
                        { icon: Award, label: 'Points de fidélité', value: counters.points, color: '#38bdf8', suffix: ' pts' },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="group relative bg-[#0f1f33]/50 backdrop-blur-xl border border-[#1a2a44] rounded-3xl p-7 sm:p-9 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5 overflow-hidden"
                        >
                            {/* Glow on hover */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at 30% 20%, ${stat.color}10, transparent 70%)` }} />

                            <div className="relative z-10">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105"
                                    style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}25` }}
                                >
                                    <stat.icon size={22} style={{ color: stat.color }} />
                                </div>
                                <div className="text-4xl font-light tracking-tight mb-1" style={{ color: stat.color }}>
                                    {stat.value}{stat.suffix}
                                </div>
                                <div className="text-[#4a6a8a] text-[11px] uppercase tracking-[0.2em] font-light">
                                    {stat.label}
                                </div>
                                {/* Decorative line */}
                                <div className="mt-4 h-[1px] w-12 bg-gradient-to-r from-[#3b82f6]/20 to-transparent" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Total spent ───────────────────────────────────────────── */}
                <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0f1f33]/60 to-[#1a2a44]/30 border border-[#1a2a44] backdrop-blur-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
                                <TrendingUp size={22} className="text-[#3b82f6]" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-[#4a6a8a] font-light">Total dépensé</div>
                                <div className="text-2xl font-light text-white/90 tracking-tight">
                                    {data.totalSpent.toFixed(2)} <span className="text-[#4a6a8a] text-sm font-light">TND</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light">
                            <span className="flex items-center gap-1.5">
                                <Star size={12} className="text-[#fbbf24]" />
                                {data.ordersCount > 0 ? 'Client fidèle' : 'Nouveau client'}
                            </span>
                            <span className="w-px h-4 bg-[#1a2a44]" />
                            <span className="text-[#3b82f6]">{data.ordersCount} commandes</span>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ────────────────────────────────────────── */}
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#4a6a8a] font-light">Accès rapide</span>
                        <div className="flex-1 border-t border-[#1a2a44]" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {quickActions.map((action, i) => (
                            <Link
                                key={i}
                                href={action.href}
                                className="group relative bg-[#0f1f33]/50 backdrop-blur-xl border border-[#1a2a44] rounded-3xl p-6 sm:p-7 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5 overflow-hidden block"
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                style={{ background: `radial-gradient(ellipse at 30% 0%, ${action.color}10, transparent 70%)` }} />

                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                                            style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
                                        >
                                            <action.icon size={22} style={{ color: action.color }} />
                                        </div>
                                        <span className="text-[9px] uppercase tracking-[0.2em] font-light text-[#4a6a8a] border border-[#1a2a44] px-3 py-1.5 rounded-full bg-[#0a1628]/50">
                                            {action.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-light text-white/90 mb-2 tracking-wide">
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
                                            className="group-hover:translate-x-1.5 transition-transform duration-300"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ── Recent Orders ────────────────────────────────────────── */}
                {data.recentOrders.length > 0 && (
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#4a6a8a] font-light">
                                Commandes récentes
                            </span>
                            <div className="flex-1 border-t border-[#1a2a44]" />
                            <Link
                                href="/client/orders"
                                className="text-[10px] uppercase tracking-[0.15em] text-[#3b82f6] hover:text-[#60a5fa] font-light flex items-center gap-1 transition-colors group"
                            >
                                Tout voir
                                <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {data.recentOrders.map((order) => {
                                const statusColor = STATUS_COLORS[order.status] || '#4a6a8a';
                                return (
                                    <Link
                                        key={order.id}
                                        href={`/client/orders/${order.id}`}
                                        className="group relative bg-[#0f1f33]/50 backdrop-blur-xl border border-[#1a2a44] rounded-3xl p-5 sm:p-6 transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5 overflow-hidden block"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div className="relative z-10">
                                            {/* Product images */}
                                            <div className="flex items-center mb-5 -space-x-3">
                                                {order.items.length > 0 ? (
                                                    order.items.slice(0, 3).map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0f1f33] bg-[#0a1628] flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                                                            style={{ zIndex: 3 - idx }}
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
                                                {order.itemsCount > 3 && (
                                                    <div className="w-14 h-14 rounded-2xl border-2 border-[#0f1f33] bg-[#1a2a44] flex items-center justify-center text-[11px] text-[#8aabca] font-light">
                                                        +{order.itemsCount - 3}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light">
                                                    #{String(order.id).padStart(8, '0')}
                                                </span>
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.15em] font-light px-3 py-1 rounded-full"
                                                    style={{
                                                        background: `${statusColor}15`,
                                                        border: `1px solid ${statusColor}25`,
                                                        color: statusColor,
                                                    }}
                                                >
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-light text-white/90 tracking-tight">
                                                    {order.total.toFixed(2)}{' '}
                                                    <span className="text-xs text-[#4a6a8a] font-light">TND</span>
                                                </span>
                                                <span className="flex items-center gap-1.5 text-[10px] text-[#4a6a8a] font-light">
                                                    <Clock size={11} />
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

           
        </div>
    );
}