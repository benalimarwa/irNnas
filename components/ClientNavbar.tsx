'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import {
  ShoppingCart, Heart, ChevronDown, X, ChevronRight,
  Home, Package, Receipt, LogOut, LogIn, Sun, Moon, Menu,
} from "lucide-react";

type GuestItem = { productId: number; quantity: number };

const GUEST_KEY = "irnas_guest_cart";
const guestCart = {
  get(): GuestItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); } catch { return []; }
  },
  count(): number { return guestCart.get().reduce((s, i) => s + i.quantity, 0); },
};

const MENU_LINKS = [
  { label: "Accueil",    href: "/client",         icon: Home,    auth: false },
  { label: "Favoris",    href: "/client/favoris", icon: Heart,   auth: false },
  { label: "Collection", href: "/client/catalog", icon: Package, auth: false },
  { label: "Commandes",  href: "/client/orders",  icon: Receipt, auth: true  },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  const [cartCount,   setCartCount]   = useState(0);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark,      setIsDark]      = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState<number | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  // Cart count
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/cart")
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d?.items) setCartCount(d.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
        })
        .catch(() => {});
    } else {
      setCartCount(guestCart.count());
    }
  }, [isSignedIn]);

  // Guest last order
  useEffect(() => {
    if (!isSignedIn) {
      try {
        const orders = JSON.parse(localStorage.getItem("irnas_guest_orders") || "[]");
        if (orders.length > 0) setGuestOrderId(orders[orders.length - 1]);
      } catch { /* ignore */ }
    } else {
      setGuestOrderId(null);
    }
  }, [isSignedIn]);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark  = saved !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const handleCartClick = () => router.push("/client/panier");

  const visibleLinks = MENU_LINKS.filter(l => !l.auth || isSignedIn);

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          {/* Burger mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-white hover:text-[#3b82f6] transition flex-shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/client" className="group flex items-center gap-2 flex-shrink-0">
            <Image
              src="/llogo.png"
              alt="IRNAS"
              width={140}
              height={50}
              className="object-contain h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white group-hover:text-[#3b82f6] transition duration-500">
              IRNAS
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/70 font-light hidden sm:block">
              Fashion
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {visibleLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-[0.25em] font-light border-b transition pb-0.5 ${
                  isActive(href)
                    ? "text-[#3b82f6] border-[#3b82f6]/40"
                    : "border-transparent hover:text-[#3b82f6] hover:border-[#3b82f6]/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

            {/* Lien commande guest */}
            {!isSignedIn && guestOrderId && (
              <Link
                href={`/client/orders/${guestOrderId}`}
                className={`flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-[0.25em] font-light border-b transition pb-0.5 ${
                  isActive(`/client/orders/${guestOrderId}`)
                    ? "text-[#3b82f6] border-[#3b82f6]/40"
                    : "border-transparent text-[#60a5fa]/70 hover:text-[#3b82f6] hover:border-[#3b82f6]/40"
                }`}
              >
                <Receipt className="w-4 h-4" />
                Ma commande
              </Link>
            )}
          </nav>

          {/* Actions desktop */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Search */}
            <div className="relative hidden md:block w-52">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0f1f33] border border-[#1e3a5f] rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/50 transition"
              />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-[#4a6a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-white/70 hover:text-[#3b82f6] transition"
              aria-label="Thème"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative text-white hover:text-[#3b82f6] transition"
              aria-label="Panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#3b82f6] text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth desktop */}
            {isSignedIn ? (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 pl-3 pr-4 py-1.5 bg-[#0f1f33] border border-[#1e3a5f] hover:border-[#3b82f6]/40 rounded-full transition"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-light text-white/80">{user?.firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#4a6a8a] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href="/client/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-[#1a2a44] transition text-sm text-white/80 hover:text-white"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {user?.firstName?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-[#4a6a8a]">Mon profil</p>
                      </div>
                    </Link>
                    <div className="border-t border-[#1e3a5f]">
                      <SignOutButton>
                        <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition">
                          <LogOut className="w-4 h-4" /> Se déconnecter
                        </button>
                      </SignOutButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {/* Lien commande guest (desktop, compact) */}
                {guestOrderId && (
                  <Link
                    href={`/client/orders/${guestOrderId}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border border-[#3b82f6]/30 text-[#60a5fa] hover:bg-[#3b82f6]/10 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Commande
                  </Link>
                )}
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-[#3b82f6] transition">
                    <LogIn className="w-4 h-4" /> Connexion
                  </button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── DRAWER MOBILE ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />

          <div className="relative w-[78%] max-w-xs bg-[#0a1628] border-r border-[#1e3a5f] flex flex-col h-full shadow-2xl">

            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e3a5f]">
              <svg className="w-5 h-5 text-[#4a6a8a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4a6a8a] outline-none"
              />
            </div>

            {/* User card (connecté) */}
            {isSignedIn && (
              <Link
                href="/client/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 mx-4 mt-4 p-4 bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl hover:border-[#3b82f6]/40 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-[#4a6a8a]">Mon profil</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#4a6a8a] ml-auto" />
              </Link>
            )}

            {/* Guest order card (guest avec commande) */}
            {!isSignedIn && guestOrderId && (
              <Link
                href={`/client/orders/${guestOrderId}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 mx-4 mt-4 p-4 bg-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl hover:border-[#3b82f6]/40 transition"
              >
                <div className="w-10 h-10 bg-[#3b82f6]/10 rounded-full flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-[#3b82f6]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">Ma commande</p>
                  <p className="text-[10px] text-[#4a6a8a]">#{String(guestOrderId).padStart(8, "0")}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#4a6a8a] ml-auto" />
              </Link>
            )}

            {/* Links */}
            <ul className="flex-1 overflow-y-auto mt-4 divide-y divide-[#1e3a5f]">
              {visibleLinks.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 text-sm font-light uppercase tracking-[0.15em] transition ${
                      isActive(href)
                        ? "text-[#3b82f6] bg-[#3b82f6]/5"
                        : "text-[#8aabca] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Bottom actions */}
            <div className="p-5 border-t border-[#1e3a5f] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.15em] text-[#4a6a8a]">Thème</span>
                <button onClick={toggleDark} className="p-2 text-white/70 hover:text-[#3b82f6] transition">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {isSignedIn ? (
                <SignOutButton>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs uppercase tracking-[0.15em] text-red-400 border border-red-500/20 hover:bg-red-500/5 transition"
                  >
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs uppercase tracking-[0.15em] border border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-[#3b82f6] transition"
                  >
                    <LogIn className="w-4 h-4" /> Se connecter
                  </button>
                </SignInButton>
              )}

              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#4a6a8a] hover:text-white transition"
              >
                <X className="w-4 h-4" /> Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}