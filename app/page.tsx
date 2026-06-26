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
  images: string[];
  category: string;
  gender: string;
  color: string;
  colorHex?: string;
  stock: number;
  isNew?: boolean;
  sizes: string[];
};

export default function HomePage() {
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
      const res = await fetch("/api/admin/product");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
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
        alert("✅ Produit ajouté au panier !");
      }
    } catch {
      alert("Erreur lors de l'ajout");
    }
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-zinc-800 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER - Identique à ton screenshot */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-bold tracking-tighter">IRNAS</div>
            <div className="text-amber-400 text-sm font-medium tracking-widest">FASHION</div>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-sm uppercase tracking-widest">
            <Link href="/" className="hover:text-amber-400 transition">ACCUEIL</Link>
            <Link href="#shop" className="text-amber-400">BOUTIQUE</Link>
            <Link href="#" className="hover:text-amber-400 transition">COLLECTIONS</Link>
            <Link href="#" className="hover:text-amber-400 transition">À PROPOS</Link>
          </nav>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-80">
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-3 pl-12 text-sm focus:outline-none focus:border-amber-400"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button className="text-white hover:text-amber-400 transition">
              <Heart className="w-6 h-6" />
            </button>

            <Link href="/client/panier" className="relative">
              <ShoppingCart className="w-6 h-6 hover:text-amber-400 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="pt-32 pb-20 text-center border-b border-white/10">
        <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-4">IRNAS</h1>
        <p className="text-xl text-zinc-400">L’élégance intemporelle • Le style moderne</p>
      </div>

      {/* NOS COLLECTIONS */}
      <div id="shop" className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-5xl font-bold tracking-tight">Nos Collections</h2>
          <button className="flex items-center gap-3 px-6 py-3 border border-white/20 rounded-full hover:bg-white/5 transition">
            <Filter size={18} /> Filtrer
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-zinc-950 border border-white/5 hover:border-amber-400/30 rounded-3xl overflow-hidden transition-all"
            >
              <div className="relative h-[380px] flex items-center justify-center bg-black overflow-hidden">
                {product.isNew && (
                  <div className="absolute top-6 left-6 bg-emerald-600 text-xs font-bold px-4 py-2 rounded-full z-10">
                    NEW
                  </div>
                )}

                <Image
                  src={product.images[0] || "https://via.placeholder.com/400"}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold leading-tight">{product.name}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{product.color} • {product.category}</p>
                  </div>
                  <button onClick={() => toggleFavorite(product.id)} className="text-zinc-400 hover:text-red-500">
                    <Heart className={`w-5 h-5 ${favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                </div>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">
                    {product.price.toFixed(2)} TND
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product.id)}
                  disabled={product.stock <= 0}
                  className="mt-6 w-full bg-white text-black font-semibold py-4 rounded-2xl hover:bg-amber-400 disabled:opacity-50 transition"
                >
                  AJOUTER AU PANIER
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}