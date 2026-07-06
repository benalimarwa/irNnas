"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Truck,
  Volume2,
  VolumeX,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";
import toast, { Toaster } from "react-hot-toast";

// ─── Constantes (inchangées) ──────────────────────────────────────────
const HERO_VIDEO_URL = "/video/pp.mp4";
const HERO_POSTER = "/hero-poster.jpg";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  gender: string;
  color: string;
  isNew?: boolean;
  stock: number;
};

type GuestItem = { productId: number; quantity: number };

const GUEST_KEY = "irnas_guest_cart";
const WISHLIST_KEY = "irnas_wishlist";

const guestCart = {
  get(): GuestItem[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); } catch { return []; }
  },
  add(productId: number, qty = 1) {
    const items = guestCart.get();
    const found = items.find(i => i.productId === productId);
    if (found) found.quantity += qty;
    else items.push({ productId, quantity: qty });
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  },
  clear() { localStorage.removeItem(GUEST_KEY); },
};

const wishlist = {
  get(): number[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"); } catch { return []; }
  },
  toggle(productId: number): number[] {
    const items = wishlist.get();
    const idx = items.indexOf(productId);
    if (idx >= 0) items.splice(idx, 1);
    else items.push(productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    return items;
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  pantalon: "Pantalon", pull: "Pull", veste: "Veste", chemise: "Chemise",
  accessoire: "Accessoire", robe: "Robe", jupe: "Jupe", "t-shirt": "T-shirt",
  chaussure: "Chaussure", manteau: "Manteau",
};

const MARQUEE_ITEMS = [
  "COLLECTION AUTOMNE — HIVER 2026",
  "LIVRAISON EN 48H",
  "PIÈCES EN ÉDITION LIMITÉE",
  "FAÇONNÉ AVEC SOIN",
];

const CRAFT_STEPS = [
  { label: "Coupe", text: "Chaque patron est tracé à la main avant d'être ajusté sur mesure, pièce par pièce." },
  { label: "Drapé", text: "Le tissu est travaillé à plat puis en volume pour trouver sa juste tombée sur le corps." },
  { label: "Finition", text: "Ourlets, boutons, doublures : le détail final qui distingue une pièce IRNAS." },
];

const TRUST_ITEMS = [
  { icon: Truck, label: "Livraison 48h", sub: "Partout en Tunisie" },
  { icon: RefreshCw, label: "Retours sous 14 jours", sub: "Simple et gratuit" },
  { icon: ShieldCheck, label: "Paiement sécurisé", sub: "Carte & à la livraison" },
  { icon: Sparkles, label: "Séries limitées", sub: "Petites quantités, sans réassort" },
];

const STATS = [
  { value: "12", suffix: "ans", label: "de savoir-faire artisanal" },
  { value: "48", suffix: "h", label: "de livraison en Tunisie" },
  { value: "500", suffix: "+", label: "pièces façonnées à la main chaque saison" },
];

// ─── Toast style adapté au thème clair ──────────────────────────────
const toastStyle = {
  background: "#ffffff",
  color: "#1a1a1a",
  border: "1px solid #e0dcd6",
  borderRadius: "16px",
  padding: "12px 20px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

// ─── Reveal (inchangé) ───────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ─── Chargement des produits ──────────────────────────────────────
  useEffect(() => {
    fetch("/api/products")
      .then(r => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        const normalized: Product[] = data.map(p => ({
          ...p,
          category:
            p.category && typeof p.category === "object"
              ? p.category.name
              : p.category,
        }));
        setProducts(normalized);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setWishlistIds(wishlist.get()); }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && videoRef.current) {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  }, []);

  const syncGuestCart = useCallback(async () => {
    const items = guestCart.get();
    if (items.length === 0) return;
    await Promise.all(
      items.map(item =>
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      )
    );
    guestCart.clear();
  }, []);

  useEffect(() => { if (isSignedIn) syncGuestCart(); }, [isSignedIn, syncGuestCart]);

  // ─── Actions ──────────────────────────────────────────────────────
  const quickAdd = async (productId: number) => {
    if (!isSignedIn) {
      guestCart.add(productId, 1);
      toast.success("Ajouté au panier (invité)", { style: toastStyle, icon: "🛍️" });
    } else {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        toast[res.ok ? "success" : "error"](
          res.ok ? "Ajouté au panier" : "Erreur lors de l'ajout",
          { style: toastStyle }
        );
        if (!res.ok) return;
      } catch {
        toast.error("Erreur réseau", { style: toastStyle });
        return;
      }
    }
    setAddedIds(prev => [...prev, productId]);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== productId)), 1800);
  };

  const toggleWishlist = (productId: number) => {
    const updated = wishlist.toggle(productId);
    setWishlistIds(updated);
    toast(updated.includes(productId) ? "Ajouté aux favoris" : "Retiré des favoris", {
      style: toastStyle,
      icon: updated.includes(productId) ? "♥" : "♡",
    });
  };

  const toggleVideoPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (videoPlaying) v.pause(); else v.play().catch(() => {});
    setVideoPlaying(!videoPlaying);
  };

  const toggleVideoMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setVideoMuted(v.muted);
  };

  // ─── Helpers images ──────────────────────────────────────────────
  const findImage = (predicate: (p: Product) => boolean) =>
    products.find(predicate)?.images?.[0] ?? "/placeholder-category.jpg";

  const femmeImg = findImage(p => p.gender === "women");
  const hommeImg = findImage(p => p.gender === "men");
  const accessoireImg = findImage(p => p.category === "accessoire");
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const fallbackArrivals = newArrivals.length ? newArrivals : products.slice(0, 8);
  const lookbookImg = products[3]?.images?.[0] ?? products[0]?.images?.[0] ?? "/placeholder-category.jpg";

  // ─── Loader ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#b89a6b]/30 border-t-[#b89a6b] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#b89a6b] text-[10px] font-light tracking-[0.3em] animate-pulse">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL – TOUTES LES COULEURS ONT ÉTÉ MODIFIÉES
  // ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-[#1a1a1a] overflow-x-hidden bg-[#faf8f6]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:ital@0;1&family=Inter:wght@300;400;500&display=swap');
        .font-display { font-family: 'Anton', sans-serif; }
        .font-accent { font-family: 'Playfair Display', serif; font-style: italic; }
        .font-body { font-family: 'Inter', sans-serif; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 28s linear infinite; }
        @keyframes heroIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .hero-line { animation: heroIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
          .hero-line { animation: none; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />

      <Navbar />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO — vidéo (fond clair, overlays adaptés)                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO_URL}
            poster={HERO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_POSTER})` }}
          />
        )}

        {/* Overlays clairs pour lisibilité sur fond clair */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f6] via-[#faf8f6]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#faf8f6]/70 via-transparent to-[#faf8f6]/20" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 20%, rgba(184,154,107,0.08), rgba(250,248,246,0.5))" }} />

        {/* Contrôles vidéo (sur fond clair, bordures foncées) */}
        {!videoFailed && (
          <div className="absolute top-28 right-6 z-10 flex gap-2">
            <button
              onClick={toggleVideoPlay}
              aria-label={videoPlaying ? "Mettre en pause" : "Lire la vidéo"}
              className="w-9 h-9 rounded-full border border-[#1a1a1a]/20 bg-white/60 backdrop-blur-sm flex items-center justify-center hover:border-[#1a1a1a]/60 transition text-[#1a1a1a]"
            >
              {videoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleVideoMute}
              aria-label={videoMuted ? "Activer le son" : "Couper le son"}
              className="w-9 h-9 rounded-full border border-[#1a1a1a]/20 bg-white/60 backdrop-blur-sm flex items-center justify-center hover:border-[#1a1a1a]/60 transition text-[#1a1a1a]"
            >
              {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-28 pt-32">
          <span className="hero-line text-[11px] uppercase tracking-[0.5em] text-[#b89a6b] font-light mb-6">
            Collection Automne — Hiver 2026
          </span>
          <h1 className="hero-line font-display uppercase leading-[0.85] text-[15vw] sm:text-[10vw] lg:text-[7.5vw] tracking-tight text-[#1a1a1a]" style={{ animationDelay: "0.1s" }}>
            Sculpter <span className="font-accent normal-case text-[#b89a6b]">l&apos;allure</span>
          </h1>
          <p className="hero-line mt-8 max-w-md text-sm text-[#5a5a5a] font-light leading-relaxed font-body" style={{ animationDelay: "0.2s" }}>
            Des pièces pensées comme une architecture du corps — coupe précise,
            matières nobles, fabrication soignée.
          </p>

          <div className="hero-line mt-10 flex flex-wrap gap-4" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/client/catalog?gender=women"
              className="group flex items-center gap-3 px-8 py-4 bg-[#1e3a5f] text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#162b47] transition"
            >
              Collection Femme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/client/catalog?gender=men"
              className="group flex items-center gap-3 px-8 py-4 border border-[#1a1a1a]/30 text-[#1a1a1a] text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:border-[#b89a6b] hover:text-[#b89a6b] transition"
            >
              Collection Homme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-5 h-5 text-[#1a1a1a]/40" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MARQUEE (fond clair)                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="border-y border-[#e0dcd6] bg-[#f0ede8] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center text-xs uppercase tracking-[0.3em] font-light text-[#5a5a5a] mx-8">
              {item}
              <span className="ml-8 text-[#b89a6b]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BARRE DE CONFIANCE (fond clair)                               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {TRUST_ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 80} className="flex flex-col items-start gap-3">
            <item.icon className="w-5 h-5 text-[#b89a6b]" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#1a1a1a]">{item.label}</p>
              <p className="text-xs text-[#5a5a5a] font-light mt-0.5">{item.sub}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MANIFESTE                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#b89a6b] font-light">
            Notre approche
          </span>
          <h2 className="font-display uppercase text-4xl md:text-5xl leading-[0.95] mt-4 text-[#1a1a1a]">
            La rigueur <br />
            au service <br />
            du <span className="font-accent normal-case text-[#b89a6b]">geste</span>
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-[#5a5a5a] text-base md:text-lg font-light leading-relaxed font-body">
            IRNAS naît d&apos;une conviction simple : le vêtement doit tenir sur le corps
            comme une phrase bien construite — sans mot de trop. Chaque collection est
            développée en petites séries, loin des cycles de la fast fashion, pour laisser
            le temps à la coupe et à la matière de faire leur travail.
          </p>
        </Reveal>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CATÉGORIES — grille bento                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-4 h-[640px] lg:h-[520px]">
          <CategoryTile
            href="/client/catalog?gender=women"
            label="Femme"
            image={femmeImg}
            className="col-span-2 row-span-2"
            big
          />
          <CategoryTile
            href="/client/catalog?gender=men"
            label="Homme"
            image={hommeImg}
            className="col-span-2 lg:col-span-1 row-span-1"
          />
          <CategoryTile
            href="/client/catalog?category=accessoire"
            label="Accessoires"
            image={accessoireImg}
            className="col-span-1 row-span-1"
          />
          <CategoryTile
            href="/client/catalog"
            label="Toute la collection"
            image={products[0]?.images?.[0] ?? "/placeholder-category.jpg"}
            className="col-span-1 row-span-1"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* NOUVEAUTÉS — scroll horizontal                                 */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {fallbackArrivals.length > 0 && (
        <section className="pb-28">
          <div className="max-w-7xl mx-auto px-6 flex items-end justify-between mb-8">
            <Reveal>
              <span className="text-[11px] uppercase tracking-[0.4em] text-[#b89a6b] font-light">
                Fraîchement arrivé
              </span>
              <h2 className="font-display uppercase text-3xl md:text-4xl mt-2 text-[#1a1a1a]">
                Nouveautés
              </h2>
            </Reveal>
            <Link
              href="/client/catalog"
              className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#5a5a5a] hover:text-[#1e3a5f] transition"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto px-6 max-w-7xl mx-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {fallbackArrivals.map(product => {
              const isOnSale = product.originalPrice && product.originalPrice > product.price;
              const isWishlisted = wishlistIds.includes(product.id);
              const justAdded = addedIds.includes(product.id);
              const secondImage = product.images[1] ?? product.images[0];
              return (
                <div
                  key={product.id}
                  className="group relative flex-shrink-0 w-[260px] sm:w-[290px] snap-start bg-white border border-[#e0dcd6] rounded-3xl overflow-hidden hover:border-[#b89a6b]/60 transition shadow-sm hover:shadow-md"
                >
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition shadow-sm"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition ${isWishlisted ? "fill-[#b89a6b] text-[#b89a6b]" : "text-[#1a1a1a]/60"}`}
                    />
                  </button>

                  <Link href={`/client/catalog?category=${product.category}`} className="block relative h-[320px] bg-[#f5f2ed] overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder-category.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6 transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <Image
                      src={secondImage || "/placeholder-category.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-[#b89a6b] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </Link>
                  <div className="p-5">
                    <h3 className="text-sm font-medium text-[#1a1a1a] truncate">{product.name}</h3>
                    <p className="text-[11px] text-[#5a5a5a] mt-0.5 uppercase tracking-widest font-light">
                      {product.color} · {CATEGORY_LABELS[product.category] ?? product.category}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-light text-[#1a1a1a]">{product.price.toFixed(2)} TND</span>
                      {isOnSale && (
                        <span className="text-xs text-[#5a5a5a] line-through">
                          {product.originalPrice?.toFixed(2)} TND
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => quickAdd(product.id)}
                      disabled={product.stock <= 0}
                      className={`mt-4 w-full py-2.5 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium transition ${
                        justAdded
                          ? "bg-[#b89a6b] text-white"
                          : product.stock > 0
                          ? "bg-[#1e3a5f] text-white hover:bg-[#162b47]"
                          : "bg-[#e0dcd6] text-[#5a5a5a] cursor-not-allowed"
                      }`}
                    >
                      {justAdded ? "Ajouté ✓" : product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* LOOKBOOK — plein cadre                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[85vh] min-h-[520px] w-full overflow-hidden">
        <Image
          src={lookbookImg}
          alt="Lookbook IRNAS"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f6] via-[#faf8f6]/10 to-transparent" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-20">
          <Reveal>
            <p className="font-accent normal-case text-2xl md:text-4xl max-w-xl leading-snug text-[#1a1a1a]">
              « Une pièce bien coupée ne se remarque pas — elle se ressent. »
            </p>
            <Link
              href="/client/catalog"
              className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#b89a6b] hover:text-[#1a1a1a] transition group"
            >
              Voir le lookbook complet
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CHIFFRES (fond clair, texte foncé)                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0ede8] text-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid sm:grid-cols-3 gap-12">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="text-center sm:text-left">
              <p className="font-display text-5xl md:text-6xl">
                {stat.value}<span className="font-accent normal-case text-3xl md:text-4xl text-[#b89a6b]">{stat.suffix}</span>
              </p>
              <p className="mt-3 text-sm text-[#5a5a5a] font-light font-body max-w-[220px] mx-auto sm:mx-0">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FABRICATION                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#e0dcd6]">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <Reveal>
            <span className="text-[11px] uppercase tracking-[0.4em] text-[#b89a6b] font-light">
              De l&apos;idée au vêtement
            </span>
            <h2 className="font-display uppercase text-3xl md:text-4xl mt-2 mb-14 text-[#1a1a1a]">
              Trois étapes, une pièce
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {CRAFT_STEPS.map((step, i) => (
              <Reveal key={step.label} delay={i * 120} className="border-t border-[#b89a6b]/30 pt-6">
                <span className="font-accent text-4xl text-[#b89a6b]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium uppercase tracking-[0.15em] mt-4 mb-3 text-[#1a1a1a]">
                  {step.label}
                </h3>
                <p className="text-sm text-[#5a5a5a] font-light leading-relaxed font-body">
                  {step.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* NEWSLETTER (fond clair)                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#e0dcd6] bg-[#f0ede8]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <Reveal>
            <h2 className="font-display uppercase text-3xl md:text-4xl mb-4 text-[#1a1a1a]">
              Restez <span className="font-accent normal-case text-[#b89a6b]">informé</span>
            </h2>
            <p className="text-sm text-[#5a5a5a] font-light mb-8 font-body">
              Accès prioritaire aux nouvelles collections et aux ventes privées.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault();
                toast.success("Merci pour votre inscription", { style: toastStyle });
                (e.target as HTMLFormElement).reset();
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Votre email"
                className="flex-1 bg-white border border-[#e0dcd6] rounded-full py-3.5 px-6 text-sm text-[#1a1a1a] placeholder:text-[#5a5a5a] focus:outline-none focus:border-[#b89a6b]/50 transition"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#1e3a5f] text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#162b47] transition"
              >
                S&apos;inscrire
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER (clair)                                                */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#e0dcd6] pt-16 pb-10 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#e0dcd6]">
          <div>
            <span className="text-lg font-light tracking-[0.2em] text-[#1a1a1a]">IRNAS</span>
            <p className="mt-4 text-xs text-[#5a5a5a] font-light leading-relaxed max-w-[220px] font-body">
              Fabrication en petites séries, pensée pour durer bien au-delà d&apos;une saison.
            </p>
          </div>
          <FooterCol title="Boutique" links={["Femme", "Homme", "Accessoires", "Nouveautés"]} />
          <FooterCol title="Aide" links={["Livraison & retours", "Guide des tailles", "Suivi de commande", "Contact"]} />
          <FooterCol title="Maison" links={["Notre histoire", "Savoir-faire", "Presse", "Carrières"]} />
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#5a5a5a] tracking-widest font-light">© 2020 IRNAS — Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[10px] text-[#5a5a5a] tracking-widest font-light uppercase">
            <Link href="#" className="hover:text-[#b89a6b] transition">Mentions légales</Link>
            <Link href="#" className="hover:text-[#b89a6b] transition">Confidentialité</Link>
            <Link href="#" className="hover:text-[#b89a6b] transition">CGV</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Footer column (adapté au clair) ────────────────────────────────
function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-[#5a5a5a] font-light mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link}>
            <Link href="#" className="text-sm text-[#5a5a5a] hover:text-[#1a1a1a] transition font-body">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Category tile (fond clair) ──────────────────────────────────────
function CategoryTile({
  href, label, image, className = "", big = false,
}: { href: string; label: string; image: string; className?: string; big?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-[#e0dcd6] hover:border-[#b89a6b]/70 transition bg-[#f5f2ed] ${className}`}
    >
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f6] via-[#faf8f6]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 flex items-center gap-2">
        <span className={`font-display uppercase tracking-tight text-[#1a1a1a] ${big ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
          {label}
        </span>
        <ArrowUpRight className="w-5 h-5 text-[#1a1a1a] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </div>
    </Link>
  );
}