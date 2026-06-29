'use client';

import { useState } from "react";
import Link from "next/link";
import {
  User, Mail, Calendar, Shield, Package, ChevronRight,
  Edit3, Save, X, CheckCircle, AlertCircle, Camera,
  ArrowLeft, Clock, ShoppingBag,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";

/* ─── Types ─────────────────────────────────────────────── */
type OrderItem = {
  id: string;  // ← était number, changé en string
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

type ClerkUser = {
  firstName: string | null;
  lastName:  string | null;
  imageUrl:  string;
};

type DbUser = {
  id:        string;  // ← était number, changé en string
  email:     string;
  firstName: string | null;
  lastName:  string | null;
  role:      string;
  createdAt: string;
  orders:    Order[];
};

type Props = { clerkUser: ClerkUser; dbUser: DbUser };

/* ─── Status config ──────────────────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  pending:   "En attente",
  confirmed: "Confirmée",
  shipped:   "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-amber-500/10 border-amber-500/30 text-amber-400",
  confirmed: "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#60a5fa]",
  shipped:   "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  delivered: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  cancelled: "bg-red-500/10 border-red-500/30 text-red-400",
};

/* ─── Main Component ─────────────────────────────────────── */
export default function ProfileClient({ clerkUser, dbUser }: Props) {
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [toast,   setToast]     = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [form, setForm] = useState({
    firstName: dbUser.firstName ?? "",
    lastName:  dbUser.lastName  ?? "",
  });

  const displayName = `${dbUser.firstName ?? ""} ${dbUser.lastName ?? ""}`.trim()
    || clerkUser.firstName
    || "Utilisateur";

  const memberSince = new Date(dbUser.createdAt).toLocaleDateString("fr-FR", {
    month: "long", year: "numeric",
  });

  const totalOrders   = dbUser.orders.length;
  const totalSpent    = dbUser.orders.reduce((s, o) => s + o.totalAmount, 0);
  const deliveredCount = dbUser.orders.filter(o => o.status === "delivered").length;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setEditing(false);
      showToast("ok", "Profil mis à jour avec succès.");
    } catch {
      showToast("err", "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  function showToast(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#3b82f6 0.8px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-light shadow-2xl transition-all duration-300 ${
          toast.type === "ok"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {toast.type === "ok"
            ? <CheckCircle className="w-4 h-4" />
            : <AlertCircle className="w-4 h-4" />
          }
          {toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">

        {/* Back */}
        <Link
          href="/client/catalog"
          className="inline-flex items-center gap-2 text-[#4a6a8a] hover:text-[#3b82f6] transition mb-10 group text-sm uppercase tracking-[0.15em] font-light"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Catalogue
        </Link>

        {/* ── Hero Card ───────────────────────────────────────── */}
        <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 mb-6 hover:border-[#3b82f6]/30 transition relative overflow-hidden">
          {/* Subtle gradient glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-[#1e3a5f] bg-[#0a1628]">
                <img
                  src={clerkUser.imageUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#0f1f33] border border-[#1e3a5f] rounded-lg flex items-center justify-center">
                <Camera className="w-3.5 h-3.5 text-[#4a6a8a]" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest font-light mb-1">
                Profil client
              </p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white mb-2">
                {displayName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#4a6a8a] font-light">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {dbUser.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Membre depuis {memberSince}
                </span>
              </div>
            </div>

            {/* Role badge */}
            <div className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-light border ${
              dbUser.role === "ADMIN"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#60a5fa]"
            }`}>
              <Shield className="w-3 h-3" />
              {dbUser.role === "ADMIN" ? "Administrateur" : "Client"}
            </div>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Commandes", value: totalOrders,               icon: ShoppingBag },
            { label: "Livrées",   value: deliveredCount,            icon: CheckCircle },
            { label: "Total dépensé", value: `${totalSpent.toFixed(0)} TND`, icon: Package },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-[#0f1f33] border border-[#1a2a44] rounded-2xl p-5 hover:border-[#3b82f6]/30 transition text-center"
            >
              <Icon className="w-5 h-5 text-[#3b82f6] mx-auto mb-2" />
              <p className="text-xl sm:text-2xl font-light text-white">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Grid ───────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* LEFT — Edit form */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 h-full hover:border-[#3b82f6]/30 transition">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light uppercase tracking-[0.15em] flex items-center gap-3">
                  <User className="w-5 h-5 text-[#3b82f6]" />
                  Informations
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#4a6a8a] hover:text-[#3b82f6] transition font-light"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Modifier
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* First name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mb-2">
                    Prénom
                  </label>
                  {editing ? (
                    <input
                      value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className="w-full bg-[#0a1628] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm font-light text-white placeholder-[#2a3f6a] focus:border-[#3b82f6]/50 focus:outline-none transition"
                      placeholder="Votre prénom"
                    />
                  ) : (
                    <p className="text-sm font-light text-white px-1">
                      {dbUser.firstName || <span className="text-[#2a3f6a]">—</span>}
                    </p>
                  )}
                </div>

                {/* Last name */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mb-2">
                    Nom
                  </label>
                  {editing ? (
                    <input
                      value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className="w-full bg-[#0a1628] border border-[#1e3a5f] rounded-xl px-4 py-3 text-sm font-light text-white placeholder-[#2a3f6a] focus:border-[#3b82f6]/50 focus:outline-none transition"
                      placeholder="Votre nom"
                    />
                  ) : (
                    <p className="text-sm font-light text-white px-1">
                      {dbUser.lastName || <span className="text-[#2a3f6a]">—</span>}
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mb-2">
                    Email
                  </label>
                  <p className="text-sm font-light text-[#4a6a8a] px-1">{dbUser.email}</p>
                </div>

                {/* Member since */}
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#4a6a8a] font-light mb-2">
                    Membre depuis
                  </label>
                  <p className="text-sm font-light text-white px-1">{memberSince}</p>
                </div>
              </div>

              {/* Edit actions */}
              {editing && (
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#3b82f6] text-white text-xs uppercase tracking-[0.15em] font-light hover:bg-[#2563eb] transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setForm({ firstName: dbUser.firstName ?? "", lastName: dbUser.lastName ?? "" }); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-[#1e3a5f] text-[#8aabca] text-xs uppercase tracking-[0.15em] font-light hover:border-[#3b82f6]/40 hover:text-[#3b82f6] transition"
                  >
                    <X className="w-3.5 h-3.5" /> Annuler
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Recent orders */}
          <div className="lg:col-span-7">
            <div className="bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 sm:p-8 hover:border-[#3b82f6]/30 transition">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-light uppercase tracking-[0.15em] flex items-center gap-3">
                  <Package className="w-5 h-5 text-[#3b82f6]" />
                  Commandes récentes
                </h2>
                <Link
                  href="/client/orders"
                  className="text-[10px] uppercase tracking-widest text-[#4a6a8a] hover:text-[#3b82f6] transition font-light flex items-center gap-1"
                >
                  Tout voir <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {dbUser.orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-[#0a1628] border border-[#1e3a5f] rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7 text-[#2a3f6a]" />
                  </div>
                  <p className="text-sm font-light text-[#4a6a8a] mb-1">Aucune commande</p>
                  <Link
                    href="/client/catalog"
                    className="text-[10px] text-[#3b82f6] uppercase tracking-widest font-light hover:text-white transition mt-2"
                  >
                    Découvrir le catalogue →
                  </Link>
                </div>
              ) : (
                <div
                  className="space-y-3 max-h-[420px] overflow-y-auto pr-1"
                  style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}
                >
                  {dbUser.orders.map(order => {
                    const displayId = order.id.padStart(8, "0");
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <Link
                        key={order.id}
                        href={`/client/orders/${order.id}`}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-[#0a1628] border border-[#1a2a44] hover:border-[#3b82f6]/30 transition"
                      >
                        {/* ID */}
                        <div className="w-10 h-10 rounded-xl bg-[#0f1f33] border border-[#1e3a5f] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-[#3b82f6]" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-light text-white">
                              #{displayId}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-light border ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                              {STATUS_LABELS[order.status] || order.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[#4a6a8a] font-light">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span>{itemCount} article{itemCount > 1 ? "s" : ""}</span>
                          </div>
                        </div>

                        {/* Total + arrow */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-light text-white">{order.totalAmount.toFixed(2)}</p>
                          <p className="text-[10px] text-[#4a6a8a] font-light">TND</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#2a3f6a] group-hover:text-[#3b82f6] transition flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a2a44] py-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
          </div>
          <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">
            © 2026 IRNAS — Tous droits réservés
          </p>
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