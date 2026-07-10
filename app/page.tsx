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

// ─── Constantes ────────────────────────────────────────────────────
const HERO_VIDEO_URL = "https://assets.mixkit.co/videos/52270/52270-720.mp4";
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

// ─── Toast — thème sombre ────────────────────────────────────────
const toastStyle = {
  background: "#0f1a2e",
  color: "#f3ece2",
  border: "1px solid #2a405a",
  borderRadius: "16px",
  padding: "12px 20px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
};

// ─── Reveal ──────────────────────────────────────────────────────
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

// ─── Signature : ligne "point de couture" ───────────────────────
function StitchLine({ className = "", color = "gold" }: { className?: string; color?: "gold" | "blue" }) {
  return (
    <div
      className={`stitch-line ${color === "blue" ? "stitch-line--blue" : ""} ${className}`}
      aria-hidden="true"
    />
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

  const findImage = (predicate: (p: Product) => boolean) =>
    products.find(predicate)?.images?.[0] ?? "/placeholder-category.jpg";

  const femmeImg = findImage(p => p.gender === "women");
  const hommeImg = findImage(p => p.gender === "men");
  const accessoireImg = findImage(p => p.category === "accessoire");
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const fallbackArrivals = newArrivals.length ? newArrivals : products.slice(0, 8);
  const lookbookImg = products[3]?.images?.[0] ?? products[0]?.images?.[0] ?? "/placeholder-category.jpg";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#d4af6a]/25 border-t-[#d4af6a] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#d4af6a] text-[10px] font-light tracking-[0.3em] animate-pulse">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#f3ece2] overflow-x-hidden bg-[#0a1120]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@500;700;800&family=Fraunces:ital,wght@1,400;1,500&family=Inter:wght@300;400;500&display=swap');
        .font-display { font-family: 'Bodoni Moda', serif; }
        .font-accent { font-family: 'Fraunces', serif; font-style: italic; }
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

        .stitch-line {
          height: 2px;
          width: 64px;
          background-image: repeating-linear-gradient(90deg, #d4af6a 0 7px, transparent 7px 14px);
          opacity: 0.75;
        }
        .stitch-line--blue {
          background-image: repeating-linear-gradient(90deg, #3b82f6 0 7px, transparent 7px 14px);
        }
      `}</style>

      <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />

      <Navbar />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO — vidéo externe, étalonnage sobre et professionnel        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.85) contrast(1.08) brightness(0.82)" }}
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
            style={{ backgroundImage: `url(${HERO_POSTER})`, filter: "saturate(0.85) contrast(1.08) brightness(0.82)" }}
          />
        )}

        {/* Vignette sobre — pas de teinte colorée dominante */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1120]/70 via-transparent to-[#0a1120]/50" />
        <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 180px 60px rgba(0,0,0,0.55)" }} />
        {/* Léger grain pour une texture éditoriale */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Lueur bleutée subtile en fond */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 20%, rgba(59,130,246,0.12), transparent 60%)" }} />

        {/* Contrôles vidéo */}
        {!videoFailed && (
          <div className="absolute top-28 right-6 z-10 flex gap-2">
            <button
              onClick={toggleVideoPlay}
              aria-label={videoPlaying ? "Mettre en pause" : "Lire la vidéo"}
              className="w-9 h-9 rounded-full border border-[#f3ece2]/25 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-[#d4af6a]/80 transition text-[#f3ece2]"
            >
              {videoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleVideoMute}
              aria-label={videoMuted ? "Activer le son" : "Couper le son"}
              className="w-9 h-9 rounded-full border border-[#f3ece2]/25 bg-black/40 backdrop-blur-sm flex items-center justify-center hover:border-[#d4af6a]/80 transition text-[#f3ece2]"
            >
              {videoMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-28 pt-32">
          <span className="hero-line text-[11px] uppercase tracking-[0.5em] text-[#d4af6a] font-light mb-6">
            Collection Automne — Hiver 2026
          </span>
         <h1 className="hero-line font-display uppercase leading-[0.85] text-[15vw] sm:text-[10vw] lg:text-[7.5vw] tracking-tight text-[#f3ece2]" style={{ animationDelay: "0.1s" }}>
  Sculpter <span className="font-accent normal-case text-[#1a365d]">l&apos;allure</span>
</h1>
          <StitchLine className="hero-line mt-6" />
          <p className="hero-line mt-6 max-w-md text-sm text-[#c9beb4] font-light leading-relaxed font-body" style={{ animationDelay: "0.2s" }}>
            Des pièces pensées comme une architecture du corps — coupe précise,
            matières nobles, fabrication soignée.
          </p>

          <div className="hero-line mt-10 flex flex-wrap gap-4" style={{ animationDelay: "0.3s" }}>
            <Link
              href="/client/catalog?gender=women"
              className="group flex items-center gap-3 px-8 py-4 bg-[#f3ece2] text-[#1e40af] text-xs uppercase tracking-[0.25em] font-medium rounded-full border border-[#1e40af] hover:bg-[#1e40af] hover:text-[#f3ece2] transition"
            >
              Collection Femme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/client/catalog?gender=men"
              className="group flex items-center gap-3 px-8 py-4 border border-[#f3ece2]/30 text-[#1e40af] text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:border-[#1e40af] hover:text-[#1e40af] transition"
            >
              Collection Homme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-5 h-5 text-[#f3ece2]/40" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MARQUEE                                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="border-y border-[#2a405a] bg-[#0f1a2e] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center text-xs uppercase tracking-[0.3em] font-light text-[#a89a92] mx-8">
              {item}
              <span className="ml-8 text-[#3b82f6]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* BARRE DE CONFIANCE                                            */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {TRUST_ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 80} className="flex flex-col items-start gap-3">
            <item.icon className="w-5 h-5 text-[#d4af6a]" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#f3ece2]">{item.label}</p>
              <p className="text-xs text-[#a89a92] font-light mt-0.5">{item.sub}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MANIFESTE                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#d4af6a] font-light">
            Notre approche
          </span>
          <h2 className="font-display uppercase text-4xl md:text-5xl leading-[0.95] mt-4 text-[#f3ece2]">
            La rigueur <br />
            au service <br />
            du <span className="font-accent normal-case text-[#1e40af]">geste</span>
          </h2>
          <StitchLine className="mt-6" />
        </Reveal>
        <Reveal delay={150}>
          <p className="text-[#a89a92] text-base md:text-lg font-light leading-relaxed font-body">
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
              <span className="text-[11px] uppercase tracking-[0.4em] text-[#d4af6a] font-light">
                Fraîchement arrivé
              </span>
              <h2 className="font-display uppercase text-3xl md:text-4xl mt-2 text-[#f3ece2]">
                Nouveautés
              </h2>
            </Reveal>
            <Link
              href="/client/catalog"
              className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#a89a92] hover:text-[#3b82f6] transition"
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
                  className="group relative flex-shrink-0 w-[260px] sm:w-[290px] snap-start bg-[#0f1a2e] border border-[#2a405a] rounded-3xl overflow-hidden hover:border-[#d4af6a]/50 transition shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
                >
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 transition ${isWishlisted ? "fill-[#3b82f6] text-[#3b82f6]" : "text-[#f3ece2]/70"}`}
                    />
                  </button>

                  <Link href={`/client/catalog?category=${product.category}`} className="block relative h-[320px] bg-[#111c30] overflow-hidden">
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
                      <span className="absolute top-4 left-4 bg-[#d4af6a] text-[#0a1120] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </Link>
                  <div className="p-5">
                    <h3 className="text-sm font-medium text-[#f3ece2] truncate">{product.name}</h3>
                    <p className="text-[11px] text-[#a89a92] mt-0.5 uppercase tracking-widest font-light">
                      {product.color} · {CATEGORY_LABELS[product.category] ?? product.category}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-light text-[#f3ece2]">{product.price.toFixed(2)} TND</span>
                      {isOnSale && (
                        <span className="text-xs text-[#7d716a] line-through">
                          {product.originalPrice?.toFixed(2)} TND
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => quickAdd(product.id)}
                      disabled={product.stock <= 0}
                      className={`mt-4 w-full py-2.5 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium transition ${
                        justAdded
                          ? "bg-[#d4af6a] text-[#0a1120]"
                          : product.stock > 0
                          ? "bg-[#2563eb] text-[#fbf3ee] hover:bg-[#1d4ed8]"
                          : "bg-[#2a405a] text-[#7d716a] cursor-not-allowed"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/20 to-transparent" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 10%, rgba(59,130,246,0.15), transparent 55%)" }} />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-20">
          <Reveal>
            <p className="font-accent normal-case text-2xl md:text-4xl max-w-xl leading-snug text-[#f3ece2]">
              « Une pièce bien coupée ne se remarque pas — elle se ressent. »
            </p>
            <Link
              href="/client/catalog"
              className="mt-8 inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#d4af6a] hover:text-[#3b82f6] transition group"
            >
              Voir le lookbook complet
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CHIFFRES                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#0f1a2e] text-[#f3ece2]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid sm:grid-cols-3 gap-12">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="text-center sm:text-left">
              <p className="font-display text-5xl md:text-6xl">
                {stat.value}<span className="font-accent normal-case text-3xl md:text-4xl text-[#1e40af]">{stat.suffix}</span>
              </p>
              <p className="mt-3 text-sm text-[#a89a92] font-light font-body max-w-[220px] mx-auto sm:mx-0">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FABRICATION                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#2a405a]">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <Reveal>
            <span className="text-[11px] uppercase tracking-[0.4em] text-[#d4af6a] font-light">
              De l&apos;idée au vêtement
            </span>
            <h2 className="font-display uppercase text-3xl md:text-4xl mt-2 mb-14 text-[#f3ece2]">
              Trois étapes, une pièce
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-8">
            {CRAFT_STEPS.map((step, i) => (
              <Reveal key={step.label} delay={i * 120} className="pt-6">
                <StitchLine color={i === 1 ? "blue" : "gold"} className="mb-5 w-full" />
                <span className="font-accent text-4xl text-[#1e40af]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium uppercase tracking-[0.15em] mt-4 mb-3 text-[#f3ece2]">
                  {step.label}
                </h3>
                <p className="text-sm text-[#a89a92] font-light leading-relaxed font-body">
                  {step.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* NEWSLETTER                                                    */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#2a405a] bg-[#0f1a2e]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <Reveal>
            <h2 className="font-display uppercase text-3xl md:text-4xl mb-4 text-[#f3ece2]">
              Restez <span className="font-accent normal-case text-[#1e40af]">informé</span>
            </h2>
            <p className="text-sm text-[#a89a92] font-light mb-8 font-body">
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
                className="flex-1 bg-[#111c30] border border-[#2a405a] rounded-full py-3.5 px-6 text-sm text-[#f3ece2] placeholder:text-[#7d716a] focus:outline-none focus:border-[#3b82f6]/60 transition"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#2563eb] text-[#fbf3ee] text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#1d4ed8] transition"
              >
                S&apos;inscrire
              </button>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#2a405a] pt-16 pb-10 px-6 bg-[#0a1120]">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2a405a]">
          <div>
            <span className="text-lg font-light tracking-[0.2em] text-[#f3ece2]">IRNAS</span>
            <p className="mt-4 text-xs text-[#a89a92] font-light leading-relaxed max-w-[220px] font-body">
              Fabrication en petites séries, pensée pour durer bien au-delà d&apos;une saison.
            </p>
          </div>
          <FooterCol title="Boutique" links={["Femme", "Homme", "Accessoires", "Nouveautés"]} />
          <FooterCol title="Aide" links={["Livraison & retours", "Guide des tailles", "Suivi de commande", "Contact"]} />
          <FooterCol title="Maison" links={["Notre histoire", "Savoir-faire", "Presse", "Carrières"]} />
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-[#7d716a] tracking-widest font-light">© 2020 IRNAS — Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[10px] text-[#7d716a] tracking-widest font-light uppercase">
            
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Footer column ────────────────────────────────────────────────
function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-[11px] uppercase tracking-[0.3em] text-[#7d716a] font-light mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link}>
            <Link href="#" className="text-sm text-[#a89a92] hover:text-[#f3ece2] transition font-body">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Category tile ──────────────────────────────────────────────
function CategoryTile({
  href, label, image, className = "", big = false,
}: { href: string; label: string; image: string; className?: string; big?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-[#2a405a] hover:border-[#d4af6a]/60 transition bg-[#0f1a2e] ${className}`}
    >
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-[#0a1120]/15 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 flex items-center gap-2">
        <span className={`font-display uppercase tracking-tight text-[#f3ece2] ${big ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
          {label}
        </span>
        <ArrowUpRight className="w-5 h-5 text-[#d4af6a] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </div>
    </Link>
  );
}