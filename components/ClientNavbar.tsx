// components/ClientNavbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { ShoppingBag, Home, Package, Receipt, Menu, X, LogOut, LogIn, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // À connecter plus tard avec le vrai panier

  // Gestion du thème global
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme !== "light";
    
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const isActive = (path: string) => 
    pathname === path || pathname?.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/client" className="flex items-center gap-3 group">
            <Image
              src="/llogo.png"
              alt="IRNAS"
              width={140}
              height={50}
              className="object-contain h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <div className="hidden sm:block">
              <span className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-[#D4AF37] via-white to-[#D4AF37] bg-clip-text text-transparent">
                IRNAS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/client"
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                isActive("/client")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Home className="h-5 w-5" />
              Accueil
            </Link>
          <Link
              href="/client/favoris"
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                isActive("/client/favoris")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Package className="h-5 w-5" />
            Favoris
            </Link>

            <Link
              href="/client/catalog"
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                isActive("/client/catalog")
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Package className="h-5 w-5" />
              Collection
            </Link>

            {isSignedIn && (
              <Link
                href="/client/orders"
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  isActive("/orders")
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
              >
                <Receipt className="h-5 w-5" />
                Commandes
              </Link>
              
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20"
              aria-label="Changer le mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <Link
              href="/client/panier"
              className="relative p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/client/profile"
                  className="flex items-center gap-3 pl-4 pr-6 py-2 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-[#D4AF37]/30 transition-all group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-[#D4AF37] to-white rounded-xl flex items-center justify-center text-black font-semibold">
                    {user?.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-sm group-hover:text-[#D4AF37] transition-colors">
                      {user?.firstName}
                    </p>
                  </div>
                </Link>

                <SignOutButton>
                  <button className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/70 hover:border-red-500/30 border border-white/10 transition-all">
                    <LogOut className="h-5 w-5" />
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-white hover:brightness-110 text-black font-semibold rounded-2xl transition-all active:scale-95">
                  <LogIn className="h-5 w-5" />
                  Se connecter
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/client/panier"
              className="relative p-3 rounded-2xl bg-white/5 text-white/70"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-2xl bg-white/5 text-white/70"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-white/10 py-8">
          <div className="px-6 space-y-2">
            {isSignedIn && (
              <Link
                href="/client/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl mb-8 border border-white/10"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-white rounded-2xl flex items-center justify-center text-3xl text-black font-semibold">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[#D4AF37] text-sm">Mon profil</p>
                </div>
              </Link>
            )}

            <Link
              href="/client"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-6 py-5 rounded-3xl ${isActive("/client") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
            >
              <Home className="h-6 w-6" />
              <span className="font-medium">Accueil</span>
            </Link>

            <Link
              href="/client/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-6 py-5 rounded-3xl ${isActive("/catalog") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
            >
              <Package className="h-6 w-6" />
              <span className="font-medium">Collection</span>
            </Link>

            {isSignedIn && (
              <Link
                href="/client/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-5 rounded-3xl ${isActive("/orders") ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5"}`}
              >
                <Receipt className="h-6 w-6" />
                <span className="font-medium">Mes Commandes</span>
              </Link>
            )}

            {/* Theme Toggle in Mobile */}
            <div className="pt-6 px-6 flex items-center justify-between">
              <span className="text-white/60">Thème</span>
              <button 
                onClick={toggleDarkMode}
                className="p-4 bg-white/5 rounded-2xl"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            <div className="pt-8 px-6">
              {isSignedIn ? (
                <SignOutButton>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-5 rounded-3xl font-medium transition"
                  >
                    <LogOut className="h-5 w-5" />
                    Se déconnecter
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-white text-black py-5 rounded-3xl font-semibold"
                  >
                    Se connecter
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}