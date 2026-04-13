// app/client/page.tsx
'use client';

import ClientNavbar from '@/components/ClientNavbar';
import { useUser, UserButton } from '@clerk/nextjs';
import { Sparkles, ShoppingBag, Heart, Package, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientDashboard() {
  const { user } = useUser();

  const quickActions = [
    {
      title: 'Découvrir mon Parfum Idéal',
      description: 'Répondez au quiz IA personnalisé',
      icon: Sparkles,
      href: '/quiz',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Explorer le Catalogue',
      description: 'Plus de 100 parfums de luxe',
      icon: ShoppingBag,
      href: '/catalogue',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Mes Favoris',
      description: 'Parfums que vous adorez',
      icon: Heart,
      href: '/favorites',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
    },
    {
      title: 'Mes Commandes',
      description: 'Suivez vos achats',
      icon: Package,
      href: '/orders',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vidéo d'arrière-plan */}
     <video
    autoPlay
    loop
    muted
    playsInline
    preload="auto"           // Ajout important
    className="absolute inset-0 w-full h-full object-cover"
    style={{ objectPosition: 'center' }}
  >
    <source src="/video/femme.mp4" type="video/mp4" />
    Votre navigateur ne supporte pas la vidéo.
  </video>

      {/* Overlay sombre pour améliorer la lisibilité */}
      <div className="absolute inset-0 bg-black/60 -z-10" />

      

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 py-12 z-10">
        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 text-white mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-10">✨</div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              Bienvenue {user?.firstName} ! 👋
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl">
              Découvrez votre parfum idéal grâce à notre intelligence artificielle
            </p>
            <Link
              href="/client/quiz"
              className="inline-flex items-center bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Démarrer le Quiz
              <ChevronRight className="w-6 h-6 ml-2" />
            </Link>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.bgColor} bg-opacity-90 backdrop-blur-md border border-white/30 rounded-3xl p-8 hover:shadow-2xl transition-all group hover:-translate-y-1`}
            >
              <div
                className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${action.color} mb-6 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">{action.title}</h3>
              <p className="text-gray-700 text-lg">{action.description}</p>
              <ChevronRight className="w-6 h-6 text-gray-500 mt-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white">
          <h3 className="text-2xl font-black mb-6">Activité Récente</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white/10 rounded-2xl hover:bg-white/20 transition">
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-bold">Commande #1234</p>
                  <p className="text-sm opacity-75">Livrée le 10 Décembre 2025</p>
                </div>
              </div>
              <Link href="/orders/1234" className="text-purple-300 hover:text-white font-semibold">
                Voir →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}