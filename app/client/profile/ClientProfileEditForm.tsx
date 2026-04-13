"use client";

// app/profile/_ProfileClient.tsx
import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User, Mail, Calendar, ShoppingBag, Sparkles,
  Package, Camera, Edit3, Check, X, Loader2,
  Crown, ShieldCheck,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type OrderItem = {
  id: number;
  quantity: number;
  perfume: { name: string; house: { name: string } };
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  deliveryMethod: string;
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
    name: string | null;
    role: string;
    createdAt: string;
    orders: Order[];
    hasCompletedQuiz: boolean;
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  SHIPPED:   "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  PENDING:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  CONFIRMED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  PREPARING: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
};

const STATUS_LABELS: Record<string, string> = {
  DELIVERED: "Livré",
  SHIPPED:   "Expédié",
  CANCELLED: "Annulé",
  PENDING:   "En attente",
  CONFIRMED: "Confirmé",
  PREPARING: "En préparation",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileClient({ clerkUser, dbUser }: Props) {
  const { user, isLoaded } = useUser();
  const isAdmin = dbUser.role === "ADMIN";

  // Photo
  const [imageUrl, setImageUrl]           = useState(clerkUser.imageUrl);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Édition
  const [editing, setEditing]       = useState(false);
  const [firstName, setFirstName]   = useState(clerkUser.firstName || "");
  const [lastName, setLastName]     = useState(clerkUser.lastName || "");
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [saveOk, setSaveOk]         = useState(false);

  // Stats
  const totalOrders = dbUser.orders.length;
  const totalSpent  = dbUser.orders.reduce((s, o) => s + o.totalAmount, 0);

  // ── Handlers ────────────────────────────────────────────────────────────────

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
      setImageUrl(user.imageUrl);
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
      setTimeout(() => setSaveOk(false), 3000);
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

  const displayName = `${firstName} ${lastName}`.trim() || dbUser.email;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ══════════════ HEADER ══════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Bannière */}
          <div className={`h-48 ${isAdmin
            ? "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
            : "bg-gradient-to-r from-purple-600 to-pink-600"
          }`} />

          <div className="px-8 pb-8 -mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar */}
            <div className="relative w-32 flex-shrink-0">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-xl bg-white dark:bg-gray-700">
                {imageUrl ? (
                  <img src={imageUrl} alt="Profil" className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full w-full flex items-center justify-center text-white text-4xl font-bold ${
                    isAdmin
                      ? "bg-gradient-to-br from-amber-500 to-red-500"
                      : "bg-gradient-to-br from-purple-600 to-pink-600"
                  }`}>
                    {firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </div>

              {/* Bouton caméra */}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto || !isLoaded}
                title="Changer la photo"
                className="absolute bottom-1 right-1 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:border-purple-500 transition-all disabled:opacity-50 cursor-pointer"
              >
                {uploadingPhoto
                  ? <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                  : <Camera className="h-4 w-4 text-purple-600" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Nom + badge rôle */}
            <div className="flex-1 pt-2 md:pt-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                    <Crown className="h-3 w-3" /> Administrateur
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    <ShieldCheck className="h-3 w-3" /> Client
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{dbUser.email}</p>
              {photoError && <p className="mt-1 text-sm text-red-500">{photoError}</p>}
            </div>

            {/* Boutons édition */}
            <div className="flex-shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Edit3 className="h-4 w-4" /> Modifier
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Sauvegarder
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-5 py-3 rounded-xl font-semibold transition-all"
                  >
                    <X className="h-4 w-4" /> Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════ GRILLE ══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Informations personnelles */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
                <User className="h-5 w-5 text-purple-600" /> Informations personnelles
              </h2>

              {saveOk && (
                <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4" /> Informations mises à jour !
                </div>
              )}
              {saveError && (
                <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="space-y-4">
                {/* Prénom */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prénom</p>
                  {editing ? (
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {firstName || <span className="text-gray-400 italic">Non renseigné</span>}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nom</p>
                  {editing ? (
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white font-medium">
                      {lastName || <span className="text-gray-400 italic">Non renseigné</span>}
                    </p>
                  )}
                </div>

                {/* Email — lecture seule */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{dbUser.email}</span>
                  </div>
                </div>

                {/* Membre depuis */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Membre depuis</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">
                      {new Date(dbUser.createdAt).toLocaleDateString("fr-FR", {
                        month: "long", year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* ID — visible uniquement pour ADMIN */}
                {isAdmin && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ID Utilisateur</p>
                    <p className="text-xs font-mono bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 p-2 rounded break-all">
                      {dbUser.id}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-5 text-gray-900 dark:text-white">📊 Statistiques</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Commandes</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">{totalOrders}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Total dépensé</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">{totalSpent.toFixed(2)} TND</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-pink-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Quiz IA</span>
                  </div>
                  <span className={`text-sm font-bold ${dbUser.hasCompletedQuiz ? "text-pink-600" : "text-gray-400"}`}>
                    {dbUser.hasCompletedQuiz ? "✓ Complété" : "Non fait"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
                {isAdmin ? "Aperçu des dernières commandes" : "Mes commandes récentes"}
              </h2>

              {dbUser.orders.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Aucune commande pour le moment</p>
                  {!isAdmin && (
                    <a
                      href="/client/catalog"
                      className="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    >
                      Découvrir notre catalogue
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {dbUser.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Commande #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status] || STATUS_STYLES.PENDING}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <Package className="h-3.5 w-3.5 mr-2 text-gray-400 flex-shrink-0" />
                            <span>{item.perfume.name} — {item.perfume.house.name}</span>
                            <span className="ml-auto text-gray-500 flex-shrink-0">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {order.deliveryMethod === "DELIVERY" ? "🚚 Livraison" : "📦 Sur place"}
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {order.totalAmount.toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Lien vers toutes les commandes */}
                  <div className="text-center pt-2">
                    <a
                      href={isAdmin ? "/admin/orders" : "/orders"}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium"
                    >
                      Voir toutes les commandes →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
