"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import Navbar from "@/components/ClientNavbar";
import toast, { Toaster } from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────
// 🎬 REMPLACEZ CETTE URL PAR VOTRE LIEN VIDÉO (mp4/webm hébergé, Cloudinary,
// S3, Mux, etc.) — doit être un lien direct vers le fichier, pas une page
// YouTube/Vimeo. Gardez le fichier léger (<8Mo) et compressé pour le web.
// ─────────────────────────────────────────────────────────────────────────
const HERO_VIDEO_URL = "https://your-cdn.com/path/to/hero-video.mp4";
const HERO_POSTER = "/hero-poster.jpg"; // image affichée pendant le chargement / fallback mobile

// ─── Types ──────────────────────────────────────────────────────────────
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

// ─── Guest cart (localStorage) ─────────────────────────────────────────
const GUEST_KEY = "irnas_guest_cart";
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
  count(): number {
    return guestCart.get().reduce((s, i) => s + i.quantity, 0);
  },
  clear() { localStorage.removeItem(GUEST_KEY); },
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

const toastStyle = {
  background: "#0f1f33",
  color: "#ffffff",
  border: "1px solid #1a2a44",
  borderRadius: "16px",
  padding: "12px 20px",
};

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => (r.ok ? r.json() : []))
      .then((data: Product[]) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Respecte prefers-reduced-motion : coupe l'autoplay vidéo si demandé
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && videoRef.current) videoRef.current.pause();
  }, []);

  const syncGuestCart = async () => {
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
  };

  useEffect(() => { if (isSignedIn) syncGuestCart(); }, [isSignedIn]);

  const quickAdd = async (productId: number) => {
    if (!isSignedIn) {
      guestCart.add(productId, 1);
      toast.success("Ajouté au panier (invité)", { style: toastStyle, icon: "🛍️" });
      return;
    }
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
    } catch {
      toast.error("Erreur réseau", { style: toastStyle });
    }
  };

  // Images représentatives pour la grille catégories
  const findImage = (predicate: (p: Product) => boolean) =>
    products.find(predicate)?.images?.[0] ?? "/placeholder-category.jpg";

  const femmeImg = findImage(p => p.gender === "women");
  const hommeImg = findImage(p => p.gender === "men");
  const accessoireImg = findImage(p => p.category === "accessoire");
  const newArrivals = products.filter(p => p.isNew).slice(0, 8);
  const fallbackArrivals = newArrivals.length ? newArrivals : products.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Playfair+Display:ital@1&display=swap');
        .font-display { font-family: 'Anton', sans-serif; }
        .font-accent { font-family: 'Playfair Display', serif; font-style: italic; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      <Toaster position="bottom-right" toastOptions={{ style: toastStyle }} />

      <Navbar />

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* HERO — vidéo plein écran                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
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
        />
        {/* Voile de lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-[#0a1628]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/60 via-transparent to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-28 pt-32">
          <span className="text-[11px] uppercase tracking-[0.5em] text-[#c9a267] font-light mb-6">
            Collection Automne — Hiver 2026
          </span>
          <h1 className="font-display uppercase leading-[0.85] text-[15vw] sm:text-[10vw] lg:text-[7.5vw] tracking-tight">
            Sculpter <span className="font-accent normal-case text-[#c9a267]">l&apos;allure</span>
          </h1>
          <p className="mt-8 max-w-md text-sm text-[#8aabca] font-light leading-relaxed">
            Des pièces pensées comme une architecture du corps — coupe précise,
            matières nobles, fabrication soignée.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/client/catalog?gender=women"
              className="group flex items-center gap-3 px-8 py-4 bg-[#3b82f6] text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#2563eb] transition"
            >
              Collection Femme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/client/catalog?gender=men"
              className="group flex items-center gap-3 px-8 py-4 border border-white/30 text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:border-[#c9a267] hover:text-[#c9a267] transition"
            >
              Collection Homme
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-5 h-5 text-white/50" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MARQUEE                                                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="border-y border-[#1e3a5f] bg-[#0f1f33] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track w-max">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center text-xs uppercase tracking-[0.3em] font-light text-[#8aabca] mx-8">
              {item}
              <span className="ml-8 text-[#c9a267]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MANIFESTE                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#3b82f6] font-light">
            Notre approche
          </span>
          <h2 className="font-display uppercase text-4xl md:text-5xl leading-[0.95] mt-4">
            La rigueur <br />
            au service <br />
            du <span className="font-accent normal-case text-[#c9a267]">geste</span>
          </h2>
        </div>
        <p className="text-[#8aabca] text-base md:text-lg font-light leading-relaxed">
          IRNAS naît d&apos;une conviction simple : le vêtement doit tenir sur le corps
          comme une phrase bien construite — sans mot de trop. Chaque collection est
          développée en petites séries, loin des cycles de la fast fashion, pour laisser
          le temps à la coupe et à la matière de faire leur travail.
        </p>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* CATÉGORIES — grille bento                                       */}
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
      {/* NOUVEAUTÉS — scroll horizontal                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {fallbackArrivals.length > 0 && (
        <section className="pb-28">
          <div className="max-w-7xl mx-auto px-6 flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-[0.4em] text-[#3b82f6] font-light">
                Fraîchement arrivé
              </span>
              <h2 className="font-display uppercase text-3xl md:text-4xl mt-2">
                Nouveautés
              </h2>
            </div>
            <Link
              href="/client/catalog"
              className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8aabca] hover:text-[#3b82f6] transition"
            >
              Tout voir <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto px-6 max-w-7xl mx-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {fallbackArrivals.map(product => {
              const isOnSale = product.originalPrice && product.originalPrice > product.price;
              return (
                <div
                  key={product.id}
                  className="group relative flex-shrink-0 w-[260px] sm:w-[290px] snap-start bg-[#0f1f33] border border-[#1a2a44] rounded-3xl overflow-hidden hover:border-[#3b82f6]/40 transition"
                >
                  <Link href={`/client/catalog?category=${product.category}`} className="block relative h-[320px] bg-[#0a1628] overflow-hidden">
                    <Image
                      src={product.images[0] || "/placeholder-category.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                    />
                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-[#c9a267] text-[#0a1628] text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </Link>
                  <div className="p-5">
                    <h3 className="text-sm font-medium truncate">{product.name}</h3>
                    <p className="text-[11px] text-[#4a6a8a] mt-0.5 uppercase tracking-widest font-light">
                      {product.color} · {CATEGORY_LABELS[product.category] ?? product.category}
                    </p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-light">{product.price.toFixed(2)} TND</span>
                      {isOnSale && (
                        <span className="text-xs text-[#4a6a8a] line-through">
                          {product.originalPrice?.toFixed(2)} TND
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => quickAdd(product.id)}
                      disabled={product.stock <= 0}
                      className={`mt-4 w-full py-2.5 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium transition ${
                        product.stock > 0
                          ? "bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                          : "bg-[#1a2a44] text-[#4a6a8a] cursor-not-allowed"
                      }`}
                    >
                      {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FABRICATION — séquence réelle, numérotée à raison               */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#1a2a44]">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <span className="text-[11px] uppercase tracking-[0.4em] text-[#3b82f6] font-light">
            De l&apos;idée au vêtement
          </span>
          <h2 className="font-display uppercase text-3xl md:text-4xl mt-2 mb-14">
            Trois étapes, une pièce
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {CRAFT_STEPS.map((step, i) => (
              <div key={step.label} className="border-t border-[#c9a267]/40 pt-6">
                <span className="font-accent text-4xl text-[#c9a267]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium uppercase tracking-[0.15em] mt-4 mb-3">
                  {step.label}
                </h3>
                <p className="text-sm text-[#8aabca] font-light leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* NEWSLETTER                                                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#1a2a44] bg-[#0f1f33]">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display uppercase text-3xl md:text-4xl mb-4">
            Restez <span className="font-accent normal-case text-[#c9a267]">informé</span>
          </h2>
          <p className="text-sm text-[#8aabca] font-light mb-8">
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
              className="flex-1 bg-[#0a1628] border border-[#1e3a5f] rounded-full py-3.5 px-6 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/50 transition"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#3b82f6] text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#2563eb] transition"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                          */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#1a2a44] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
          </div>
          <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">© 2026 IRNAS — Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[10px] text-[#2a3f6a] tracking-widest font-light uppercase">
            <Link href="#" className="hover:text-[#3b82f6] transition">Mentions</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Confidentialité</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Category tile ──────────────────────────────────────────────────────
function CategoryTile({
  href, label, image, className = "", big = false,
}: { href: string; label: string; image: string; className?: string; big?: boolean }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-3xl border border-[#1a2a44] hover:border-[#c9a267]/50 transition ${className}`}
    >
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 flex items-center gap-2">
        <span className={`font-display uppercase tracking-tight ${big ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>
          {label}
        </span>
        <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
      </div>
    </Link>
  );
}