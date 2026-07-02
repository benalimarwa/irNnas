"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ShoppingCart, Heart, Play, ChevronRight, Star } from "lucide-react";
import Navbar from "@/components/ClientNavbar";
import toast, { Toaster } from "react-hot-toast";

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
    stock: number;
    isNew?: boolean;
    isSale?: boolean;
};

const GUEST_KEY = "irnas_guest_cart";

const guestCart = {
    get(): { productId: number; quantity: number }[] {
        if (typeof window === "undefined") return [];
        try {
            return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
        } catch {
            return [];
        }
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
};

export default function HomePage() {
    const router = useRouter();
    const { isSignedIn } = useUser();

    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartCount, setCartCount] = useState(0);

    // Fetch produits mis en avant
    const fetchFeatured = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) {
                const data: Product[] = await res.json();
                const featured = data
                    .filter(p => p.isNew || p.isSale)
                    .slice(0, 8);
                setFeaturedProducts(featured.length ? featured : data.slice(0, 8));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeatured();
    }, []);

    // Gestion panier (invité + connecté)
    useEffect(() => {
        if (isSignedIn) {
            // Tu peux ajouter ici la synchronisation guest → user
            setCartCount(0); // À adapter avec ton API
        } else {
            setCartCount(guestCart.count());
        }
    }, [isSignedIn]);

    const addToCart = async (productId: number) => {
        if (!isSignedIn) {
            guestCart.add(productId);
            setCartCount(guestCart.count());
            toast.success("🛒 Ajouté au panier (mode invité)", { duration: 2500 });
            return;
        }
        // Logique connecté
        try {
            await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, quantity: 1 }),
            });
            setCartCount(prev => prev + 1);
            toast.success("✅ Ajouté au panier !");
        } catch {
            toast.error("Erreur lors de l'ajout");
        }
    };

    const handleBuyNow = (productId: number) => {
        router.push(`/client/checkout?productId=${productId}&quantity=1`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin mx-auto" />
                    <p className="mt-6 text-[#4a6a8a]">Chargement de l'expérience IRNAS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a1628] text-white">
            <Toaster position="bottom-right" />

            <Navbar />

            {/* ====================== HERO SECTION ====================== */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="https://assets.mixkit.co/videos/preview/75492/75492-large.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <div className="mb-6 inline-block px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm tracking-[3px] uppercase">
                        Collection Automne-Hiver 2026
                    </div>

                    <h1 className="text-6xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-none mb-8">
                        L'ÉLÉGANCE<br />
                        <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            SANS COMPROMIS
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto mb-12">
                        Des pièces raffinées, pensées pour durer. Qualité premium, style intemporel.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <Link
                            href="/client/catalog"
                            className="px-12 py-4 bg-white text-black font-medium rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center gap-3 group text-lg"
                        >
                            Découvrir la collection
                            <ChevronRight className="group-hover:translate-x-1 transition" />
                        </Link>

                        <button
                            onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-4 border border-white/50 hover:border-white rounded-2xl flex items-center gap-3 transition text-lg"
                        >
                            <Play className="w-5 h-5" /> Regarder le film
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center text-xs tracking-widest opacity-70">
                    <span>SCROLL</span>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-white to-transparent mt-2" />
                </div>
            </section>

            {/* ====================== FEATURED / NOUVEAUTÉS ====================== */}
            <section id="featured" className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-blue-500 uppercase tracking-[4px] text-sm">Just Dropped</span>
                        <h2 className="text-5xl font-light tracking-tight mt-2">Nouveautés</h2>
                    </div>
                    <Link href="/client/catalog" className="flex items-center gap-2 text-blue-400 hover:text-white transition">
                        Tout explorer <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredProducts.map((product) => {
                        const isOnSale = product.originalPrice && product.originalPrice > product.price;
                        return (
                            <div key={product.id} className="group">
                                <div className="relative overflow-hidden rounded-3xl aspect-[4/4.2] bg-[#0f1f33]">
                                    <Image
                                        src={product.images[0] || "https://via.placeholder.com/600"}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {product.isNew && (
                                        <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-4 py-2 rounded-full">
                                            NEW
                                        </div>
                                    )}
                                    {isOnSale && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full">
                                            SALE
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 px-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-lg">{product.name}</h3>
                                            <p className="text-sm text-gray-400">{product.color} • {product.category}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-light text-xl">{product.price.toFixed(2)} TND</p>
                                            {isOnSale && <p className="text-xs line-through text-gray-500">{product.originalPrice} TND</p>}
                                        </div>
                                    </div>

                                    <div className="mt-5 flex gap-3">
                                        <button
                                            onClick={() => addToCart(product.id)}
                                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500 rounded-2xl transition text-sm font-medium"
                                        >
                                            Ajouter au panier
                                        </button>
                                        <button
                                            onClick={() => handleBuyNow(product.id)}
                                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 rounded-2xl transition text-sm font-medium"
                                        >
                                            Acheter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ====================== CATÉGORIES ====================== */}
            <section className="py-20 bg-black/40">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-center text-5xl font-light mb-16">Nos Univers</h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Homme", slug: "homme", color: "from-blue-600" },
                            { name: "Femme", slug: "femme", color: "from-pink-600" },
                            { name: "Vestes & Manteaux", slug: "manteau", color: "from-amber-600" },
                            { name: "Chaussures", slug: "chaussure", color: "from-emerald-600" },
                        ].map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/client/catalog?gender=${cat.slug}`}
                                className="group relative h-96 rounded-3xl overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-black/60 opacity-60 group-hover:opacity-80 transition`} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <h3 className="text-4xl font-light tracking-wide">{cat.name}</h3>
                                        <p className="mt-3 text-sm uppercase tracking-widest opacity-75">Découvrir →</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====================== FOOTER ====================== */}
            <footer className="border-t border-[#1a2a44] py-16 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <span className="text-3xl font-light tracking-[0.2em]">IRNAS</span>
                        <span className="text-xs uppercase tracking-widest text-blue-400">Fashion</span>
                    </div>
                    <p className="text-sm text-gray-500">© 2026 IRNAS — Tous droits réservés</p>
                </div>
            </footer>
        </div>
    );
}