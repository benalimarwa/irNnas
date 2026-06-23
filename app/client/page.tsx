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
    { title: 'Style Finder', description: 'Personnalisez votre style avec notre IA', icon: Sparkles, href: '/client/quiz', tag: 'IA', accent: 'gold' },
    { title: 'Collection', description: 'Pièces exclusives & éditions limitées', icon: ShoppingBag, href: '/catalog', tag: 'SS 25', accent: 'coral' },
    { title: 'Wishlist', description: 'Vos pièces sauvegardées', icon: Heart, href: '/favorites', tag: 'Favoris', accent: 'rose' },
    { title: 'Commandes', description: "Suivi & historique d'achats", icon: Package, href: '/orders', tag: 'Suivi', accent: 'teal' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Instrument+Sans:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body, html {
          max-width: 100vw;
          overflow-x: hidden;
        }

        .glass-card {
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.5rem;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.4rem, 8vw, 4.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #D4AF37, #FF6B6B, #4ECDC4);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 6s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .dashboard-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem 4rem;
          width: 100%;
        }

        .action-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(212, 175, 55, 0.25);
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .dashboard-container { padding: 1.5rem 1rem 3rem; }
          .glass-card { padding: 2rem 1.5rem; border-radius: 1.25rem; }
          .hero-title { font-size: clamp(2rem, 9vw, 3.5rem); }
          .stat-card { padding: 1.75rem !important; }
        }
      `}</style>

      <div className="dashboard-container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

          {/* Hero Greeting */}
          <div className="glass-card" style={{ padding: '3rem 1.75rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1.25rem', borderRadius: '9999px', marginBottom: '1.5rem' }}>
                <Sparkles size={16} color="#D4AF37" />
                ESPACE CLIENT EXCLUSIF
              </div>

              <h1 className="hero-title" style={{ marginBottom: '1.25rem' }}>
                Bonjour,<br />
                <span className="gradient-text">
                  {user?.firstName || 'Cher Client'}
                </span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                Bienvenue dans votre univers. Découvrez l'excellence, suivez vos commandes et affinez votre signature stylistique.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: <Package color="#D4AF37" size={28} />, bg: 'rgba(212,175,55,0.1)', value: data.ordersCount, label: 'Commandes passées' },
              { icon: <Heart color="#FF85A1" size={28} />, bg: 'rgba(255,133,161,0.1)', value: data.wishlistCount, label: 'Pièces sauvegardées' },
              { icon: <Award color="#4ECDC4" size={28} />, bg: 'rgba(78,205,196,0.1)', value: data.loyaltyPoints, label: 'Points de fidélité' },
            ].map((stat, i) => (
              <div key={i} className="glass-card stat-card" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div style={{ width: '3.5rem', height: '3.5rem', background: stat.bg, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>
                  {loading ? '—' : stat.value}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Accès Rapide</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {quickActions.map((action, i) => {
                const accentMap: Record<string, string> = { gold: '#D4AF37', coral: '#FF6B6B', rose: '#FF85A1', teal: '#4ECDC4' };
                const color = accentMap[action.accent] ?? '#D4AF37';
                return (
                  <Link
                    key={i}
                    href={action.href}
                    className="action-card glass-card"
                    style={{ padding: '2.25rem', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none', color: '#F8F6F2' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                      <div style={{ width: '4rem', height: '4rem', borderRadius: '0.75rem', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <action.icon size={32} color={color} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', padding: '0.35rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px' }}>
                        {action.tag}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{action.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{action.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}