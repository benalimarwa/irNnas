"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, ShoppingCart, CheckCircle,
  AlertCircle, XCircle, X, ChevronLeft,
  ChevronRight, Eye, Heart, SlidersHorizontal,
  Sparkles, Package,
} from "lucide-react";
import ClientNavbar from "@/components/ClientNavbar";

type Category = "all" | "pantalon" | "pull" | "veste" | "chemise" | "accessoire";
type Gender   = "all" | "men" | "women" | "unisex";

type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: Exclude<Category, "all">;
  gender: Exclude<Gender, "all">;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
  sizes: string[];
};

type AlertState = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  all: "Tout", pantalon: "Pantalon", pull: "Pull / Polo",
  veste: "Veste", chemise: "Chemise", accessoire: "Accessoire",
};

const CATEGORY_ICONS: Record<string, string> = {
  pantalon: "👖", pull: "🧥", veste: "🥋", chemise: "👔", accessoire: "👜",
};

const GENDER_LABELS: Record<string, string> = {
  all: "Tous", men: "Homme", women: "Femme", unisex: "Unisexe",
};

const GENDER_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  men:    { label: "Homme",   color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  women:  { label: "Femme",   color: "#F472B6", bg: "rgba(244,114,182,0.12)" },
  unisex: { label: "Unisexe", color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
};

const CATEGORY_ORDER: Array<Exclude<Category, "all">> = [
  "pantalon", "pull", "veste", "chemise", "accessoire",
];

export default function CatalogPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [category, setCategory]         = useState<Category>("all");
  const [gender, setGender]             = useState<Gender>("all");
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});
  const [activeImage, setActiveImage]   = useState<Record<number, number>>({});
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [alert, setAlert]               = useState<AlertState>({ show: false, type: "success", message: "" });
  const [wishlist, setWishlist]         = useState<Set<number>>(new Set());
  const [lightbox, setLightbox]         = useState<{ product: Product; index: number } | null>(null);
  const [filtersOpen, setFiltersOpen]   = useState(false);

  // ── Load favorites from DB on mount ──
  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setWishlist(new Set(data.map((p) => p.id)));
      })
      .catch(() => {});
  }, []);

  // ── Fetch products ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm)         params.set("search", searchTerm);
    if (category !== "all") params.set("category", category);
    if (gender   !== "all") params.set("gender", gender);
    setLoading(true);
    fetch(`/api/products/filter?${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data || []))
      .finally(() => setLoading(false));
  }, [searchTerm, category, gender]);

  const showAlert = (type: AlertState["type"], message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3000);
  };

  const handleAddToCart = async (product: Product) => {
    const size = selectedSize[product.id];
    if (product.sizes.length > 0 && !size) {
      showAlert("warning", "Veuillez sélectionner une taille");
      return;
    }
    setAddingToCart(product.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1, size: size || null }),
      });
      if (res.ok) {
        showAlert("success", `${product.name} ajouté au panier !`);
        setTimeout(() => { window.location.href = "/client/panier"; }, 1200);
      } else {
        const err = await res.json();
        showAlert("error", err.error || "Impossible d'ajouter au panier");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setAddingToCart(null);
    }
  };

  const toggleWishlist = async (id: number) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
    } catch {
      setWishlist((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const prevImage = (productId: number, total: number) =>
    setActiveImage((prev) => ({ ...prev, [productId]: ((prev[productId] ?? 0) - 1 + total) % total }));

  const nextImage = (productId: number, total: number) =>
    setActiveImage((prev) => ({ ...prev, [productId]: ((prev[productId] ?? 0) + 1) % total }));

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const activeFiltersCount = (category !== "all" ? 1 : 0) + (gender !== "all" ? 1 : 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Syne:wght@500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --bg:            #080808;
          --surface:       #0F0F0F;
          --surface-2:     #161616;
          --border:        rgba(255,255,255,0.07);
          --border-hover:  rgba(212,175,55,0.25);
          --text-1:        #F5F3EF;
          --text-2:        rgba(245,243,239,0.6);
          --text-3:        rgba(245,243,239,0.35);
          --gold:          #D4AF37;
          --gold-light:    #F0D060;
          --gold-dim:      rgba(212,175,55,0.15);
          --coral:         #FF6B6B;
          --teal:          #4ECDC4;
          --amber:         #FFB347;
          --grad-gold:     linear-gradient(135deg,#D4AF37,#F0D060,#D4AF37);
          --grad-multi:    linear-gradient(135deg,#D4AF37,#FF6B6B,#4ECDC4,#9B59B6);
          --glass:         rgba(15,15,15,0.75);
          --radius-card:   1.25rem;
          --radius-btn:    0.75rem;
          --mono:          'DM Mono', monospace;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Instrument Sans', sans-serif;
          color: var(--text-1);
          overflow-x: hidden;
          position: relative;
        }

        /* ── Video bg ── */
        .cp-vbg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .cp-vbg video { width:100%; height:100%; object-fit:cover; opacity:0.08; }
        .cp-vbg::after {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 60% 50% at 10% 0%,  rgba(212,175,55,0.12) 0%,transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 20%, rgba(255,107,107,0.07) 0%,transparent 70%),
            radial-gradient(ellipse 40% 40% at 50% 90%, rgba(78,205,196,0.07)  0%,transparent 70%),
            linear-gradient(180deg,rgba(8,8,8,0.4) 0%,rgba(8,8,8,0.2) 40%,rgba(8,8,8,0.7) 100%);
        }

        .cp-dot {
          position:fixed; border-radius:50%;
          filter:blur(90px); opacity:0.18; pointer-events:none; z-index:1;
        }

        /* ── Content ── */
        .cp-inner { position:relative; z-index:2; }

        /* ── Hero ── */
        .cp-hero {
          padding: 6rem 2rem 3.5rem;
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }
        .cp-eyebrow {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--gold-dim);
          border: 1px solid rgba(212,175,55,0.22);
          padding: 0.35rem 1rem;
          border-radius: 9999px;
          font-size: 0.65rem; font-weight: 600; letter-spacing: 2.5px;
          color: var(--gold); text-transform: uppercase; margin-bottom: 1.75rem;
        }
        .cp-eyebrow-dot {
          width:6px; height:6px; background:var(--gold); border-radius:50%;
          animation: blink 2.2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.3)} }

        .cp-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.02;
          margin-bottom: 1rem;
        }
        .cp-title-grad {
          background: var(--grad-multi); background-size: 250% auto;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: flow 5s ease infinite;
        }
        @keyframes flow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

        .cp-sub {
          font-size: 0.95rem; color: var(--text-2); line-height: 1.65; margin-bottom: 1.75rem;
        }

        .cp-favlink {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.4rem;
          border: 1px solid rgba(212,175,55,0.22);
          border-radius: 9999px;
          font-size: 0.78rem; font-weight: 600;
          color: var(--gold); text-decoration: none;
          transition: all 0.25s ease;
        }
        .cp-favlink:hover { background: var(--gold-dim); border-color: rgba(212,175,55,0.5); }
        .cp-favlink-n {
          background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.25);
          border-radius: 9999px; padding: 0.1rem 0.6rem; font-size: 0.68rem; font-weight: 700;
        }

        /* ── Filter bar ── */
        .cp-fbar {
          position: sticky; top: 0; z-index: 50;
          backdrop-filter: blur(28px) saturate(1.4);
          background: rgba(8,8,8,0.88);
          border-bottom: 1px solid var(--border);
        }
        .cp-fbar-row {
          max-width: 1440px; margin: 0 auto; padding: 1.1rem 2rem;
          display: flex; gap: 0.75rem; align-items: center;
        }
        .cp-search { position: relative; flex: 1; }
        .cp-search-icon {
          position: absolute; left: 1.1rem; top: 50%; transform: translateY(-50%);
          color: var(--text-3); pointer-events: none;
        }
        .cp-search-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 9999px;
          padding: 0.8rem 1.2rem 0.8rem 3rem;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 0.875rem; color: var(--text-1); outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .cp-search-input::placeholder { color: var(--text-3); }
        .cp-search-input:focus {
          border-color: rgba(212,175,55,0.35);
          background: rgba(212,175,55,0.03);
        }
        .cp-ftoggle {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.8rem 1.4rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border); border-radius: 9999px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 0.825rem; font-weight: 600;
          color: var(--text-2); cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .cp-ftoggle:hover { border-color: var(--border-hover); color: var(--gold); }
        .cp-ftoggle.on { background: var(--gold-dim); border-color: rgba(212,175,55,0.4); color: var(--gold); }
        .cp-fbadge {
          background: var(--gold); color: #080808;
          font-size: 0.6rem; font-weight: 800;
          width: 17px; height: 17px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Filter drawer ── */
        .cp-fdrawer {
          max-width: 1440px; margin: 0 auto; padding: 0 2rem;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s;
          max-height: 0; opacity: 0;
        }
        .cp-fdrawer.open { max-height: 260px; opacity: 1; }
        .cp-fdrawer-inner {
          padding: 1.5rem 0 1.75rem;
          display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
          border-top: 1px solid var(--border); margin-top: 0;
        }
        .cp-flabel {
          font-size: 0.6rem; letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--text-3); font-weight: 700; margin-bottom: 0.65rem;
        }
        .cp-fpills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .cp-fpill {
          padding: 0.45rem 1rem; border-radius: 9999px;
          font-size: 0.775rem; font-weight: 500;
          border: 1px solid var(--border); background: transparent;
          color: var(--text-2); cursor: pointer;
          transition: all 0.2s;
          font-family: 'Instrument Sans', sans-serif;
        }
        .cp-fpill:hover { border-color: var(--border-hover); color: var(--text-1); }
        .cp-fpill.on { background: var(--gold-dim); border-color: rgba(212,175,55,0.45); color: var(--gold); }

        /* ── Main grid area ── */
        .cp-main { max-width: 1440px; margin: 0 auto; padding: 3rem 2rem 7rem; }

        /* ── Section heading ── */
        .cp-sec-head {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem;
        }
        .cp-sec-icon {
          font-size: 1.3rem; line-height: 1;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 0.65rem; padding: 0.45rem 0.6rem;
        }
        .cp-sec-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.3rem, 2.5vw, 1.9rem);
          font-weight: 700; letter-spacing: -0.025em;
        }
        .cp-sec-count {
          font-family: var(--mono); font-size: 0.72rem;
          color: var(--text-3); padding: 0.2rem 0.6rem;
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 0.4rem; letter-spacing: 0.5px;
        }
        .cp-sec-line { flex: 1; height: 1px; background: var(--border); }

        /* ── Product grid ── */
        .cp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 1.25rem;
          margin-bottom: 4rem;
        }

        /* ── Product card ── */
        .pcard {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: var(--radius-card);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform 0.45s cubic-bezier(0.4,0,0.2,1),
                      border-color 0.3s, box-shadow 0.45s;
          position: relative;
          backdrop-filter: blur(12px);
        }
        .pcard:hover {
          transform: translateY(-5px);
          border-color: rgba(212,175,55,0.22);
          box-shadow:
            0 28px 56px -20px rgba(0,0,0,0.7),
            0 0 0 1px rgba(212,175,55,0.07),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }
        /* top shimmer line */
        .pcard::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background: var(--grad-gold); transform:scaleX(0); transform-origin:left;
          transition:transform 0.45s cubic-bezier(0.4,0,0.2,1); z-index:2;
        }
        .pcard:hover::before { transform:scaleX(1); }

        /* ── Image zone ── */
        .pcard-img-wrap {
          position: relative;
          aspect-ratio: 4/5;
          background: var(--surface-2);
          overflow: hidden;
          flex-shrink: 0;
        }
        .pcard-img {
          width:100%; height:100%; object-fit:cover;
          transition: transform 0.65s cubic-bezier(0.4,0,0.2,1);
        }
        .pcard:hover .pcard-img { transform: scale(1.07); }
        .pcard-img-empty {
          width:100%; height:100%;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:0.5rem; color:var(--text-3); font-size:2.5rem;
        }
        .pcard-img-empty span { font-size:0.75rem; font-family:var(--mono); letter-spacing:1px; }

        /* gradient overlay on image bottom */
        .pcard-img-grad {
          position:absolute; bottom:0; left:0; right:0; height:45%;
          background: linear-gradient(to top, rgba(8,8,8,0.85) 0%, transparent 100%);
          pointer-events:none; z-index:1;
        }

        /* arrows */
        .pcard-arr {
          position:absolute; top:50%; transform:translateY(-50%);
          background:rgba(0,0,0,0.55); backdrop-filter:blur(6px);
          border:1px solid rgba(255,255,255,0.09); border-radius:50%;
          width:34px; height:34px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#fff; z-index:3;
          opacity:0; transition:opacity 0.25s, background 0.2s;
        }
        .pcard:hover .pcard-arr { opacity:1; }
        .pcard-arr.l { left:0.65rem; }
        .pcard-arr.r { right:0.65rem; }
        .pcard-arr:hover { background:rgba(212,175,55,0.28); border-color:rgba(212,175,55,0.5); }

        /* dot indicators */
        .pcard-dots {
          position:absolute; bottom:0.65rem; left:50%; transform:translateX(-50%);
          display:flex; gap:0.28rem; z-index:3;
        }
        .pcard-dot {
          width:4px; height:4px; border-radius:50%;
          background:rgba(255,255,255,0.3); transition:all 0.25s;
        }
        .pcard-dot.on { background:var(--gold); width:12px; border-radius:999px; }

        /* overlay actions */
        .pcard-actions {
          position:absolute; top:0.7rem; right:0.7rem;
          display:flex; flex-direction:column; gap:0.4rem; z-index:4;
        }
        .pcard-action-btn {
          width:36px; height:36px; border-radius:50%;
          background:rgba(0,0,0,0.6); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,0.09);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:#fff;
          transition:all 0.2s;
        }
        .pcard-action-btn:hover { background:rgba(255,255,255,0.1); }
        .pcard-action-btn.fav { border-color:rgba(212,175,55,0.45); }

        /* quick view */
        .pcard-qview {
          position:absolute; bottom:0.7rem; left:0.7rem; z-index:4;
          background:rgba(0,0,0,0.65); backdrop-filter:blur(8px);
          border:1px solid rgba(255,255,255,0.09);
          padding:0.38rem 0.9rem; border-radius:999px;
          font-size:0.72rem; font-family:'Instrument Sans',sans-serif; font-weight:500;
          color:#fff; cursor:pointer;
          display:flex; align-items:center; gap:0.35rem;
          opacity:0; transition:opacity 0.25s, background 0.2s;
        }
        .pcard:hover .pcard-qview { opacity:1; }
        .pcard-qview:hover { background:rgba(212,175,55,0.22); border-color:rgba(212,175,55,0.45); }

        /* stock badge */
        .pcard-stock {
          position:absolute; top:0.7rem; left:0.7rem; z-index:4;
          font-size:0.6rem; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
          padding:0.22rem 0.65rem; border-radius:999px;
          font-family:var(--mono);
        }
        .pcard-stock.out { background:rgba(255,107,107,0.14); color:var(--coral); border:1px solid rgba(255,107,107,0.28); }
        .pcard-stock.low { background:rgba(255,179,71,0.14); color:var(--amber); border:1px solid rgba(255,179,71,0.28); }

        /* ── Card body ── */
        .pcard-body {
          padding: 1.1rem 1.2rem 1.35rem;
          display: flex; flex-direction: column; gap: 0;
          flex: 1;
        }

        /* meta row: gender badge + color swatch */
        .pcard-meta {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.6rem;
        }
        .pcard-gender {
          font-size: 0.6rem; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 0.18rem 0.6rem; border-radius: 999px;
          font-family: var(--mono);
        }
        .pcard-color-wrap {
          display: flex; align-items: center; gap: 0.5rem;
        }
        .pcard-color-name {
          font-size: 0.68rem; color: var(--text-3); font-family: var(--mono);
        }
        .pcard-color-dot {
          width: 14px; height: 14px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.15);
          flex-shrink: 0;
        }

        /* name */
        .pcard-name {
          font-weight: 600; font-size: 1rem; line-height: 1.3;
          color: var(--text-1); margin-bottom: 0.3rem;
          letter-spacing: -0.01em;
        }

        /* price row */
        .pcard-price-row {
          display: flex; align-items: baseline; gap: 0.35rem;
          margin-bottom: 0.6rem;
        }
        .pcard-price {
          font-family: 'Syne', sans-serif;
          font-size: 1.75rem; font-weight: 800;
          background: var(--grad-gold);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          letter-spacing: -0.03em; line-height: 1;
        }
        .pcard-currency {
          font-family: var(--mono); font-size: 0.72rem;
          color: var(--text-3); font-weight: 500;
        }

        /* description */
        .pcard-desc {
          font-size: 0.78rem; color: var(--text-3); line-height: 1.55;
          margin-bottom: 0.9rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* divider */
        .pcard-divider {
          height: 1px; background: var(--border); margin-bottom: 0.9rem;
        }

        /* sizes */
        .pcard-sizes-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .pcard-sizes-label {
          font-size: 0.58rem; letter-spacing: 2px; text-transform: uppercase;
          color: var(--text-3); font-weight: 700; font-family: var(--mono);
        }
        .pcard-sizes-hint {
          font-size: 0.62rem; color: var(--text-3); font-style: italic;
        }
        .pcard-sizes-row {
          display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem;
        }
        .pcard-size {
          min-width: 38px; padding: 0.32rem 0.65rem;
          font-size: 0.72rem; font-family: var(--mono); font-weight: 500;
          border-radius: 0.45rem; border: 1px solid var(--border);
          background: transparent; color: var(--text-2);
          cursor: pointer; transition: all 0.18s; text-align: center;
        }
        .pcard-size:hover { border-color: rgba(212,175,55,0.3); color: var(--text-1); }
        .pcard-size.on {
          background: var(--gold-dim); border-color: rgba(212,175,55,0.5);
          color: var(--gold); font-weight: 700;
        }

        /* CTA button */
        .pcard-cta {
          width: 100%; padding: 0.9rem 1rem;
          background: var(--grad-gold); color: #080808;
          border: none; border-radius: var(--radius-btn);
          font-family: 'Instrument Sans', sans-serif;
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.3px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          transition: all 0.3s; margin-top: auto;
        }
        .pcard-cta:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px -8px rgba(212,175,55,0.45);
        }
        .pcard-cta:active:not(:disabled) { transform: translateY(0); }
        .pcard-cta:disabled { opacity: 0.4; cursor: not-allowed; }
        .pcard-cta.oos {
          background: var(--surface-2); color: var(--text-3);
          border: 1px solid var(--border);
        }

        /* loading spinner inside button */
        .spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #080808;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Skeleton ── */
        .skel { animation: skel-shine 1.6s ease infinite; }
        @keyframes skel-shine {
          0%,100% { opacity:0.4; } 50% { opacity:0.7; }
        }
        .skel-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-card); overflow: hidden;
        }
        .skel-img { aspect-ratio:4/5; background:var(--surface-2); }
        .skel-body { padding:1.1rem 1.2rem; }
        .skel-line {
          height:12px; border-radius:6px; background:var(--surface-2); margin-bottom:0.65rem;
        }

        /* ── Empty state ── */
        .cp-empty {
          text-align:center; padding:7rem 2rem;
        }
        .cp-empty-icon { font-size:3.5rem; margin-bottom:1rem; opacity:0.25; }
        .cp-empty-title {
          font-family:'Syne',sans-serif; font-size:1.6rem; font-weight:700;
          color:var(--text-2); margin-bottom:0.5rem;
        }
        .cp-empty-sub { font-size:0.875rem; color:var(--text-3); }

        /* ── Toast ── */
        .cp-toast {
          position:fixed; top:1.5rem; right:1.5rem; z-index:200;
          max-width:340px; min-width:260px;
          background:rgba(12,12,14,0.96); backdrop-filter:blur(20px);
          border-radius:1rem; padding:0.9rem 1.1rem;
          display:flex; align-items:flex-start; gap:0.65rem;
          border:1px solid var(--border);
          box-shadow:0 20px 48px rgba(0,0,0,0.6);
          animation:toast-slide 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes toast-slide { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .cp-toast.success { border-left:3px solid var(--teal); }
        .cp-toast.error   { border-left:3px solid var(--coral); }
        .cp-toast.warning { border-left:3px solid var(--amber); }
        .cp-toast-icon { flex-shrink:0; margin-top:1px; }
        .cp-toast-msg  { font-size:0.845rem; flex:1; color:var(--text-1); line-height:1.45; }
        .cp-toast-x   { background:none; border:none; color:var(--text-3); cursor:pointer; padding:0; flex-shrink:0; }

        /* ── Lightbox ── */
        .cp-lb {
          position:fixed; inset:0; z-index:300;
          background:rgba(0,0,0,0.96);
          display:flex; align-items:center; justify-content:center;
          padding:2rem; cursor:zoom-out;
        }
        .cp-lb img {
          max-width:100%; max-height:88vh; object-fit:contain;
          border-radius:1rem; cursor:default;
          box-shadow:0 32px 80px rgba(0,0,0,0.7);
        }
        .cp-lb-x {
          position:absolute; top:1.5rem; right:1.5rem;
          background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1);
          border-radius:50%; width:42px; height:42px;
          display:flex; align-items:center; justify-content:center;
          color:#fff; cursor:pointer; transition:all 0.2s;
        }
        .cp-lb-x:hover { background:rgba(255,107,107,0.2); border-color:rgba(255,107,107,0.4); }

        /* ── Responsive ── */
        @media (max-width:768px) {
          .cp-hero { padding:5rem 1.25rem 2.5rem; }
          .cp-fbar-row { padding:0.9rem 1.25rem; }
          .cp-fdrawer { padding:0 1.25rem; }
          .cp-fdrawer-inner { grid-template-columns:1fr; gap:1.25rem; }
          .cp-main { padding:2rem 1.25rem 5rem; }
          .cp-grid { grid-template-columns:repeat(auto-fill, minmax(240px,1fr)); gap:1rem; }
        }
      `}</style>

      <div className="cp">
        {/* Video bg */}
        <div className="cp-vbg">
          <video autoPlay muted loop playsInline>
            <source src="/video/mm.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Ambient dots */}
        <div className="cp-dot" style={{ top:"10%",  left:"3%",   width:"400px", height:"400px", background:"var(--gold)"  }} />
        <div className="cp-dot" style={{ bottom:"8%", right:"4%",  width:"300px", height:"300px", background:"var(--coral)" }} />
        <div className="cp-dot" style={{ top:"50%",  left:"70%",  width:"240px", height:"240px", background:"var(--teal)"  }} />

        <div className="cp-inner">
          <ClientNavbar />

          {/* Toast */}
          {alert.show && (
            <div className={`cp-toast ${alert.type}`}>
              <span className="cp-toast-icon">
                {alert.type === "success" && <CheckCircle size={17} color="var(--teal)"  />}
                {alert.type === "error"   && <XCircle     size={17} color="var(--coral)" />}
                {alert.type === "warning" && <AlertCircle size={17} color="var(--amber)" />}
              </span>
              <span className="cp-toast-msg">{alert.message}</span>
              <button className="cp-toast-x" onClick={() => setAlert({ ...alert, show: false })}>
                <X size={15} />
              </button>
            </div>
          )}

          {/* Lightbox */}
          {lightbox && (
            <div className="cp-lb" onClick={() => setLightbox(null)}>
              <img
                src={lightbox.product.images[lightbox.index]}
                alt={lightbox.product.name}
                onClick={(e) => e.stopPropagation()}
              />
              <button className="cp-lb-x" onClick={() => setLightbox(null)}>
                <X size={18} />
              </button>
            </div>
          )}

          {/* Hero */}
          <header className="cp-hero">
            <div className="cp-eyebrow">
              <span className="cp-eyebrow-dot" />
              Nouvelle collection
            </div>
            
            
            {wishlist.size > 0 && (
              <Link href="/client/favoris" className="cp-favlink">
                <Heart size={13} fill="var(--gold)" stroke="var(--gold)" />
                Mes favoris
                <span className="cp-favlink-n">{wishlist.size}</span>
              </Link>
            )}
          </header>

          {/* Filter bar */}
          <div className="cp-fbar">
            <div className="cp-fbar-row">
              <div className="cp-search">
                <Search size={16} className="cp-search-icon" />
                <input
                  type="text"
                  placeholder="Rechercher un article…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="cp-search-input"
                />
              </div>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={`cp-ftoggle ${filtersOpen || activeFiltersCount > 0 ? "on" : ""}`}
              >
                <SlidersHorizontal size={15} />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="cp-fbadge">{activeFiltersCount}</span>
                )}
              </button>
            </div>

            <div className={`cp-fdrawer ${filtersOpen ? "open" : ""}`}>
              <div className="cp-fdrawer-inner">
                <div>
                  <p className="cp-flabel">Catégorie</p>
                  <div className="cp-fpills">
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`cp-fpill ${category === c ? "on" : ""}`}
                      >
                        {c !== "all" && CATEGORY_ICONS[c] + " "}{CATEGORY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="cp-flabel">Genre</p>
                  <div className="cp-fpills">
                    {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`cp-fpill ${gender === g ? "on" : ""}`}
                      >
                        {GENDER_LABELS[g]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <main className="cp-main">
            {loading ? (
              <div className="cp-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skel-card skel">
                    <div className="skel-img" />
                    <div className="skel-body">
                      <div className="skel-line" style={{ width: "40%", height: "8px" }} />
                      <div className="skel-line" style={{ width: "75%", height: "14px" }} />
                      <div className="skel-line" style={{ width: "35%", height: "22px" }} />
                      <div className="skel-line" style={{ width: "90%", height: "10px" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">🔍</div>
                <p className="cp-empty-title">Aucun article trouvé</p>
                <p className="cp-empty-sub">Essayez d'autres filtres ou termes de recherche.</p>
              </div>
            ) : (
              CATEGORY_ORDER.map((cat) => {
                const items = grouped[cat];
                if (!items?.length) return null;

                return (
                  <section key={cat}>
                    {/* Section header */}
                    <div className="cp-sec-head">
                      <span className="cp-sec-icon">{CATEGORY_ICONS[cat]}</span>
                      <h2 className="cp-sec-title">{CATEGORY_LABELS[cat]}</h2>
                      <span className="cp-sec-count">
                        {String(items.length).padStart(2, "0")} article{items.length > 1 ? "s" : ""}
                      </span>
                      <div className="cp-sec-line" />
                    </div>

                    <div className="cp-grid">
                      {items.map((product) => {
                        const imgIndex   = activeImage[product.id] ?? 0;
                        const imgCount   = product.images.length;
                        const currentImg = product.images[imgIndex];
                        const chosenSize = selectedSize[product.id];
                        const inWishlist = wishlist.has(product.id);
                        const stockOk    = product.stock > 0;
                        const lowStock   = stockOk && product.stock <= 3;
                        const gBadge     = GENDER_BADGE[product.gender];

                        return (
                          <div key={product.id} className="pcard">

                            {/* ── Image ── */}
                            <div className="pcard-img-wrap">
                              {currentImg ? (
                                <img src={currentImg} alt={product.name} className="pcard-img" />
                              ) : (
                                <div className="pcard-img-empty">
                                  <Package size={32} strokeWidth={1} />
                                  <span>Aucune image</span>
                                </div>
                              )}

                              {/* gradient */}
                              <div className="pcard-img-grad" />

                              {/* stock */}
                              {!stockOk  && <span className="pcard-stock out">Épuisé</span>}
                              {lowStock  && <span className="pcard-stock low">Reste {product.stock}</span>}

                              {/* arrows */}
                              {imgCount > 1 && (
                                <>
                                  <button className="pcard-arr l" onClick={() => prevImage(product.id, imgCount)}>
                                    <ChevronLeft size={15} />
                                  </button>
                                  <button className="pcard-arr r" onClick={() => nextImage(product.id, imgCount)}>
                                    <ChevronRight size={15} />
                                  </button>
                                  <div className="pcard-dots">
                                    {product.images.map((_, idx) => (
                                      <div key={idx} className={`pcard-dot ${idx === imgIndex ? "on" : ""}`} />
                                    ))}
                                  </div>
                                </>
                              )}

                              {/* wishlist + quickview */}
                              <div className="pcard-actions">
                                <button
                                  className={`pcard-action-btn ${inWishlist ? "fav" : ""}`}
                                  onClick={() => toggleWishlist(product.id)}
                                  title={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
                                >
                                  <Heart
                                    size={15}
                                    fill={inWishlist ? "var(--gold)" : "none"}
                                    stroke={inWishlist ? "var(--gold)" : "currentColor"}
                                  />
                                </button>
                              </div>

                              {currentImg && (
                                <button
                                  className="pcard-qview"
                                  onClick={() => setLightbox({ product, index: imgIndex })}
                                >
                                  <Eye size={13} /> Aperçu
                                </button>
                              )}
                            </div>

                            {/* ── Body ── */}
                            <div className="pcard-body">

                              {/* meta: gender badge + color */}
                              <div className="pcard-meta">
                                {gBadge && (
                                  <span
                                    className="pcard-gender"
                                    style={{ color: gBadge.color, background: gBadge.bg }}
                                  >
                                    {gBadge.label}
                                  </span>
                                )}
                                {product.colorHex && (
                                  <div className="pcard-color-wrap">
                                    <span className="pcard-color-name">{product.color}</span>
                                    <div className="pcard-color-dot" style={{ background: product.colorHex }} />
                                  </div>
                                )}
                              </div>

                              {/* name */}
                              <h3 className="pcard-name">{product.name}</h3>

                              {/* price */}
                              <div className="pcard-price-row">
                                <span className="pcard-price">{product.price.toFixed(2)}</span>
                                <span className="pcard-currency">TND</span>
                              </div>

                              {/* description */}
                              {product.description && (
                                <p className="pcard-desc">{product.description}</p>
                              )}

                              <div className="pcard-divider" />

                              {/* sizes */}
                              {product.sizes.length > 0 && (
                                <div>
                                  <div className="pcard-sizes-head">
                                    <span className="pcard-sizes-label">Taille</span>
                                    {!chosenSize && (
                                      <span className="pcard-sizes-hint">Choisir</span>
                                    )}
                                  </div>
                                  <div className="pcard-sizes-row">
                                    {product.sizes.map((size) => (
                                      <button
                                        key={size}
                                        onClick={() =>
                                          setSelectedSize((prev) => ({ ...prev, [product.id]: size }))
                                        }
                                        className={`pcard-size ${chosenSize === size ? "on" : ""}`}
                                      >
                                        {size}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* CTA */}
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={addingToCart === product.id || !stockOk}
                                className={`pcard-cta ${!stockOk ? "oos" : ""}`}
                              >
                                {addingToCart === product.id ? (
                                  <><div className="spin" /> Ajout…</>
                                ) : !stockOk ? (
                                  <><Package size={15} /> Épuisé</>
                                ) : (
                                  <><ShoppingCart size={15} /> Ajouter au panier</>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })
            )}
          </main>
        </div>
      </div>
    </>
  );
}