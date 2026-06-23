// components/AdminNavbar.tsx
"use client";

import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { LayoutDashboard, Package, ShoppingCart, Users, Moon, Sun, LogOut, Sparkles, Menu, X, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminNavbar() {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Logo IRNAS */}
         <Link href="/" className="flex items-center group">
            <img
              src="/llogo.png"
              alt="irNas — Timeless Royalty"
              width={120}
              height={48}
              className="object-contain h-12 w-auto transition-transform duration-300 group-hover:scale-105"
           
            /> <div className="flex justify-between  text-orange-200 items-center h-16">IRNAS</div>
          </Link>

          {/* Liens Admin Desktop */}
          <div className="hidden md:flex space-x-2">
            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/admin")
                  ? "bg-violet-600 dark:bg-violet-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/admin/catalog"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/admin/products") || pathname.startsWith("/admin/products")
                  ? "bg-violet-600 dark:bg-violet-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Produits</span>
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300  ${
                isActive("/admin/orders")
                  ? "bg-violet-600 dark:bg-violet-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">Commandes</span>
              {/* Badge pour nouvelles commandes */}
              <span className="absolute  bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                3
              </span>
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive("/admin/users")
                  ? "bg-violet-600 dark:bg-violet-500 text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Utilisateurs</span>
            </Link>
          </div>

          {/* Mode Sombre & Profil Admin Desktop */}
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

            {/* Profil Admin */}
            {isSignedIn && (
              <Link 
                href="/admin/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 transition-all duration-300 group"
                title="Voir mon profil"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {user.firstName || "Admin"}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                    Administrateur
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {user.firstName?.[0] || "I"}
                </div>
              </Link>
            )}

            {/* Déconnexion */}
            {isSignedIn && (
              <SignOutButton>
                <button
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 shadow-md font-medium"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden lg:inline">Déconnexion</span>
                </button>
              </SignOutButton>
            )}
          </div>

          {/* Menu Mobile Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>

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
      <div className={`md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-4 py-3 space-y-2">
          {/* Profil Admin Mobile */}
          {isSignedIn && (
            <Link
              href="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 bg-violet-50 dark:bg-gray-800 rounded-lg mb-3 hover:bg-violet-100 dark:hover:bg-gray-700 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user.firstName?.[0] || "I"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName || "Admin"}
                </p>
                <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                  Administrateur
                </p>
              </div>
            </Link>
          )}

          {/* Liens Navigation Mobile */}
          <Link
            onClick={() => setMobileMenuOpen(false)}
            href="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive("/admin") ? "bg-violet-600 dark:bg-violet-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            onClick={() => setMobileMenuOpen(false)}
            href="/admin/catalog"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive("/admin/products") || pathname.startsWith("/admin/products")
                ? "bg-violet-600 dark:bg-violet-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="font-medium">Produits (Mode, Parfums, Accessoires)</span>
          </Link>

          <Link
            onClick={() => setMobileMenuOpen(false)}
            href="/admin/orders"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 relative ${
              isActive("/admin/orders") ? "bg-violet-600 dark:bg-violet-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Commandes</span>
            <span className="absolute top-4 right-6 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              3
            </span>
          </Link>

          <Link
            onClick={() => setMobileMenuOpen(false)}
            href="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
              isActive("/admin/users") ? "bg-violet-600 dark:bg-violet-500 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-gray-800"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="font-medium">Clients</span>
          </Link>

          {/* Déconnexion Mobile */}
          {isSignedIn && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <SignOutButton>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-medium shadow-md"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Se déconnecter</span>
                </button>
              </SignOutButton>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}