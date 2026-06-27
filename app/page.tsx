"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, ChevronDown } from "lucide-react";

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

type CategoryOption = {
    value: string;
    label: string;
};

export default function HomePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);
    const [favorites, setFavorites] = useState<number[]>([]);

    // Filtres
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedGender, setSelectedGender] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
    const [genderOptions, setGenderOptions] = useState<CategoryOption[]>([]);

    useEffect(() => {
        fetchProducts();
        fetchCartCount();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
                setFilteredProducts(data);

                const categories: CategoryOption[] = (Array.from(
  new Set(data.map((p: Product) => p.category))
) as string[]).map(cat => ({ value: cat, label: cat }));
setCategoryOptions(categories);

const genders: CategoryOption[] = (Array.from(
  new Set(data.map((p: Product) => p.gender))
) as string[]).filter(Boolean).map(g => ({ value: g, label: g }));
setGenderOptions(genders);
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
        } catch { }
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

    // Acheter directement : vide le panier, ajoute ce produit, redirige vers le panier
    const handleBuyNow = async (productId: number) => {
        try {
            // 1. Vider le panier
            await fetch("/api/cart", { method: "DELETE" });

            // 2. Ajouter le produit
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity: 1 }),
            });

            if (res.ok) {
                setCartCount(1);
                router.push("/client/panier");
            } else {
                alert("Erreur lors de l'achat");
            }
        } catch {
            alert("Erreur réseau");
        }
    };

    const toggleFavorite = (productId: number) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const applyFilters = () => {
        let filtered = [...products];

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (selectedGender) {
            filtered = filtered.filter(p => p.gender === selectedGender);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.color.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [selectedCategory, selectedGender, searchQuery, products]);

    const resetFilters = () => {
        setSelectedCategory("");
        setSelectedGender("");
        setSearchQuery("");
        setShowFilters(false);
    };

    const hasActiveFilters = selectedCategory || selectedGender || searchQuery;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-xs font-light tracking-[0.3em] animate-pulse">
                        CHARGEMENT
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1628] text-white">

            {/* ============================================ */}
            {/* HEADER — Bleu nuit professionnel */}
            {/* ============================================ */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-[#1e3a5f]">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    <Link href="/" className="group flex items-end gap-3">
                        <span className="text-3xl font-light tracking-[0.2em] text-white group-hover:text-[#3b82f6] transition duration-500">
                            IRNAS
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/70 font-light hidden sm:block">
                            Fashion
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-12 text-xs uppercase tracking-[0.25em] font-light">
                        <Link href="/" className="text-[#3b82f6] hover:text-[#60a5fa] transition border-b border-[#3b82f6]/30 pb-1">
                            Accueil
                        </Link>
                        <Link href="#shop" className="hover:text-[#3b82f6] transition pb-1 border-b border-transparent hover:border-[#3b82f6]/30">
                            Boutique
                        </Link>
                        <Link href="#" className="hover:text-[#3b82f6] transition pb-1 border-b border-transparent hover:border-[#3b82f6]/30">
                            Collections
                        </Link>
                        <Link href="#" className="hover:text-[#3b82f6] transition pb-1 border-b border-transparent hover:border-[#3b82f6]/30">
                            À propos
                        </Link>
                    </nav>

                    <div className="flex items-center gap-5">
                        <div className="relative hidden md:block w-64">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0f1f33] border border-[#1e3a5f] rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/40 transition"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#4a6a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button className="text-white hover:text-[#3b82f6] transition">
                            <Heart className="w-5 h-5" />
                        </button>

                        <Link href="/client/panier" className="relative">
                            <ShoppingCart className="w-5 h-5 hover:text-[#3b82f6] transition" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#3b82f6] text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button className="lg:hidden text-white hover:text-[#3b82f6] transition">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* ============================================ */}
            {/* HERO — Élégance bleue */}
            {/* ============================================ */}
            <section className="relative pt-36 pb-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-block mb-6 px-6 py-1.5 border border-[#3b82f6]/20 rounded-full text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/60">
                        Collection Printemps-Été 2026
                    </div>
                    <h1 className="text-6xl md:text-8xl font-light tracking-[-0.02em] leading-[1.05]">
                        <span className="text-white">L'</span>
                        <span className="text-[#3b82f6]">Élégance</span>
                        <br className="hidden sm:block" />
                        <span className="text-white">Professionnelle</span>
                    </h1>
                    <p className="mt-6 text-base md:text-lg text-[#8aabca] font-light tracking-[0.15em] max-w-lg mx-auto">
                        Le style moderne, réinventé avec une touche de luxe discret.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="#shop"
                            className="px-10 py-3.5 bg-[#3b82f6] text-white text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#2563eb] transition shadow-lg shadow-[#3b82f6]/20"
                        >
                            Découvrir
                        </Link>
                        <Link
                            href="#"
                            className="px-10 py-3.5 border border-[#3b82f6]/30 text-[#3b82f6] text-xs uppercase tracking-[0.25em] font-light rounded-full hover:bg-[#3b82f6]/10 transition"
                        >
                            Nos Collections
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#3b82f6]/30 to-transparent" />
            </section>

            {/* ============================================ */}
            {/* SHOP — Grille produits avec filtres */}
            {/* ============================================ */}
            <section id="shop" className="max-w-7xl mx-auto px-6 pb-24">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                            Nos <span className="text-[#3b82f6]">Collections</span>
                        </h2>
                        <p className="mt-2 text-sm text-[#4a6a8a] tracking-widest uppercase font-light">
                            {filteredProducts.length} produits
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="ml-4 text-[#3b82f6] hover:underline text-xs"
                                >
                                    Réinitialiser
                                </button>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Filtres catégorie — "trois points" */}
                        <div className="flex flex-wrap items-center gap-2">
                            {categoryOptions.slice(0, 3).map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(
                                        selectedCategory === cat.value ? "" : cat.value
                                    )}
                                    className={`
                                        px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border transition
                                        ${selectedCategory === cat.value
                                            ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#3b82f6]'
                                            : 'border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/30 hover:text-white'
                                        }
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}

                            {categoryOptions.length > 3 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border border-[#1e3a5f] text-[#8aabca] hover:border-[#3b82f6]/30 hover:text-white transition flex items-center gap-1"
                                    >
                                        + {categoryOptions.length - 3}
                                        <ChevronDown className={`w-3 h-3 transition ${showFilters ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showFilters && (
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl p-3 shadow-2xl z-20">
                                            {categoryOptions.slice(3).map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    onClick={() => {
                                                        setSelectedCategory(
                                                            selectedCategory === cat.value ? "" : cat.value
                                                        );
                                                        setShowFilters(false);
                                                    }}
                                                    className={`
                                                        w-full text-left px-4 py-2.5 text-xs uppercase tracking-[0.1em] font-light rounded-xl transition
                                                        ${selectedCategory === cat.value
                                                            ? 'text-[#3b82f6] bg-[#3b82f6]/10'
                                                            : 'text-[#8aabca] hover:bg-[#1a2a44] hover:text-white'
                                                        }
                                                    `}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {genderOptions.length > 0 && (
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="bg-[#0f1f33] border border-[#1e3a5f] rounded-full px-5 py-2 text-xs uppercase tracking-[0.15em] font-light text-[#8aabca] focus:outline-none focus:border-[#3b82f6]/40 cursor-pointer"
                            >
                                <option value="">Tous genres</option>
                                {genderOptions.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        )}

                        <div className="md:hidden relative w-full mt-2">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0f1f33] border border-[#1e3a5f] rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/40 transition"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#4a6a8a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 border border-[#1e3a5f] rounded-3xl">
                        <p className="text-[#4a6a8a] text-sm uppercase tracking-[0.2em]">Aucun produit ne correspond</p>
                        <button
                            onClick={resetFilters}
                            className="mt-4 text-[#3b82f6] text-xs uppercase tracking-[0.2em] hover:underline"
                        >
                            Voir tous les produits
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">

                        {filteredProducts.map((product) => {
                            const isFavorite = favorites.includes(product.id);
                            const isOnSale = product.originalPrice && product.originalPrice > product.price;

                            return (
                                <div
                                    key={product.id}
                                    className="group relative bg-[#0f1f33] border border-[#1a2a44] rounded-3xl overflow-hidden transition-all duration-500 hover:border-[#3b82f6]/40 hover:shadow-2xl hover:shadow-[#3b82f6]/5"
                                >
                                    <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                        {product.isNew && (
                                            <span className="bg-[#3b82f6] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                                                Nouveau
                                            </span>
                                        )}
                                        {isOnSale && (
                                            <span className="bg-[#d44c4c] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                                                Sale!
                                            </span>
                                        )}
                                    </div>

                                    <div className="relative h-[340px] flex items-center justify-center bg-[#0a1628] overflow-hidden">
                                        <Image
                                            src={product.images[0] || "https://via.placeholder.com/400"}
                                            alt={product.name}
                                            width={400}
                                            height={400}
                                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                                    </div>

                                    <div className="p-5 md:p-6">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-medium text-white truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-[#4a6a8a] mt-1 uppercase tracking-widest font-light">
                                                    {product.color} • {product.category}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(product.id)}
                                                className="flex-shrink-0 text-[#4a6a8a] hover:text-[#3b82f6] transition mt-1"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 transition ${isFavorite ? 'fill-[#3b82f6] text-[#3b82f6]' : ''}`}
                                                />
                                            </button>
                                        </div>

                                        <div className="mt-4 flex items-baseline gap-3">
                                            {isOnSale ? (
                                                <>
                                                    <span className="text-2xl font-light text-white">
                                                        {product.price.toFixed(2)} TND
                                                    </span>
                                                    <span className="text-sm text-[#4a6a8a] line-through">
                                                        {product.originalPrice?.toFixed(2)} TND
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-light text-white">
                                                    {product.price.toFixed(2)} TND
                                                </span>
                                            )}
                                        </div>

                                        {/* Deux boutons : Ajouter et Acheter maintenant */}
                                        <div className="mt-5 flex gap-3">
                                            <button
                                                onClick={() => addToCart(product.id)}
                                                disabled={product.stock <= 0}
                                                className={`
                                                    flex-1 py-3.5 rounded-2xl text-xs uppercase tracking-[0.25em] font-medium transition
                                                    ${product.stock > 0
                                                        ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-lg shadow-[#3b82f6]/10'
                                                        : 'bg-[#1a2a44] text-[#4a6a8a] cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {product.stock > 0 ? 'AJOUTER' : 'RUPTURE'}
                                            </button>
                                            <button
                                                onClick={() => handleBuyNow(product.id)}
                                                disabled={product.stock <= 0}
                                                className={`
                                                    flex-1 py-3.5 rounded-2xl text-xs uppercase tracking-[0.25em] font-medium transition border
                                                    ${product.stock > 0
                                                        ? 'border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10'
                                                        : 'border-[#1a2a44] text-[#4a6a8a] cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                ACHETER
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

                {filteredProducts.length > 0 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-2 text-xs text-[#4a6a8a] uppercase tracking-[0.2em]">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30">
                                1
                            </span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a2a44] transition cursor-pointer">
                                2
                            </span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a2a44] transition cursor-pointer">
                                3
                            </span>
                            <span className="text-[#1a2a44]">···</span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a2a44] transition cursor-pointer">
                                8
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <footer className="border-t border-[#1a2a44] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-light tracking-[0.2em] text-white">IRNAS</span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">
                            Fashion
                        </span>
                    </div>
                    <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">
                        © 2026 IRNAS — Tous droits réservés
                    </p>
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