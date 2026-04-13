// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { ShoppingBag, User, Home, Sparkles, Package, Moon, Sun, Receipt } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isSignedIn, user } = useUser();
  const [isDarkMode, setIsDarkMode] = useState(false);

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

          {/* Liens */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
            >
              <Home className="h-5 w-5" />
              <span>Accueil</span>
            </Link>
            <Link
              href="/quiz"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
            >
              <Sparkles className="h-5 w-5" />
              <span>Quiz Parfum</span>
            </Link>
            <Link
              href="/catalogue"
              className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
            >
              <Package className="h-5 w-5" />
              <span>Catalogue</span>
            </Link>
            {isSignedIn && (
              <Link
                href="/orders"
                className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300"
              >
                <Receipt className="h-5 w-5" />
                <span>Mes Commandes</span>
              </Link>
            )}
          </div>

          {/* Panier, Mode Sombre & Profil */}
          <div className="flex items-center space-x-4">
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
              href="/cart"
              className="relative p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-all duration-300"
            >
              <ShoppingBag className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute -top-1 -right-1 bg-purple-600 dark:bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Link>

            {/* Profil */}
            {isSignedIn ? (
              <Link
                href="/profil"
                className="flex items-center space-x-2 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                <User className="h-5 w-5" />
                <span>{user.firstName || "Profil"}</span>
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}