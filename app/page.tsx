"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ShoppingCart, Heart, ChevronDown, X, ChevronRight } from "lucide-react";
import Navbar from "@/components/ClientNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    images: string[];
    category: string;
    gender: string;
    color: string;
    colorHex?: string;
    stock: number;
    isNew?: boolean;
    isSale?: boolean;
    sizes: string[];
};

type CategoryOption = { value: string; label: string };
type GuestItem = { productId: number; quantity: number };

// ─── Guest cart helpers (localStorage) ───────────────────────────────────────
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

// ─── Constants ────────────────────────────────────────────────────────────────
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

const MENU_LINKS = [
    { label: "Accueil", href: "/" },
    { label: "Nos Produits", href: "#shop" },
    { label: "Nouveautés", href: "#shop" },
    { label: "Promotions", href: "#shop" },
    { label: "À propos", href: "#" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
    const router = useRouter();
    const { isSignedIn } = useUser();

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [favorites, setFavorites] = useState<number[]>([]);

    // Filtres
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedGender, setSelectedGender] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showMoreCats, setShowMoreCats] = useState(false);
    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [genderOptions, setGenderOptions] = useState<CategoryOption[]>([]);

    // Drawer mobile
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerTab, setDrawerTab] = useState<"menu" | "categories">("menu");

    // ── Fetch produits ────────────────────────────────────────────────────────
    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data: Product[] = await res.json();
                setProducts(data);
                setFilteredProducts(data);

                const cats: CategoryOption[] = (
                    Array.from(new Set(data.map(p => p.category))) as string[]
                ).map(c => ({ value: c, label: CATEGORY_LABELS[c] ?? c }));
                setCategoryOptions(cats);

                const gens: CategoryOption[] = (
                    Array.from(new Set(data.map(p => p.gender))) as string[]
                ).filter(Boolean).map(g => ({ value: g, label: g }));
                setGenderOptions(gens);
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
                setCartCount(
                    data.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) || 0
                );
            }
        } catch { }
    };

    // Fusion guest cart → vrai panier après connexion
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

    useEffect(() => { fetchProducts(); }, []);

    useEffect(() => {
        if (isSignedIn) {
            syncGuestCart().then(() => fetchCartCount());
        } else {
            setCartCount(guestCart.count());
        }
    }, [isSignedIn]);

    // Filtrage réactif
    useEffect(() => {
        let filtered = [...products];
        if (selectedCategory) filtered = filtered.filter(p => p.category === selectedCategory);
        if (selectedGender) filtered = filtered.filter(p => p.gender === selectedGender);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.color.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q)
            );
        }
        setFilteredProducts(filtered);
    }, [selectedCategory, selectedGender, searchQuery, products]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const addToCart = async (productId: number) => {
        if (!isSignedIn) {
            guestCart.add(productId, 1);
            setCartCount(guestCart.count());
            alert("✅ Produit ajouté ! Connectez-vous pour finaliser votre commande.");
            return;
        }
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            if (res.ok) {
                setCartCount(prev => prev + 1);
                alert("✅ Produit ajouté au panier !");
            }
        } catch {
            alert("Erreur lors de l'ajout");
        }
    };

    const handleBuyNow = async (productId: number) => {
        guestCart.add(productId, 1);
  router.push("/client/checkout");
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [{ productId, quantity: 1 }],
                    deliveryMethod: "livraison",
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const orderId = data.order?.id ?? data.id;
                router.push(`/client/orders/${orderId}`);
            } else {
                alert("Erreur lors de la commande");
            }
        } catch {
            alert("Erreur réseau");
        }
    };

    // ✅ Toujours vers /client/panier sans passer par sign-in
