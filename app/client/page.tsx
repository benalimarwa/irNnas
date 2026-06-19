// app/client/page.tsx
'use client';

import ClientNavbar from '@/components/ClientNavbar';
import { useUser } from '@clerk/nextjs';
import { Sparkles, ShoppingBag, Heart, Package, ArrowUpRight, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

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
  const videoRef = useRef<HTMLVideoElement>(null);

  const [data, setData] = useState<DashboardData>({
    ordersCount: 0,
    wishlistCount: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force la lecture de la vidéo
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay bloqué:", e));
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const res = await fetch('/api/dashboard', {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`);
        }

        const result: DashboardData = await res.json();
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError("Impossible de charger les données du tableau de bord");
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
      description: 'Suivi & historique d\'achats',
      icon: Package,
      href: '/orders',
      tag: 'Suivi',
      accent: 'teal',
    },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        :root {
          --bg-primary: #0A0A0A;
          --bg-secondary: #111111;
          --bg-elevated: rgba(20, 20, 25, 0.85);
          --border-light: rgba(255, 255, 255, 0.08);
          --text-primary: #F8F6F2;
          --text-secondary: rgba(248, 246, 242, 0.75);
          --text-muted: rgba(248, 246, 242, 0.5);
          
          --accent-gold: #D4AF37;
          --accent-gold-dark: #B8942E;
          --accent-coral: #FF6B6B;
          --accent-teal: #4ECDC4;
          --accent-violet: #9B59B6;
          --accent-rose: #FF85A1;
          --accent-indigo: #5D9BEC;
          
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%);
          --gradient-multi: linear-gradient(135deg, #D4AF37, #FF6B6B, #4ECDC4, #9B59B6);
          --glass-bg: rgba(17, 17, 17, 0.75);
          --glass-border: rgba(255, 255, 255, 0.08);
        }

        .dashboard {
          font-family: 'Instrument Sans', system-ui, sans-serif;
          color: var(--text-primary);
        }

        /* Vidéo en arrière-plan */
        .video-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }
        .video-background video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          filter: brightness(0.7) contrast(1.1) saturate(1.2);
        }
        .video-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 20% 30%, rgba(212,175,55,0.15), rgba(0,212,255,0.1), rgba(10,10,12,0.92));
          z-index: 1;
          pointer-events: none;
        }

        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(24px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px -12px rgba(0, 0, 0, 0.6);
        }

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
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .action-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--accent-gold);
          box-shadow: 0 25px 50px -12px rgba(212, 175, 55, 0.25);
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: rgba(212, 175, 55, 0.4);
          transform: translateY(-4px);
        }

        .order-item:hover {
          background: rgba(212, 175, 55, 0.08);
        }
      `}</style>

      <div className="min-h-screen">
       
        <div className="video-overlay" />

        {/* Grille de points animés */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              
              {/* Hero Greeting */}
              <div className="glass-card rounded-3xl p-12 md:p-16 relative overflow-hidden border border-white/10">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/20 to-[#FF6B6B]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-[#4ECDC4]/10 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-6">
                    <Sparkles size={16} className="text-[#D4AF37]" />
                    ESPACE CLIENT EXCLUSIF
                  </div>
                  
                  <h1 className="hero-title mb-6 leading-none">
                    Bonjour,<br />
                    <span className="gradient-text">
                      {user?.firstName || 'Cher Client'}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-white/70 max-w-lg">
                    Bienvenue dans votre univers. Découvrez l'excellence, suivez vos commandes et affinez votre signature stylistique.
                  </p>

                  <div className="mt-12 flex flex-wrap gap-4">
                    <Link
                      href="/catalog"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black px-10 py-4 rounded-2xl font-semibold hover:brightness-110 transition-all active:scale-95"
                    >
                      Explorer la Collection
                      <ShoppingBag size={22} />
                    </Link>
                    <Link
                      href="/orders"
                      className="inline-flex items-center gap-3 border border-white/30 hover:border-white/60 px-9 py-4 rounded-2xl font-medium transition-all"
                    >
                      Mes Commandes
                    </Link>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-card stat-card rounded-3xl p-9 border border-white/10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37]/10 to-white/5 rounded-2xl flex items-center justify-center">
                      <Package className="text-[#D4AF37]" size={32} />
                    </div>
                    <div className="text-emerald-400 flex items-center gap-1.5 text-sm font-medium">
                      <TrendingUp size={18} /> Actif
                    </div>
                  </div>
                  <div className="text-6xl font-bold tracking-tighter mb-2 font-mono">
                    {loading ? "—" : data.ordersCount}
                  </div>
                  <div className="text-white/60 text-lg">Commandes passées</div>
                </div>

                <div className="glass-card stat-card rounded-3xl p-9 border border-white/10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#FF85A1]/10 to-white/5 rounded-2xl flex items-center justify-center">
                      <Heart className="text-[#FF85A1]" size={32} />
                    </div>
                  </div>
                  <div className="text-6xl font-bold tracking-tighter mb-2 font-mono">
                    {loading ? "—" : data.wishlistCount}
                  </div>
                  <div className="text-white/60 text-lg">Pièces sauvegardées</div>
                </div>

                <div className="glass-card stat-card rounded-3xl p-9 border border-white/10 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#4ECDC4]/10 to-white/5 rounded-2xl flex items-center justify-center">
                      <Award className="text-[#4ECDC4]" size={32} />
                    </div>
                  </div>
                  <div className="text-6xl font-bold tracking-tighter mb-2 text-[#4ECDC4] font-mono">
                    {loading ? "—" : data.loyaltyPoints}
                  </div>
                  <div className="text-white/60 text-lg">Points de fidélité</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-semibold tracking-tight">Accès Rapide</h2>
                  <div className="h-px flex-1 mx-8 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {quickActions.map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      className="action-card glass-card rounded-3xl p-10 group border border-white/10 hover:border-white/30 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110
                          ${action.accent === 'gold' ? 'bg-gradient-to-br from-[#D4AF37]/20 to-transparent' : ''}
                          ${action.accent === 'coral' ? 'bg-gradient-to-br from-[#FF6B6B]/20 to-transparent' : ''}
                          ${action.accent === 'rose' ? 'bg-gradient-to-br from-[#FF85A1]/20 to-transparent' : ''}
                          ${action.accent === 'teal' ? 'bg-gradient-to-br from-[#4ECDC4]/20 to-transparent' : ''}
                        `}>
                          <action.icon className="text-white" size={36} />
                        </div>
                        <span className="text-xs font-semibold tracking-widest px-5 py-2 bg-white/5 rounded-full text-white/70">
                          {action.tag}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl font-semibold mb-4 tracking-tight">{action.title}</h3>
                      <p className="text-white/60 text-[17px] flex-1">{action.description}</p>
                      
                      <div className="mt-10 flex justify-end">
                        <div className="w-11 h-11 rounded-2xl bg-white/5 group-hover:bg-[#D4AF37] group-hover:text-black flex items-center justify-center transition-all">
                          <ArrowUpRight size={24} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Profile Card */}
              <div className="glass-card rounded-3xl p-10 border border-white/10">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#D4AF37] via-[#FF6B6B] to-[#4ECDC4] rounded-3xl flex items-center justify-center text-5xl font-light border-2 border-white/20 shadow-inner">
                    {user?.firstName?.[0] ?? 'C'}
                  </div>
                  <div>
                    <div className="text-3xl font-semibold tracking-tight">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="inline-flex items-center gap-2 mt-3 text-sm bg-gradient-to-r from-[#D4AF37]/10 to-white/5 border border-[#D4AF37]/30 text-[#D4AF37] px-6 py-2 rounded-full">
                      <Award size={16} />
                      Membre Gold
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-8 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total dépensé</span>
                    <span className="font-semibold text-2xl tracking-tighter">{data.totalSpent.toLocaleString()} TND</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Points fidélité</span>
                    <span className="font-semibold text-2xl tracking-tighter text-[#4ECDC4]">{data.loyaltyPoints}</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                <div className="px-8 py-7 border-b border-white/10 text-sm uppercase tracking-[2px] text-white/50">
                  Commandes Récentes
                </div>
                
                <div className="divide-y divide-white/10">
                  {loading ? (
                    <div className="p-16 text-center text-white/40">Chargement...</div>
                  ) : data.recentOrders.length > 0 ? (
                    data.recentOrders.slice(0, 3).map((order) => (
                      <Link 
                        key={order.id} 
                        href="/orders"
                        className="order-item block px-8 py-7 hover:bg-white/5 transition group"
                      >
                        <div className="flex gap-6 items-center">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 transition">
                            <Package className="text-[#D4AF37]" size={26} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-lg">Commande #{order.id}</div>
                            <div className="text-sm text-white/50 mt-1">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                                day: 'numeric', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </div>
                          </div>
                          <div className={`text-sm font-medium px-4 py-1.5 rounded-full self-start mt-1
                            ${order.status === 'delivered' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : 'bg-amber-500/10 text-amber-400'}`}>
                            {order.status === 'delivered' ? 'Livré' : 'En cours'}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-16 text-center text-white/40">
                      Aucune commande récente
                    </div>
                  )}
                </div>

                <div className="p-8 text-center border-t border-white/10">
                  <Link href="/orders" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-white font-medium transition">
                    Voir tout l'historique <ArrowUpRight size={18} />
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