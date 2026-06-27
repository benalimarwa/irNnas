"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Filter, X, ChevronDown } from "lucide-react";

type Product = {
    id: number;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number; // pour les promotions
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

    // Catégories disponibles (extraites des produits)
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

                // Catégories
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

    const toggleFavorite = (productId: number) => {
        setFavorites(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    // Appliquer les filtres
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
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="relative">
                    <div className="w-20 h-20 border-2 border-[#c9a84c]/30 border-t-[#c9a84c] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[#c9a84c] text-xs font-light tracking-[0.3em] animate-pulse">
                        CHARGEMENT
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">

            {/* ============================================ */}
            {/* HEADER — Luxe, minimal, doré */}
            {/* ============================================ */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#c9a84c]/10">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

                    {/* Brand */}
                    <Link href="/" className="group flex items-end gap-3">
                        <span className="text-3xl font-light tracking-[0.2em] text-[#f5f0e8] group-hover:text-[#c9a84c] transition duration-500">
                            IRNAS
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/70 font-light hidden sm:block">
                            Fashion
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden lg:flex items-center gap-12 text-xs uppercase tracking-[0.25em] font-light">
                        <Link href="/" className="text-[#c9a84c] hover:text-[#c9a84c]/80 transition border-b border-[#c9a84c]/30 pb-1">
                            Accueil
                        </Link>
                        <Link href="#shop" className="hover:text-[#c9a84c] transition pb-1 border-b border-transparent hover:border-[#c9a84c]/30">
                            Boutique
                        </Link>
                        <Link href="#" className="hover:text-[#c9a84c] transition pb-1 border-b border-transparent hover:border-[#c9a84c]/30">
                            Collections
                        </Link>
                        <Link href="#" className="hover:text-[#c9a84c] transition pb-1 border-b border-transparent hover:border-[#c9a84c]/30">
                            À propos
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-5">

                        {/* Search — desktop */}
                        <div className="relative hidden md:block w-64">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#141414] border border-[#c9a84c]/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-[#f5f0e8] placeholder:text-[#5a5548] focus:outline-none focus:border-[#c9a84c]/40 transition"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#5a5548]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button className="text-[#f5f0e8] hover:text-[#c9a84c] transition">
                            <Heart className="w-5 h-5" />
                        </button>

                        <Link href="/client/panier" className="relative">
                            <ShoppingCart className="w-5 h-5 hover:text-[#c9a84c] transition" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#c9a84c] text-[#0a0a0a] text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile menu toggle */}
                        <button className="lg:hidden text-[#f5f0e8] hover:text-[#c9a84c] transition">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* ============================================ */}
            {/* HERO — Élégance minimaliste */}
            {/* ============================================ */}
            <section className="relative pt-36 pb-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#c9a84c]/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-block mb-6 px-6 py-1.5 border border-[#c9a84c]/20 rounded-full text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/60">
                        Collection Automne-Hiver 2026
                    </div>
                    <h1 className="text-6xl md:text-8xl font-light tracking-[-0.02em] leading-[1.05]">
                        <span className="text-[#f5f0e8]">L'</span>
                        <span className="text-[#c9a84c]">Élégance</span>
                        <br className="hidden sm:block" />
                        <span className="text-[#f5f0e8]">Intemporelle</span>
                    </h1>
                    <p className="mt-6 text-base md:text-lg text-[#8a8578] font-light tracking-[0.15em] max-w-lg mx-auto">
                        Le style moderne, réinventé avec une touche de luxe discret.
                    </p>
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="#shop"
                            className="px-10 py-3.5 bg-[#c9a84c] text-[#0a0a0a] text-xs uppercase tracking-[0.25em] font-medium rounded-full hover:bg-[#b8983e] transition shadow-lg shadow-[#c9a84c]/10"
                        >
                            Découvrir
                        </Link>
                        <Link
                            href="#"
                            className="px-10 py-3.5 border border-[#c9a84c]/30 text-[#c9a84c] text-xs uppercase tracking-[0.25em] font-light rounded-full hover:bg-[#c9a84c]/10 transition"
                        >
                            Nos Collections
                        </Link>
                    </div>
                </div>

                {/* Décoratif */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-[#c9a84c]/30 to-transparent" />
            </section>

            {/* ============================================ */}
            {/* SHOP — Grille produits avec filtres */}
            {/* ============================================ */}
            <section id="shop" className="max-w-7xl mx-auto px-6 pb-24">

                {/* En-tête + filtres */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light tracking-tight">
                            Nos <span className="text-[#c9a84c]">Collections</span>
                        </h2>
                        <p className="mt-2 text-sm text-[#5a5548] tracking-widest uppercase font-light">
                            {filteredProducts.length} produits
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="ml-4 text-[#c9a84c] hover:underline text-xs"
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
                                            ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                                            : 'border-[#2a2824] text-[#8a8578] hover:border-[#c9a84c]/30 hover:text-[#f5f0e8]'
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
                                        className="px-5 py-2 text-xs uppercase tracking-[0.15em] font-light rounded-full border border-[#2a2824] text-[#8a8578] hover:border-[#c9a84c]/30 hover:text-[#f5f0e8] transition flex items-center gap-1"
                                    >
                                        + {categoryOptions.length - 3}
                                        <ChevronDown className={`w-3 h-3 transition ${showFilters ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showFilters && (
                                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#141414] border border-[#2a2824] rounded-2xl p-3 shadow-2xl z-20">
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
                                                            ? 'text-[#c9a84c] bg-[#c9a84c]/10'
                                                            : 'text-[#8a8578] hover:bg-[#1a1a1a] hover:text-[#f5f0e8]'
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

                        {/* Filtre genre */}
                        {genderOptions.length > 0 && (
                            <select
                                value={selectedGender}
                                onChange={(e) => setSelectedGender(e.target.value)}
                                className="bg-[#141414] border border-[#2a2824] rounded-full px-5 py-2 text-xs uppercase tracking-[0.15em] font-light text-[#8a8578] focus:outline-none focus:border-[#c9a84c]/40 cursor-pointer"
                            >
                                <option value="">Tous genres</option>
                                {genderOptions.map(g => (
                                    <option key={g.value} value={g.value}>{g.label}</option>
                                ))}
                            </select>
                        )}

                        {/* Recherche mobile */}
                        <div className="md:hidden relative w-full mt-2">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#141414] border border-[#2a2824] rounded-full py-2.5 pl-10 pr-4 text-sm text-[#f5f0e8] placeholder:text-[#5a5548] focus:outline-none focus:border-[#c9a84c]/40 transition"
                            />
                            <svg className="w-4 h-4 absolute left-3.5 top-3 text-[#5a5548]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Grille produits */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 border border-[#2a2824] rounded-3xl">
                        <p className="text-[#5a5548] text-sm uppercase tracking-[0.2em]">Aucun produit ne correspond</p>
                        <button
                            onClick={resetFilters}
                            className="mt-4 text-[#c9a84c] text-xs uppercase tracking-[0.2em] hover:underline"
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
                                    className="group relative bg-[#11100e] border border-[#1e1c18] rounded-3xl overflow-hidden transition-all duration-500 hover:border-[#c9a84c]/40 hover:shadow-2xl hover:shadow-[#c9a84c]/5"
                                >

                                    {/* Badges */}
                                    <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                        {product.isNew && (
                                            <span className="bg-[#c9a84c] text-[#0a0a0a] text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                                                Nouveau
                                            </span>
                                        )}
                                        {isOnSale && (
                                            <span className="bg-[#d44c4c] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                                                Sale!
                                            </span>
                                        )}
                                    </div>

                                    {/* Image */}
                                    <div className="relative h-[340px] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
                                        <Image
                                            src={product.images[0] || "https://via.placeholder.com/400"}
                                            alt={product.name}
                                            width={400}
                                            height={400}
                                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {/* Overlay au survol */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
                                    </div>

                                    {/* Contenu */}
                                    <div className="p-5 md:p-6">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base font-medium text-[#f5f0e8] truncate">
                                                    {product.name}
                                                </h3>
                                                <p className="text-xs text-[#5a5548] mt-1 uppercase tracking-widest font-light">
                                                    {product.color} • {product.category}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(product.id)}
                                                className="flex-shrink-0 text-[#5a5548] hover:text-[#c9a84c] transition mt-1"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 transition ${isFavorite ? 'fill-[#c9a84c] text-[#c9a84c]' : ''}`}
                                                />
                                            </button>
                                        </div>

                                        {/* Prix */}
                                        <div className="mt-4 flex items-baseline gap-3">
                                            {isOnSale ? (
                                                <>
                                                    <span className="text-2xl font-light text-[#f5f0e8]">
                                                        {product.price.toFixed(2)} TND
                                                    </span>
                                                    <span className="text-sm text-[#5a5548] line-through">
                                                        {product.originalPrice?.toFixed(2)} TND
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-light text-[#f5f0e8]">
                                                    {product.price.toFixed(2)} TND
                                                </span>
                                            )}
                                        </div>

                                        {/* Bouton AJOUTER — style Divinity */}
                                        <button
                                            onClick={() => addToCart(product.id)}
                                            disabled={product.stock <= 0}
                                            className={`
                                                mt-5 w-full py-3.5 rounded-2xl text-xs uppercase tracking-[0.25em] font-medium transition
                                                ${product.stock > 0
                                                    ? 'bg-[#c9a84c] text-[#0a0a0a] hover:bg-[#b8983e] shadow-lg shadow-[#c9a84c]/10'
                                                    : 'bg-[#2a2824] text-[#5a5548] cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            {product.stock > 0 ? 'AJOUTER' : 'RUPTURE'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

                {/* Pagination ou fin de liste */}
                {filteredProducts.length > 0 && (
                    <div className="mt-16 flex justify-center">
                        <div className="flex items-center gap-2 text-xs text-[#5a5548] uppercase tracking-[0.2em]">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30">
                                1
                            </span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition cursor-pointer">
                                2
                            </span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition cursor-pointer">
                                3
                            </span>
                            <span className="text-[#2a2824]">···</span>
                            <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition cursor-pointer">
                                8
                            </span>
                        </div>
                    </div>
                )}
            </section>

            {/* ============================================ */}
            {/* FOOTER — Élégant, minimal */}
            {/* ============================================ */}
            <footer className="border-t border-[#1e1c18] py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-light tracking-[0.2em] text-[#f5f0e8]">IRNAS</span>
                        <span className="text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/50 font-light">
                            Fashion
                        </span>
                    </div>
                    <p className="text-[10px] text-[#3a3630] tracking-widest font-light">
                        © 2026 IRNAS — Tous droits réservés
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-[#3a3630] tracking-widest font-light uppercase">
                        <Link href="#" className="hover:text-[#c9a84c] transition">Mentions</Link>
                        <Link href="#" className="hover:text-[#c9a84c] transition">Confidentialité</Link>
                        <Link href="#" className="hover:text-[#c9a84c] transition">Contact</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
}