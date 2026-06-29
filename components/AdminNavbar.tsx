"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Moon, Sun, LogOut, Menu, X, ChevronDown, ChevronRight, Receipt,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Dashboard",   href: "/admin",         icon: LayoutDashboard },
  { label: "Produits",    href: "/admin/catalog",  icon: Package         },
  { label: "Commandes",   href: "/admin/orders",   icon: ShoppingCart, badge: 3 },
  { label: "Clients",     href: "/admin/users",    icon: Users           },
];

export default function AdminNavbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  const [isDark,       setIsDark]       = useState(true);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /* ── Theme ── */
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

  /* ── Close profile on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname?.startsWith(href));

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#0a1628]/80 backdrop-blur-md border-b border-[#1e3a5f]">
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
          <Link href="/admin" className="group flex items-center gap-2 flex-shrink-0">
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
              Admin
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-[0.25em] font-light border-b transition pb-0.5 ${
                  isActive(href)
                    ? "text-[#3b82f6] border-[#3b82f6]/40"
                    : "border-transparent text-[#8aabca] hover:text-[#3b82f6] hover:border-[#3b82f6]/40"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Theme toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-white/70 hover:text-[#3b82f6] transition"
              aria-label="Thème"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile dropdown desktop */}
            {isSignedIn && (
              <div className="relative hidden md:block" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2 pl-3 pr-4 py-1.5 bg-[#0f1f33]/60 border border-[#1e3a5f] hover:border-[#3b82f6]/40 rounded-full transition"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {user?.firstName?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-light text-white/80 leading-none">{user?.firstName}</p>
                    <p className="text-[9px] text-[#3b82f6] uppercase tracking-widest leading-none mt-0.5">Admin</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#4a6a8a] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-52 bg-[#0a1628]/95 backdrop-blur-md border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden z-50">
                    <Link
                      href="/admin/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-[#1a2a44] transition text-sm text-white/80 hover:text-white"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {user?.firstName?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-[10px] text-[#3b82f6] uppercase tracking-widest">Administrateur</p>
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
            )}
          </div>
        </div>
      </header>

      {/* ── DRAWER MOBILE ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />

          <div className="relative w-[78%] max-w-xs bg-[#0a1628]/95 backdrop-blur-md border-r border-[#1e3a5f] flex flex-col h-full shadow-2xl">

            {/* User card */}
            {isSignedIn && (
              <Link
                href="/admin/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 mx-4 mt-6 p-4 bg-[#0f1f33]/60 border border-[#1e3a5f] rounded-2xl hover:border-[#3b82f6]/40 transition"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-medium text-sm text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-[#3b82f6] uppercase tracking-widest">Administrateur</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#4a6a8a] ml-auto" />
              </Link>
            )}

            {/* Links */}
            <ul className="flex-1 overflow-y-auto mt-4 divide-y divide-[#1e3a5f]">
              {NAV_LINKS.map(({ label, href, icon: Icon, badge }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`relative flex items-center gap-4 px-6 py-4 text-sm font-light uppercase tracking-[0.15em] transition ${
                      isActive(href)
                        ? "text-[#3b82f6] bg-[#3b82f6]/5"
                        : "text-[#8aabca] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                    {badge && (
                      <span className="ml-auto bg-red-500 text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                        {badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Bottom */}
            <div className="p-5 border-t border-[#1e3a5f] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.15em] text-[#4a6a8a]">Thème</span>
                <button onClick={toggleDark} className="p-2 text-white/70 hover:text-[#3b82f6] transition">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              {isSignedIn && (
                <SignOutButton>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs uppercase tracking-[0.15em] text-red-400 border border-red-500/20 hover:bg-red-500/5 transition"
                  >
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </SignOutButton>
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