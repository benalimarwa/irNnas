'use client';

import { useEffect, useState, useRef } from "react";
import { Search, Users, TrendingUp, ShoppingBag, ArrowUpRight } from "lucide-react";
import AdminNavbar from "@/components/AdminNavbar";

type User = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  _count: { orders: number };
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

export default function AdminUsersPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Vidéo d'arrière-plan
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      users.filter((u) =>
        u.email.toLowerCase().includes(term) ||
        (u.firstName && u.firstName.toLowerCase().includes(term)) ||
        (u.lastName && u.lastName.toLowerCase().includes(term))
      )
    );
  };

  const getTotalSpent = (user: User) =>
    user.orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalUsers = users.length;
  const totalOrders = users.reduce((sum, u) => sum + (u._count?.orders || 0), 0);
  const totalRevenue = users.reduce((sum, u) => sum + getTotalSpent(u), 0);

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Fonction sécurisée pour l'initiale
  const getInitial = (user: User) => {
    if (user.firstName?.[0]) return user.firstName[0].toUpperCase();
    if (user.email?.[0]) return user.email[0].toUpperCase();
    return "?";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] flex items-center gap-4 text-xl">
          <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          Chargement des clients...
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        .admin-users {
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
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

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
          opacity: 0.22;
          filter: brightness(0.7) contrast(1.1);
        }
        .video-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(212,175,55,0.12), rgba(0,0,0,0.88));
          z-index: 1;
          pointer-events: none;
        }
      `}</style>

      <div className="admin-users min-h-screen relative overflow-hidden">
        {/* Vidéo d'arrière-plan */}
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="video-overlay" />

        {/* Grille dorée */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-20">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-6">
              <Users size={16} className="text-[#D4AF37]" />
              ADMINISTRATION
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Total Clients", value: totalUsers, icon: Users },
              { label: "Total Commandes", value: totalOrders, icon: ShoppingBag },
              { label: "Revenu Total", value: `${totalRevenue.toFixed(0)} TND`, icon: TrendingUp },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-3xl p-8 hover:border-[#D4AF37]/50 transition-all">
                <div className="w-14 h-14 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mb-8">
                  <stat.icon className="text-[#D4AF37]" size={32} />
                </div>
                <div className="text-5xl font-bold tracking-tighter mb-2">{stat.value}</div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-10 max-w-2xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl pl-14 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const totalSpent = getTotalSpent(user);
              return (
                <div
                  key={user.id}
                  onClick={() => openUserModal(user)}
                  className="glass-card rounded-3xl p-8 cursor-pointer hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#FF6B6B] rounded-2xl flex items-center justify-center text-3xl font-light flex-shrink-0 border border-white/20">
                      {getInitial(user)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-white mb-1 truncate">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-white/60 text-sm mb-6 truncate">{user.email}</p>

                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-white/60">Commandes</span>
                          <p className="text-white font-medium">{user._count.orders}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-white/60">Total dépensé</span>
                          <p className="text-[#D4AF37] font-medium">{totalSpent.toFixed(0)} TND</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 flex justify-end opacity-0 group-hover:opacity-100 transition">
                    <div className="text-[#D4AF37] flex items-center gap-2 text-sm font-medium">
                      Voir détails <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-20 text-white/60">
              Aucun client trouvé
            </div>
          )}
        </div>

        {/* Modal Détails */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6">
            <div className="glass-card rounded-3xl w-full max-w-2xl p-10 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl"
              >
                ✕
              </button>

              <h2 className="text-3xl font-semibold mb-8">Détails du client</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-white/60 text-sm mb-1">Nom complet</p>
                  <p className="text-2xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Email</p>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Membre depuis</p>
                  <p className="text-lg">
                    {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Total dépensé</p>
                  <p className="text-4xl font-bold text-[#D4AF37]">
                    {getTotalSpent(selectedUser).toFixed(0)} TND
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}