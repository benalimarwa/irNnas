// components/Header.tsx
// ============================================

import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-3xl">💐</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              IRNAS
            </h1>
          </div>
          
          
          

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-purple-100 rounded-full transition">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-purple-100 rounded-full transition">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-purple-100 rounded-full transition relative">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            
            {/* Auth */}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <button className="text-purple-600 hover:text-purple-700 font-semibold">
                    Connexion
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
                    Inscription
                  </button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <a href="/parfums" className="block py-2 text-gray-700 hover:text-purple-600">
              Parfums
            </a>
            <a href="/maisons" className="block py-2 text-gray-700 hover:text-purple-600">
              Maisons
            </a>
            <a href="/quiz" className="block py-2 text-gray-700 hover:text-purple-600">
              Quiz IA
            </a>
            <a href="/nouveautes" className="block py-2 text-gray-700 hover:text-purple-600">
              Nouveautés
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}