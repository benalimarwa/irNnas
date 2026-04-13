// components/ClientNavbar.tsx
"use client";

import Link from "next/link";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { ShoppingBag, User, Home, Sparkles, Package, Moon, Sun, Receipt, Menu, X, LogOut, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ClientNavbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3); // À remplacer par la vraie valeur du panier

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const isDark = theme === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-gray-900/80 shadow-md transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              ParfumIA
            </span>
          </Link>

          {/* Liens Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/")
                  ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Accueil</span>
            </Link>

            <Link
              href="/client/quiz"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/client/quiz")
                  ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Quiz Parfum</span>
            </Link>

            <Link
              href="/client/catalog"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/client/catalog")
                  ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Catalogue</span>
            </Link>

            {isSignedIn && (
              <Link
                href="/client/orders"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive("/client/orders")
                    ? "bg-purple-600 dark:bg-purple-500 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                }`}
              >
                <Receipt className="h-5 w-5" />
                <span className="font-medium">Mes Commandes</span>
              </Link>
            )}
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Bouton Mode Sombre */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:scale-105"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Panier */}
            <Link
              href="/client/cart"
              className="relative p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:scale-105"
            >
              <ShoppingBag className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profil et Auth */}
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                {/* Bouton Profil */}
                <Link
                  href="/client/profile"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
                    isActive("/profile")
                      ? "bg-purple-600 text-white"
                      : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  }`}
                  title="Mon Profil"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user.firstName || "Profil"}</span>
                </Link>
                
                {/* Bouton Déconnexion */}
                <SignOutButton>
                  <button 
                    className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 shadow-md hover:scale-105"
                    title="Se déconnecter"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all duration-300 shadow-md font-medium">
                  <LogIn className="h-5 w-5" />
                  <span>Se connecter</span>
                </button>
              </SignInButton>
            )}
          </div>

          {/* Menu Mobile Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Panier Mobile */}
            <Link
              href="/client/cart"
              className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-2">
            {/* Profil Mobile - En haut du menu si connecté */}
            {isSignedIn && (
              <Link
                href="/client/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-lg mb-3 hover:from-purple-100 hover:to-pink-100 dark:hover:bg-gray-700 transition-all duration-300 border-2 border-purple-200 dark:border-purple-800"
              >
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.firstName?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.firstName || "Mon compte"}
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                    Voir mon profil →
                  </p>
                </div>
                <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </Link>
            )}

            {/* Liens Navigation */}
            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive("/")
                  ? "bg-purple-600 dark:bg-purple-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Accueil</span>
            </Link>

            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/client/quiz"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive("/client/quiz")
                  ? "bg-purple-600 dark:bg-purple-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Quiz Parfum</span>
            </Link>

            <Link
              onClick={() => setMobileMenuOpen(false)}
              href="/client/catalog"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive("/client/catalog")
                  ? "bg-purple-600 dark:bg-purple-500 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Catalogue</span>
            </Link>

            {isSignedIn && (
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/client/orders"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive("/client/orders")
                    ? "bg-purple-600 dark:bg-purple-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
                }`}
              >
                <Receipt className="h-5 w-5" />
                <span className="font-medium">Mes Commandes</span>
              </Link>
            )}

            {/* Mode Sombre Mobile */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300 font-medium">Mode Sombre</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>

            {/* Auth Mobile */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              {isSignedIn ? (
                <SignOutButton>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Se déconnecter</span>
                  </button>
                </SignOutButton>
              ) : (
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Se connecter</span>
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
