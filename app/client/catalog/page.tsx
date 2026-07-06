
"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

import { ShoppingCart, Heart, ChevronDown, X, ChevronRight } from "lucide-react";
import Navbar from "@/components/ClientNavbar";
import { useRouter, useSearchParams } from "next/navigation";

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

function CatalogueInner() {
    const router = useRouter();
    const searchParams = useSearchParams();   // ← déplacé ici, voir point 2

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
   

    // Lit les paramètres d'URL
    useEffect(() => {
        const cat = searchParams.get("category");
        const gender = searchParams.get("gender");
        if (cat) setSelectedCategory(cat);
        if (gender) setSelectedGender(gender);
    }, [searchParams]);

    // ── Fetch produits ────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
        const res = await fetch("/api/products");
        if (res.ok) {
            const raw: any[] = await res.json();

            // Aplatit category (objet {id, name, createdAt}) en simple string
            const data: Product[] = raw.map(p => ({
                ...p,
                category:
                    p.category && typeof p.category === "object"
                        ? p.category.name
                        : p.category,
            }));

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

    useEffect(() => { fetchProducts(); }, []);
    useEffect(() => { fetchCartCount(); }, []);

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

    const handleCartClick = () => {
        router.push("/client/panier");
    };

    const fetchFavorites = async () => {
        try {
            const res = await fetch("/api/favorites");
            if (res.ok) {
                const data = await res.json();
                setFavorites(data.map((p: Product) => p.id));
            }
        } catch (err) {
            console.error("Erreur fetch favorites:", err);
        }
    };

    useEffect(() => { fetchFavorites(); }, []);

    const toggleFavorite = async (productId: number) => {
        try {
            const res = await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });

            if (res.ok) {
                const result = await res.json();
                setFavorites(prev =>
                    result.status === "added"
                        ? [...prev, productId]
                        : prev.filter(id => id !== productId)
                );
            } else {
                alert("Erreur lors de la mise à jour des favoris");
            }
        } catch {
            alert("Erreur réseau");
        }
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
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
                    <div className="relative w-[78%] max-w-xs bg-white text-[#1a1a1a] flex flex-col h-full shadow-2xl">
                        {/* ... (Drawer mobile reste identique) ... */}
                        {/* Barre de recherche, onglets, etc. */}
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* HEADER                                                           */}
            <Navbar />

            {/* ================================================================ */}
            {/* SHOP                                                             */}
            {/* ================================================================ */}
            <section id="shop" className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <p className="mt-2 text-sm text-[#4a6a8a] tracking-widest uppercase font-light">
                            {filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="ml-4 text-[#3b82f6] hover:underline text-xs normal-case">
                                    Réinitialiser
                                </button>
                            )}
                        </p>
                    </div>

                    {/* Filtres desktop (inchangé) */}
                    <div className="hidden md:flex flex-wrap items-center gap-3">
                        {/* ... filtres existants ... */}
                    </div>

                    {/* Bouton filtrer mobile (inchangé) */}
                    <button onClick={() => { setDrawerTab("categories"); setDrawerOpen(true); }} className="md:hidden ...">
                        Filtrer {selectedCategory && `· ${CATEGORY_LABELS[selectedCategory] ?? selectedCategory}`}
                    </button>
                </div>

                {/* Grille des produits */}
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

                                        {/* === TAilles === */}
                                        {product.sizes && product.sizes.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {product.sizes.map(size => (
                                                    <span
                                                        key={size}
                                                        className="min-w-[28px] text-center px-2 py-1 text-[10px] font-medium uppercase tracking-wide rounded-md border border-[#1e3a5f] text-[#8aabca] bg-[#0a1628]"
                                                    >
                                                        {size}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Prix */}
                                        <div className="mt-3 flex items-baseline gap-2">
                                            <span className="text-xl font-light text-white">{product.price.toFixed(2)} TND</span>
                                            {isOnSale && (
                                                <span className="text-xs text-[#4a6a8a] line-through">
                                                    {product.originalPrice?.toFixed(2)} TND
                                                </span>
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
            {/* ================================================================ */}
{/* FOOTER                                                           */}
{/* ================================================================ */}
{/* ================================================================ */}
{/* FOOTER                                                           */}
{/* ================================================================ */}
{/* ================================================================ */}
{/* FOOTER                                                           */}
{/* ================================================================ */}
<footer className="border-t border-[#1a2a44] py-10 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
        </div>

        <p className="text-[10px] text-[#4a6a8a] tracking-widest font-light">© 2026 IRNAS — Tous droits réservés</p>

        <div className="flex items-center gap-3">
            <a
                href="https://www.instagram.com/iheb_saadani10?igsh=bXJweHpuZnAxcXM5"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1e3a5f] text-[#8aabca] hover:text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.428.465a4.902 4.902 0 0 0-1.771 1.153A4.902 4.902 0 0 0 2.525 5.45c-.247.637-.416 1.364-.465 2.428C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.428a4.902 4.902 0 0 0 1.153 1.771 4.902 4.902 0 0 0 1.771 1.153c.637.247 1.364.416 2.428.465C8.944 21.988 9.284 22 12 22s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.428-.465a4.902 4.902 0 0 0 1.771-1.153 4.902 4.902 0 0 0 1.153-1.771c.247-.637.416-1.364.465-2.428.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.428a4.902 4.902 0 0 0-1.153-1.771A4.902 4.902 0 0 0 18.551 2.525c-.637-.247-1.364-.416-2.428-.465C15.056 2.012 14.716 2 12 2Zm0 1.802c2.67 0 2.987.01 4.042.058.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.858.048 1.055.058 1.372.058 4.042s-.01 2.987-.058 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.858.344-1.055.048-1.372.058-4.042.058s-2.987-.01-4.042-.058c-.976-.045-1.505-.207-1.858-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.055-.058-1.372-.058-4.042s.01-2.987.058-4.042c.045-.976.207-1.505.344-1.858.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.858-.344 1.055-.048 1.372-.058 4.042-.058Zm0 3.063a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27Zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666Zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z"/>
                </svg>
            </a>

            <a
                href="https://www.tiktok.com/@iheb_saadani10?_r=1&_t=ZS-97nAdUJU9Rc"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-[#1e3a5f] text-[#8aabca] hover:text-white hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 transition"
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z"/>
                </svg>
            </a>
        </div>
    </div>
</footer>
        </div>
  );
}export default function CataloguePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">
                        IRNAS
                    </div>
                </div>
            </div>
        }>
            <CatalogueInner />
        </Suspense>
    );
}