"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Filter } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  isNew?: boolean;
  stock: number;
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.length || 0);
      }
    } catch {}
  };

  const addToCart = async (productId: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        setCartCount((prev) => prev + 1);
        // Toast de succès (tu peux améliorer avec un vrai toast)
        alert("Produit ajouté au panier ✓");
      }
    } catch (err) {
      alert("Erreur lors de l'ajout");
    }
  };

  const toggleFavorite = async (productId: number) => {
    // Implémentation favorite (tu peux la compléter avec ton API)
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-700 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold tracking-tighter">DIVINITY</div>
            <div className="text-xs text-amber-400 tracking-widest">The Art of a Radiant Smile</div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-400 transition">Accueil</Link>
            <Link href="/catalog" className="text-amber-400">Boutique</Link>
            <Link href="#" className="hover:text-amber-400 transition">Collections</Link>
            <Link href="#" className="hover:text-amber-400 transition">À propos</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 py-2.5 w-72 text-sm focus:outline-none focus:border-amber-400"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button className="relative">
              <Heart className="w-6 h-6 hover:text-amber-400 transition" />
            </button>

            <Link href="/client/panier" className="relative">
              <ShoppingCart className="w-6 h-6 hover:text-amber-400 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="pt-24 pb-16 bg-gradient-to-b from-black via-[#0f0f0f] to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto text-center px-6">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4">
            La Perfection du Sourire
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Kits de blanchiment professionnels • Résultats visibles dès la première utilisation
          </p>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-4xl font-bold">Nos Produits</h2>
          <button className="flex items-center gap-2 text-sm uppercase tracking-widest border border-white/20 px-6 py-3 rounded-full hover:bg-white/5">
            <Filter size={18} /> Filtrer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="group bg-[#111] rounded-3xl overflow-hidden border border-white/5 hover:border-amber-400/30 transition-all duration-500"
              >
                <div className="relative h-[420px] bg-[#0a0a0a] overflow-hidden">
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 bg-blue-600 text-white text-sm font-medium px-4 py-1 rounded">
                      Sale!
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Image
                      src={product.images[0] || "/placeholder.jpg"}
                      alt={product.name}
                      width={380}
                      height={380}
                      className="object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Effet piédestal doré */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-gradient-to-r from-amber-400/20 to-amber-600/20 blur-xl rounded-full" />
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-semibold leading-tight mb-1">{product.name}</h3>
                      <p className="text-amber-400 text-sm uppercase tracking-widest">{product.category}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Heart className={`w-6 h-6 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <div className="mt-6 flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-white">
                      {product.price.toLocaleString("fr-TN")} TND
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through text-lg">
                        {product.originalPrice.toLocaleString("fr-TN")} TND
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="mt-8 w-full bg-white text-black py-4 rounded-2xl font-semibold hover:bg-amber-400 transition disabled:opacity-50"
                  >
                    AJOUTER AU PANIER
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}