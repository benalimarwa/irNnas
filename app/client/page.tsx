'use client';

import { useUser } from '@clerk/nextjs';
import { Sparkles, ShoppingBag, Heart, Package, ArrowUpRight, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type RecentOrder = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
};

type DashboardData = {
  ordersCount: number;
  wishlistCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  recentOrders: RecentOrder[];
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
        const res = await fetch('/api/dashboard', {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const result: DashboardData = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Style Finder',
      description: 'Personnalisez votre style avec notre IA',
      icon: Sparkles,
      href: '/client/quiz',
      tag: 'IA',
      accent: 'gold',
    },
    {
      title: 'Collection',
      description: 'Pièces exclusives & éditions limitées',
      icon: ShoppingBag,
      href: '/catalog',
      tag: 'SS 25',
      accent: 'coral',
    },
    {
      title: 'Wishlist',
      description: 'Vos pièces sauvegardées',
      icon: Heart,
      href: '/favorites',
      tag: 'Favoris',
      accent: 'rose',
    },
    {
      title: 'Commandes',
      description: "Suivi & historique d'achats",
      icon: Package,
      href: '/orders',
      tag: 'Suivi',
      accent: 'teal',
    },
  ];

  return (
    <>
      <style>{`
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
        }
        .gradient-text {
          background: var(--gradient-multi);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 6s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .action-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--accent-gold) !important;
          box-shadow: 0 25px 50px -12px rgba(212, 175, 55, 0.25);
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          border-color: rgba(212, 175, 55, 0.4) !important;
          transform: translateY(-4px);
        }
        .order-item:hover {
          background: rgba(212, 175, 55, 0.08);
        }
      `}</style>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>

            {/* ── Main column ── */}
            <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

              {/* Hero greeting */}
              <div
                className="glass-card"
                style={{ borderRadius: '1.5rem', padding: '4rem', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: '24rem', height: '24rem', background: 'radial-gradient(circle, rgba(212,175,55,0.2), rgba(255,107,107,0.1))', borderRadius: '50%', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', bottom: '-8rem', left: '-5rem', width: '20rem', height: '20rem', background: 'rgba(78,205,196,0.1)', borderRadius: '50%', filter: 'blur(60px)' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '3px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1.5rem', borderRadius: '9999px', marginBottom: '1.5rem' }}>
                    <Sparkles size={14} color="#D4AF37" />
                    ESPACE CLIENT EXCLUSIF
                  </div>

                  <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>
                    Bonjour,<br />
                    <span className="gradient-text">
                      {user?.firstName || 'Cher Client'}
                    </span>
                  </h1>

                  <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', maxWidth: '32rem' }}>
                    Bienvenue dans votre univers. Découvrez l'excellence, suivez vos commandes et affinez votre signature stylistique.
                  </p>

                  <div style={{ marginTop: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <Link
                      href="/catalog"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #D4AF37, #F5E6A3)', color: '#000', padding: '1rem 2.5rem', borderRadius: '1rem', fontWeight: 600, textDecoration: 'none' }}
                    >
                      Explorer la Collection
                      <ShoppingBag size={20} />
                    </Link>
                    <Link
                      href="/orders"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', border: '1px solid rgba(255,255,255,0.3)', padding: '1rem 2.25rem', borderRadius: '1rem', fontWeight: 500, textDecoration: 'none', color: '#F8F6F2' }}
                    >
                      Mes Commandes
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {[
                  { icon: <Package color="#D4AF37" size={28} />, bg: 'rgba(212,175,55,0.1)', value: data.ordersCount, label: 'Commandes passées', badge: { text: 'Actif', color: '#6ee7b7' } },
                  { icon: <Heart color="#FF85A1" size={28} />, bg: 'rgba(255,133,161,0.1)', value: data.wishlistCount, label: 'Pièces sauvegardées' },
                  { icon: <Award color="#4ECDC4" size={28} />, bg: 'rgba(78,205,196,0.1)', value: data.loyaltyPoints, label: 'Points de fidélité', valueColor: '#4ECDC4' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card stat-card" style={{ borderRadius: '1.5rem', padding: '2.25rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                      <div style={{ width: '3.5rem', height: '3.5rem', background: stat.bg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stat.icon}
                      </div>
                      {stat.badge && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 500, color: stat.badge.color }}>
                          <TrendingUp size={14} /> {stat.badge.text}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.05em', fontVariantNumeric: 'tabular-nums', color: stat.valueColor ?? '#F8F6F2', marginBottom: '0.5rem' }}>
                      {loading ? '—' : stat.value}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '2rem' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>Accès Rapide</h2>
                  <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {quickActions.map((action, i) => {
                    const accentMap: Record<string, string> = {
                      gold: '#D4AF37', coral: '#FF6B6B', rose: '#FF85A1', teal: '#4ECDC4',
                    };
                    const color = accentMap[action.accent] ?? '#D4AF37';
                    return (
                      <Link
                        key={i}
                        href={action.href}
                        className="action-card glass-card"
                        style={{ borderRadius: '1.5rem', padding: '2.5rem', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', color: '#F8F6F2' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                          <div style={{ width: '4rem', height: '4rem', borderRadius: '0.75rem', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <action.icon size={30} color={color} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', padding: '0.4rem 1.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', color: 'rgba(255,255,255,0.6)' }}>
                            {action.tag}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>{action.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', flex: 1 }}>{action.description}</p>
                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={20} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Profile card */}
              <div className="glass-card" style={{ borderRadius: '1.5rem', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ width: '6rem', height: '6rem', background: 'linear-gradient(135deg, #D4AF37, #FF6B6B, #4ECDC4)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 300, border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
                    {user?.firstName?.[0] ?? 'C'}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.85rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', padding: '0.4rem 1.25rem', borderRadius: '9999px' }}>
                      <Award size={14} /> Membre Gold
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total dépensé</span>
                    <span style={{ fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.03em' }}>{data.totalSpent.toLocaleString()} TND</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Points fidélité</span>
                    <span style={{ fontWeight: 600, fontSize: '1.4rem', letterSpacing: '-0.03em', color: '#4ECDC4' }}>{data.loyaltyPoints}</span>
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="glass-card" style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
                  Commandes Récentes
                </div>

                <div>
                  {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Chargement...</div>
                  ) : data.recentOrders.length > 0 ? (
                    data.recentOrders.slice(0, 3).map((order) => (
                      <Link
                        key={order.id}
                        href="/orders"
                        className="order-item"
                        style={{ display: 'block', padding: '1.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', color: '#F8F6F2', transition: 'background 0.2s' }}
                      >
                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <div style={{ width: '3rem', height: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Package color="#D4AF37" size={22} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 500, fontSize: '1rem' }}>Commande #{order.id}</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 500, padding: '0.3rem 0.9rem', borderRadius: '9999px', background: order.status === 'delivered' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: order.status === 'delivered' ? '#6ee7b7' : '#fcd34d', flexShrink: 0 }}>
                            {order.status === 'delivered' ? 'Livré' : 'En cours'}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                      Aucune commande récente
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link href="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#D4AF37', textDecoration: 'none', fontWeight: 500 }}>
                    Voir tout l'historique <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}