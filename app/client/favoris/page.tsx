"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, X, ChevronLeft } from "lucide-react";
import ClientNavbar from "@/components/ClientNavbar";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
  sizes: string[];
};

export default function FavorisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const removeFromFavorites = async (productId: number) => {
    setRemoving(productId);
    await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setRemoving(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');
        :root {
          --bg-primary: #0A0A0A;
          --glass-bg: rgba(17,17,17,0.7);
          --glass-border: rgba(255,255,255,0.05);
          --border-light: rgba(255,255,255,0.08);
          --text-primary: #F8F6F2;
          --text-secondary: rgba(248,246,242,0.65);
          --text-muted: rgba(248,246,242,0.4);
          --accent-gold: #D4AF37;
          --accent-coral: #FF6B6B;
          --gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F5E6A3 50%, #D4AF37 100%);
        }
        body { background: var(--bg-primary); color: var(--text-primary); font-family: 'Instrument Sans', sans-serif; }
        .favs-page { min-height: 100vh; background: var(--bg-primary); }
        .favs-hero {
          padding: 5rem 2rem 2rem;
          text-align: center;
        }
        .favs-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .favs-subtitle { color: var(--text-muted); font-size: 0.95rem; }
        .favs-heart { color: var(--accent-coral); vertical-align: middle; margin-right: 0.5rem; }
        .favs-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 2rem 6rem;
        }
        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .product-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1.5rem;
          overflow: hidden;
          position: relative;
          transition: all 0.4s ease;
        }
        .product-card:hover {
          border-color: rgba(212,175,55,0.2);
          transform: translateY(-4px);
          box-shadow: 0 24px 48px -16px rgba(0,0,0,0.6);
        }
        .card-img-wrap {
          position: relative;
          aspect-ratio: 3/4;
          background: rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .product-card:hover .card-img { transform: scale(1.05); }
        .card-img-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: var(--text-muted); }
        .remove-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,107,107,0.3);
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-coral);
          cursor: pointer;
          transition: all 0.25s ease;
          z-index: 3;
        }
        .remove-btn:hover { background: rgba(255,107,107,0.2); }
        .card-body { padding: 1.25rem; }
        .card-name { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.3rem; }
        .card-price {
          font-family: 'Syne', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin-bottom: 1rem;
        }
        .card-price span { font-size: 0.75rem; font-family: 'Instrument Sans', sans-serif; color: var(--text-muted); background: none; -webkit-background-clip: unset; background-clip: unset; }
        .cart-btn {
          width: 100%;
          padding: 0.875rem;
          background: var(--gradient-gold);
          color: #0A0A0A;
          border: none;
          border-radius: 0.875rem;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .cart-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 24px -8px rgba(212,175,55,0.4); }
        .empty-state { text-align: center; padding: 6rem 2rem; }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .empty-sub { color: var(--text-muted); margin-bottom: 2rem; }
        .back-link {
          display: inline-flex; align-items: center; gap: 0.4rem;
          color: var(--accent-gold);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.6rem 1.5rem;
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 9999px;
          transition: all 0.25s ease;
        }
        .back-link:hover { background: rgba(212,175,55,0.1); }
        .skeleton { animation: shimmer 1.5s infinite; background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skel-card { background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 1.5rem; overflow: hidden; }
        .skel-img { aspect-ratio: 3/4; }
        .skel-body { padding: 1.25rem; }
        .skel-line { height: 14px; border-radius: 7px; margin-bottom: 0.75rem; }
      `}</style>

      <div className="favs-page">
        <ClientNavbar />

        <div className="favs-hero">
          <Heart size={28} className="favs-heart" fill="var(--accent-coral)" stroke="var(--accent-coral)" />
          
        </div>

        <main className="favs-main">
          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skel-card">
                  <div className="skel-img skeleton" />
                  <div className="skel-body">
                    <div className="skel-line skeleton" style={{ width: "70%" }} />
                    <div className="skel-line skeleton" style={{ width: "40%", height: "22px" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤍</div>
              <p className="empty-title">Aucun favori pour l'instant</p>
              <p className="empty-sub">Explorez le catalogue et cliquez sur ♡ pour sauvegarder vos articles.</p>
              <Link href="/catalog" className="back-link">
                <ChevronLeft size={16} /> Voir le catalogue
              </Link>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="card-img-wrap">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="card-img" />
                    ) : (
                      <div className="card-img-empty">📷</div>
                    )}
                    <button
                      className="remove-btn"
                      onClick={() => removeFromFavorites(product.id)}
                      disabled={removing === product.id}
                      title="Retirer des favoris"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="card-body">
                    <p className="card-name">{product.name}</p>
                    <div className="card-price">
                      {product.price.toFixed(2)}<span> TND</span>
                    </div>
                    <Link href={`/client/catalog?search=${encodeURIComponent(product.name)}`} className="cart-btn">
                      <ShoppingCart size={16} />
                      Voir dans le catalogue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}