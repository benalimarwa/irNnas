'use client';

import { useEffect, useState, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Sparkles, Camera, Edit3, Check, X, Loader2, Award, Package, TrendingUp, User, Mail, Calendar, ShoppingBag
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: number;
  quantity: number;
  product: { name: string };
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

type Props = {
  clerkUser: {
    firstName: string | null;
    lastName: string | null;
    imageUrl: string;
  };
  dbUser: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "CLIENT" | "ADMIN";
    createdAt: string;
    orders: Order[];
  };
};

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
  pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  confirmed: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  delivered: "Livré",
  shipped: "Expédié",
  cancelled: "Annulé",
  pending: "En attente",
  confirmed: "Confirmé",
};

export default function ProfileClient({ clerkUser, dbUser }: Props) {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [imageUrl, setImageUrl] = useState(clerkUser.imageUrl);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(clerkUser.firstName || "");
  const [lastName, setLastName] = useState(clerkUser.lastName || "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  const isAdmin = dbUser.role === "ADMIN";
  const totalOrders = dbUser.orders.length;
  const totalSpent = dbUser.orders.reduce((s, o) => s + o.totalAmount, 0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setPhotoError("Format non supporté (JPG, PNG, WEBP, GIF).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image trop lourde (max 5 MB).");
      return;
    }

    setUploadingPhoto(true);
    setPhotoError(null);
    try {
      await user.setProfileImage({ file });
      await user.reload();
      setImageUrl(user.imageUrl || clerkUser.imageUrl);
    } catch (err: any) {
      setPhotoError(err.message || "Erreur lors de l'upload.");
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveError(null);
    try {
      await user.update({ firstName, lastName });
      setSaveOk(true);
      setEditing(false);
      setTimeout(() => setSaveOk(false), 2500);
    } catch (err: any) {
      setSaveError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(clerkUser.firstName || "");
    setLastName(clerkUser.lastName || "");
    setSaveError(null);
    setEditing(false);
  };

  const displayName = `${firstName} ${lastName}`.trim() || "Cher Client";

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap');

        :root {
          --bg-dark: #0a0a0c;
          --card-bg: rgba(18, 18, 22, 0.85);
          --border-light: rgba(255, 255, 255, 0.06);
          --border-hover: rgba(255, 255, 255, 0.12);
          --gold: #d4af37;
          --gold-light: #e8c96e;
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --text-tertiary: #71717a;
        }

        .profile-page {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: var(--bg-dark);
          color: var(--text-primary);
        }

        /* Glassmorphism professionnel */
        .glass-card {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-light);
          border-radius: 28px;
          transition: all 0.2s ease;
        }
        .glass-card:hover {
          border-color: var(--border-hover);
          background: rgba(22, 22, 28, 0.9);
        }

        /* Video background plus subtile */
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
          opacity: 0.12;
          filter: brightness(0.6) contrast(1.2);
        }
        .video-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.3), #0a0a0c 85%);
          z-index: 1;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        /* Badge statut */
        .status-badge {
          font-size: 0.7rem;
          font-weight: 500;
          padding: 0.2rem 0.7rem;
          border-radius: 100px;
          backdrop-filter: blur(4px);
        }

        /* Scrollbar */
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: var(--gold);
          border-radius: 4px;
        }

        /* Stats numbers */
        .stat-number {
          font-weight: 700;
          letter-spacing: -0.02em;
        }
      `}</style>

      <div className="profile-page min-h-screen relative overflow-hidden">
        <div className="video-background">
          <video ref={videoRef} autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="video-overlay" />

        <div className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
          {/* Hero Card - Profil */}
          <div className="glass-card p-8 md:p-12 mb-10 animate-fade-up">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full ring-4 ring-white/5 overflow-hidden transition-all group-hover:ring-white/15">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#FF6B6B] flex items-center justify-center text-3xl font-semibold text-black">
                      {displayName[0]}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-1 right-1 bg-black/70 hover:bg-[#D4AF37] text-white p-2 rounded-full shadow-lg transition-all duration-200"
                >
                  {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Infos utilisateur */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full mb-5">
                  <Sparkles size={12} />
                  <span>Membre Gold</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{displayName}</h1>
                <p className="text-[var(--text-secondary)] text-base mb-7">{dbUser.email}</p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                    >
                      <Edit3 size="16" /> Modifier
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#e0bc5e] text-black px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      >
                        {saving ? <Loader2 className="animate-spin" size="16" /> : <Check size="16" />} Sauvegarder
                      </button>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 border border-white/10 hover:bg-white/5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                      >
                        <X size="16" /> Annuler
                      </button>
                    </>
                  )}
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  >
                    <Package size="16" /> Commandes
                  </Link>
                </div>
                {photoError && <p className="text-rose-400 text-sm mt-4">{photoError}</p>}
                {saveOk && <p className="text-emerald-400 text-sm mt-4">✓ Modifications enregistrées</p>}
                {saveError && <p className="text-rose-400 text-sm mt-4">{saveError}</p>}
              </div>
            </div>
          </div>

          {/* Grille informations / stats */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Colonne gauche : Informations personnelles */}
            <div className="lg:col-span-7 animate-fade-up delay-100">
              <div className="glass-card p-8 h-full">
                <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-7">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center">
                    <User size="18" className="text-[#D4AF37]" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">Informations personnelles</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Prénom</p>
                    <p className="text-base font-medium">{firstName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Nom</p>
                    <p className="text-base font-medium">{lastName || "—"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Adresse e-mail</p>
                    <p className="text-base font-medium break-all">{dbUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Membre depuis</p>
                    <p className="text-base font-medium">
                      {new Date(dbUser.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="lg:col-span-5 space-y-8">
              {/* Carte Statut & Stats */}
              <div className="glass-card p-8 animate-fade-up delay-200">
                <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                  <div className="p-2 rounded-xl bg-[#D4AF37]/10">
                    <Award size="22" className="text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Statut</p>
                    <p className="text-xl font-semibold tracking-tight">
                      {isAdmin ? "Administrateur" : "Client Gold"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div>
                    <p className="stat-number text-4xl font-bold text-white">{totalOrders}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                      <ShoppingBag size="14" /> Commandes
                    </p>
                  </div>
                  <div>
                    <p className="stat-number text-4xl font-bold text-[#D4AF37]">
                      {totalSpent.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                      <TrendingUp size="14" /> TND dépensés
                    </p>
                  </div>
                </div>
              </div>

              {/* Dernières commandes */}
              <div className="glass-card overflow-hidden animate-fade-up delay-300">
                <div className="px-7 py-5 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
                    <Package size="16" />
                    <span>Activité récente</span>
                  </div>
                  <Link href="/orders" className="text-xs text-[#D4AF37] hover:underline">
                    Tout voir →
                  </Link>
                </div>
                <div className="divide-y divide-white/5 max-h-[420px] overflow-auto custom-scroll">
                  {dbUser.orders.length === 0 ? (
                    <div className="p-10 text-center text-[var(--text-tertiary)] text-sm">
                      Aucune commande pour le moment
                    </div>
                  ) : (
                    dbUser.orders.slice(0, 5).map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="block px-7 py-5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-mono text-sm font-medium group-hover:text-[#D4AF37] transition">
                              #{order.id.slice(0, 8)}
                            </div>
                            <div className="flex items-center gap-1 text-[var(--text-tertiary)] text-xs mt-1">
                              <Calendar size="12" />
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-base">{order.totalAmount} TND</div>
                            <div className="mt-1.5">
                              <span className={`status-badge ${STATUS_STYLES[order.status]}`}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}