const handleCartClick = () => {
  router.push("/client/panier");
};

    const toggleFavorite = (productId: number) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const resetFilters = () => {
        setSelectedCategory("");
        setSelectedGender("");
        setSearchQuery("");
    };

    const selectCategory = (val: string) => {
        setSelectedCategory(val);
        setDrawerOpen(false);
    };

    const hasActiveFilters = selectedCategory || selectedGender || searchQuery;

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">
                        IRNAS
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1628] text-white">

            {/* ================================================================ */}
            {/* DRAWER MOBILE — MENU / CATÉGORIES                               */}
            {/* ================================================================ */}
            {drawerOpen && (
                <div className="fixed inset-0 z-[100] flex lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setDrawerOpen(false)}
                    />
                    <div className="relative w-[78%] max-w-xs bg-white text-[#1a1a1a] flex flex-col h-full shadow-2xl">

                        {/* Barre de recherche */}
                        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent"
                            />
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Onglets */}
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setDrawerTab("menu")}
                                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${
                                    drawerTab === "menu"
                                        ? "border-[#1e3a5f] text-[#1e3a5f] bg-gray-50"
                                        : "border-transparent text-gray-400 bg-white"
                                }`}
                            >
                                Menu
                            </button>
                            <button
                                onClick={() => setDrawerTab("categories")}
                                className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${
                                    drawerTab === "categories"
                                        ? "border-[#1e3a5f] text-[#1e3a5f] bg-gray-50"
                                        : "border-transparent text-gray-400 bg-white"
                                }`}
                            >
                                Catégories
                            </button>
                        </div>

                        {/* Contenu onglets */}
                        <div className="flex-1 overflow-y-auto">
                            {drawerTab === "menu" ? (
                                <ul className="divide-y divide-gray-100">
                                    {MENU_LINKS.map((item, i) => (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                onClick={() => setDrawerOpen(false)}
                                                className={`flex items-center px-5 py-4 text-sm font-medium transition hover:bg-gray-50 ${
                                                    i === 0 ? "text-[#1e3a5f]" : "text-gray-700 hover:text-[#3b82f6]"
                                                }`}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    <li>
                                        <button
                                            onClick={() => selectCategory("")}
                                            className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition ${
                                                selectedCategory === ""
                                                    ? "text-[#3b82f6] bg-blue-50"
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-[#3b82f6]"
                                            }`}
                                        >
                                            Tous les produits
                                        </button>
                                    </li>
                                    {categoryOptions.map(cat => (
                                        <li key={cat.value}>
                                            <button
                                                onClick={() => selectCategory(cat.value)}
                                                className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium transition ${
                                                    selectedCategory === cat.value
                                                        ? "text-[#3b82f6] bg-blue-50"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-[#3b82f6]"
                                                }`}
                                            >
                                                {cat.label}
                                                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Fermer */}
                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-full py-3 text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 transition flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* HEADER                                                           */}
           <Navbar/>

            {/* ================================================================ */}
            {/* HERO                                                             */}
            {/* ================================================================ */}
           
            {/* ================================================================ */}
            {/* SHOP                                                             */}
            {/* ================================================================ */}
            <section id="shop" className="max-w-7xl mx-auto px-6 pb-24">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                            Nos <span className="text-[#3b82f6]">Collections</span>
                        </h2>
                        <p className="mt-2 text-sm text-[#4a6a8a] tracking-widest uppercase font-light">
                            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="ml-4 text-[#3b82f6] hover:underline text-xs normal-case">
                                    Réinitialiser
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Filtres desktop */}
                    <div className="hidden md:flex flex-wrap items-center gap-3">
                        {categoryOptions.slice(0, 3).map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(selectedCategory === cat.value ? "" : cat.value)}
                                className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border transition ${
                                    selectedCategory === cat.value
                                        ? "border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]"
                                        : "border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-white"
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}

                        {categoryOptions.length > 3 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMoreCats(!showMoreCats)}
                                    className="px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-white transition flex items-center gap-1.5"
                                >
                                    +{categoryOptions.length - 3}
                                    <ChevronDown className={`w-3 h-3 transition-transform ${showMoreCats ? "rotate-180" : ""}`} />
                                </button>
                                {showMoreCats && (
                                    <div className="absolute top-full right-0 mt-2 w-52 bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl p-2 shadow-2xl z-20">
                                        {categoryOptions.slice(3).map(cat => (
                                            <button
                                                key={cat.value}
                                                onClick={() => { setSelectedCategory(selectedCategory === cat.value ? "" : cat.value); setShowMoreCats(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.1em] font-light rounded-xl transition ${
                                                    selectedCategory === cat.value
                                                        ? "text-[#3b82f6] bg-[#3b82f6]/10"
                                                        : "text-[#8aabca] hover:bg-[#1a2a44] hover:text-white"
                                                }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {genderOptions.length > 0 && (
                            <select
                                value={selectedGender}
                                onChange={e => setSelectedGender(e.target.value)}
                                className="bg-[#0f1f33] border border-[#1e3a5f] rounded-full px-5 py-2 text-xs uppercase tracking-[0.15em] font-light text-[#8aabca] focus:outline-none focus:border-[#3b82f6]/40 cursor-pointer"
                            >
                                <option value="">Tous genres</option>
                                {genderOptions.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Bouton filtrer mobile */}
                    <button
                        onClick={() => { setDrawerTab("categories"); setDrawerOpen(true); }}
                        className="md:hidden self-start flex items-center gap-2 px-5 py-2.5 border border-[#1e3a5f] rounded-full text-xs uppercase tracking-[0.15em] text-[#8aabca] hover:border-[#3b82f6]/40 hover:text-white transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h18M6 8h12M9 12h6" />
                        </svg>
                        Filtrer {selectedCategory && `· ${CATEGORY_LABELS[selectedCategory] ?? selectedCategory}`}
                    </button>
                </div>

                {/* Grille */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-24 border border-[#1e3a5f] rounded-3xl">
                        <p className="text-[#4a6a8a] text-sm uppercase tracking-[0.2em]">Aucun produit ne correspond</p>
                        <button onClick={resetFilters} className="mt-4 text-[#3b82f6] text-xs uppercase tracking-[0.2em] hover:underline">
                            Voir tous les produits
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {filteredProducts.map(product => {
                            const isFav = favorites.includes(product.id);
                            const isOnSale = product.originalPrice && product.originalPrice > product.price;

                            return (
                                <div
                                    key={product.id}
                                    className="group relative bg-[#0f1f33] border border-[#1a2a44] rounded-3xl overflow-hidden transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5"
                                >
                                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                                        {product.isNew && (
                                            <span className="bg-[#3b82f6] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                                Nouveau
                                            </span>
                                        )}
                                        {isOnSale && (
                                            <span className="bg-[#ef4444] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                                                Sale!
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative h-[300px] flex items-center justify-center bg-[#0a1628] overflow-hidden">
                                        <Image
                                            src={product.images[0] || "https://via.placeholder.com/400"}
                                            alt={product.name}
                                            width={400}
                                            height={400}
                                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-medium text-white truncate">{product.name}</h3>
                                                <p className="text-[11px] text-[#4a6a8a] mt-0.5 uppercase tracking-widest font-light">
                                                    {product.color} · {CATEGORY_LABELS[product.category] ?? product.category}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(product.id)}
                                                className="flex-shrink-0 mt-0.5 text-[#4a6a8a] hover:text-[#3b82f6] transition"
                                                aria-label="Favori"
                                            >
                                                <Heart className={`w-4 h-4 ${isFav ? "fill-[#3b82f6] text-[#3b82f6]" : ""}`} />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="text-xl font-light text-white">{product.price.toFixed(2)} TND</span>
                                            {isOnSale && (
                                                <span className="text-xs text-[#4a6a8a] line-through">{product.originalPrice?.toFixed(2)} TND</span>
                                            )}
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => addToCart(product.id)}
                                                disabled={product.stock <= 0}
                                                className={`flex-1 py-3 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium transition ${
                                                    product.stock > 0
                                                        ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-[#3b82f6]/10"
                                                        : "bg-[#1a2a44] text-[#4a6a8a] cursor-not-allowed"
                                                }`}
                                            >
                                                {product.stock > 0 ? "Ajouter" : "Rupture"}
                                            </button>
                                            <button
                                                onClick={() => handleBuyNow(product.id)}
                                                disabled={product.stock <= 0}
                                                className={`flex-1 py-3 rounded-xl text-[11px] uppercase tracking-[0.2em] font-medium border transition ${
                                                    product.stock > 0
                                                        ? "border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10"
                                                        : "border-[#1a2a44] text-[#4a6a8a] cursor-not-allowed"
                                                }`}
                                            >
                                                Acheter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ================================================================ */}
            {/* FOOTER                                                           */}
            {/* ================================================================ */}
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