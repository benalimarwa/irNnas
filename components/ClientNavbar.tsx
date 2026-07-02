'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  ShoppingCart, Heart, ChevronDown, X, ChevronRight, ChevronLeft,
  Home, Package, Receipt, Sun, Moon, Menu, Tag,
} from "lucide-react";

type CategoryOption = { value: string; label: string };
type ProductLite = { category: string; gender: string };

// ─── Labels (garder synchro avec la page catalogue) ─────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  pantalon: "Pantalon",
  pull: "Pull",
  veste: "Veste",
  chemise: "Chemise",
  accessoire: "Accessoire",
  robe: "Robe",
  jupe: "Jupe",
  "t-shirt": "T-shirt",
  chaussure: "Chaussure",
  manteau: "Manteau",
};

const GENDER_LABELS: Record<string, string> = {
  homme: "Homme",
  femme: "Femme",
};

const MENU_LINKS = [
  { label: "Accueil",    href: "/client",         icon: Home },
  { label: "Favoris",    href: "/client/favoris", icon: Heart },
  { label: "Collection", href: "/client/catalog", icon: Package },
  { label: "Commandes",  href: "/client/orders",  icon: Receipt },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();

  const [cartCount,    setCartCount]    = useState(0);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [isDark,       setIsDark]       = useState(true);

  // Catégories / Genres (navigation à deux niveaux)
  const [products,      setProducts]      = useState<ProductLite[]>([]);
  const [catMenuOpen,   setCatMenuOpen]   = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // desktop: catégorie en cours de survol/click
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileActiveCat, setMobileActiveCat] = useState<string | null>(null); // mobile: catégorie ouverte dans l'accordéon

  const catMenuRef = useRef<HTMLDivElement>(null);

  // Cart count
  useEffect(() => {
    fetch("/api/cart")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.items) setCartCount(d.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0));
      })
      .catch(() => {});
  }, []);

  // Charger les produits (pour dériver catégories + genres disponibles par catégorie)
  useEffect(() => {
    fetch("/api/products")
      .then(r => r.ok ? r.json() : [])
      .then((data: ProductLite[]) => setProducts(data))
      .catch(() => {});
  }, []);

  const categoryOptions: CategoryOption[] = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    return cats.map(c => ({ value: c, label: CATEGORY_LABELS[c] ?? c }));
  }, [products]);

  // Genres disponibles pour la catégorie actuellement ouverte
  const gendersForActiveCategory: CategoryOption[] = useMemo(() => {
    if (!activeCategory) return [];
    const gens = Array.from(
      new Set(products.filter(p => p.category === activeCategory).map(p => p.gender))
    ).filter(Boolean);
    return gens.map(g => ({ value: g, label: GENDER_LABELS[g] ?? g }));
  }, [products, activeCategory]);

  const gendersForMobileActiveCategory: CategoryOption[] = useMemo(() => {
    if (!mobileActiveCat) return [];
    const gens = Array.from(
      new Set(products.filter(p => p.category === mobileActiveCat).map(p => p.gender))
    ).filter(Boolean);
    return gens.map(g => ({ value: g, label: GENDER_LABELS[g] ?? g }));
  }, [products, mobileActiveCat]);

  // Theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark  = saved !== "light";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setCatMenuOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const handleCartClick = () => {
    router.push("/client/panier");
  };

  // Étape 1 (desktop) : clic sur une catégorie → affiche les genres
  const openCategoryGenders = (value: string) => {
    setActiveCategory(value);
  };

  const backToCategories = () => {
    setActiveCategory(null);
  };

  // Étape 2 (desktop) : clic sur un genre → redirige avec les deux filtres
  const goToCategoryGender = (category: string, gender: string) => {
    setCatMenuOpen(false);
    setActiveCategory(null);
    router.push(`/client/catalog?category=${encodeURIComponent(category)}&gender=${encodeURIComponent(gender)}`);
  };

  // Voir toute la catégorie sans filtre de genre
  const goToCategoryOnly = (category: string) => {
    setCatMenuOpen(false);
    setActiveCategory(null);
    router.push(`/client/catalog?category=${encodeURIComponent(category)}`);
  };

  // Mobile : mêmes actions
  const toggleMobileCategory = (value: string) => {
    setMobileActiveCat(prev => (prev === value ? null : value));
  };

  const goToCategoryGenderMobile = (category: string, gender: string) => {
    setMobileCatOpen(false);
    setMobileActiveCat(null);
    setMobileOpen(false);
    router.push(`/client/catalog?category=${encodeURIComponent(category)}&gender=${encodeURIComponent(gender)}`);
  };

  const goToCategoryOnlyMobile = (category: string) => {
    setMobileCatOpen(false);
    setMobileActiveCat(null);
    setMobileOpen(false);
    router.push(`/client/catalog?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
     <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#1e3a5f]">
  <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">

    {/* ── Colonne gauche : burger + logo ─────────────────────────── */}
    <div className="flex items-center gap-4">
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden text-white hover:text-[#3b82f6] transition flex-shrink-0"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <Link href="/client" className="group flex items-center gap-2 flex-shrink-0">
        <Image
          src="/llogo.png"
          alt="IRNAS"
          width={140}
          height={50}
          className="object-contain h-10 w-auto transition-transform duration-300 group-hover:scale-105"
          priority
        />
        <span className="text-2xl md:text-3xl font-light tracking-[0.2em] text-white group-hover:text-[#3b82f6] transition duration-500 hidden sm:inline">
          IRNAS
        </span>
       
      </Link>
    </div>

    {/* ── Colonne centrale : nav (réellement centrée sur toute la largeur) ── */}
    <nav className="hidden lg:flex items-center justify-center gap-1 min-w-0">
      {MENU_LINKS.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] font-light border-b transition pb-0.5 whitespace-nowrap ${
            isActive(href)
              ? "text-[#3b82f6] border-[#3b82f6]/40"
              : "border-transparent text-[#8aabca] hover:text-[#3b82f6] hover:border-[#3b82f6]/40"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}

      {categoryOptions.length > 0 && (
        <div className="relative" ref={catMenuRef}>
          <button
            onClick={() => { setCatMenuOpen(v => !v); setActiveCategory(null); }}
            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.2em] font-light border-b transition pb-0.5 whitespace-nowrap ${
              catMenuOpen
                ? "text-[#3b82f6] border-[#3b82f6]/40"
                : "border-transparent text-[#8aabca] hover:text-[#3b82f6] hover:border-[#3b82f6]/40"
            }`}
          >
            <Tag className="w-4 h-4" />
            Catégories
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${catMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {/* ... dropdown inchangé ... */}
        </div>
      )}
    </nav>

    {/* ── Colonne droite : actions ───────────────────────────────── */}
    <div className="flex items-center gap-3 justify-end min-w-0">
      <div className="relative hidden xl:block w-44 2xl:w-52">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#0f1f33] border border-[#1e3a5f] rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/50 transition"
        />
        <svg className="w-4 h-4 absolute left-3 top-2.5 text-[#4a6a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <button onClick={toggleDark} className="p-2 text-white/70 hover:text-[#3b82f6] transition flex-shrink-0" aria-label="Thème">
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <button onClick={handleCartClick} className="relative text-white hover:text-[#3b82f6] transition flex-shrink-0" aria-label="Panier">
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#3b82f6] text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>

      <Link
        href="/client/profile"
        className="hidden xl:flex items-center gap-2 pl-3 pr-4 py-1.5 bg-[#0f1f33] border border-[#1e3a5f] hover:border-[#3b82f6]/40 rounded-full transition text-sm font-light text-white/80 flex-shrink-0 whitespace-nowrap"
      >
        Mon profil
      </Link>
    </div>
  </div>
</header>
      {/* ── DRAWER MOBILE ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />

          <div className="relative w-[78%] max-w-xs bg-[#0a1628] border-r border-[#1e3a5f] flex flex-col h-full shadow-2xl">

            {/* Search */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1e3a5f]">
              <svg className="w-5 h-5 text-[#4a6a8a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4a6a8a] outline-none"
              />
            </div>

            {/* Profil */}
            <Link
              href="/client/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mx-4 mt-4 p-4 bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl hover:border-[#3b82f6]/40 transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div>
                <p className="font-medium text-sm text-white">Mon profil</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#4a6a8a] ml-auto" />
            </Link>

            {/* Links + Catégories */}
            <ul className="flex-1 overflow-y-auto mt-4 divide-y divide-[#1e3a5f]">
              {MENU_LINKS.map(({ label, href, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-4 px-6 py-4 text-sm font-light uppercase tracking-[0.15em] transition ${
                      isActive(href)
                        ? "text-[#3b82f6] bg-[#3b82f6]/5"
                        : "text-[#8aabca] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                </li>
              ))}

              {/* Section catégories (accordéon à deux niveaux) */}
              {categoryOptions.length > 0 && (
                <li>
                  <button
                    onClick={() => setMobileCatOpen(v => !v)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-sm font-light uppercase tracking-[0.15em] text-[#8aabca] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5 transition"
                  >
                    <span className="flex items-center gap-4">
                      <Tag className="w-5 h-5" />
                      Catégories
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                  </button>

                  {mobileCatOpen && (
                    <ul className="bg-[#0f1f33]">
                      {categoryOptions.map(cat => (
                        <li key={cat.value}>
                          <button
                            onClick={() => toggleMobileCategory(cat.value)}
                            className="w-full flex items-center justify-between pl-14 pr-6 py-3 text-xs uppercase tracking-[0.15em] font-light text-[#8aabca] hover:text-[#3b82f6] hover:bg-[#3b82f6]/5 transition"
                          >
                            {cat.label}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileActiveCat === cat.value ? "rotate-180" : ""}`} />
                          </button>

                          {mobileActiveCat === cat.value && (
                            <ul className="bg-[#0a1628]">
                              <li>
                                <button
                                  onClick={() => goToCategoryOnlyMobile(cat.value)}
                                  className="w-full text-left pl-20 pr-6 py-2.5 text-[11px] uppercase tracking-[0.15em] font-light text-[#60a5fa] hover:text-[#3b82f6] transition"
                                >
                                  Tous ({cat.label})
                                </button>
                              </li>
                              {gendersForMobileActiveCategory.map(g => (
                                <li key={g.value}>
                                  <button
                                    onClick={() => goToCategoryGenderMobile(cat.value, g.value)}
                                    className="w-full text-left pl-20 pr-6 py-2.5 text-[11px] uppercase tracking-[0.15em] font-light text-[#8aabca] hover:text-[#3b82f6] transition"
                                  >
                                    {g.label}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )}
            </ul>

            {/* Bottom actions */}
            <div className="p-5 border-t border-[#1e3a5f] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.15em] text-[#4a6a8a]">Thème</span>
                <button onClick={toggleDark} className="p-2 text-white/70 hover:text-[#3b82f6] transition">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#4a6a8a] hover:text-white transition"
              >
                <X className="w-4 h-4" /> Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}