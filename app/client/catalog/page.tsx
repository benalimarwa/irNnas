"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, ChevronDown, X, ChevronLeft, ChevronRight } from "lucide-react";

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

function CatalogueInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  // Index de l'image actuellement affichée, par produit (carrousel)
  const [activeImageIndex, setActiveImageIndex] = useState<Record<number, number>>({});

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [genderOptions, setGenderOptions] = useState<CategoryOption[]>([]);

  // Drawer mobile
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Lecture des filtres dans l'URL
  useEffect(() => {
    const cat = searchParams.get("category");
    const gender = searchParams.get("gender");
    if (cat) setSelectedCategory(cat);
    if (gender) setSelectedGender(gender);
  }, [searchParams]);

  // Fetch produits
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const raw: any[] = await res.json();

        const data: Product[] = raw.map((p) => ({
          ...p,
          category:
            p.category && typeof p.category === "object"
              ? p.category.name
              : p.category || "",
        }));

        setProducts(data);
        setFilteredProducts(data);

        // Catégories uniques
        const cats = Array.from(new Set(data.map((p) => p.category)))
          .filter(Boolean)
          .map((c: string) => ({
            value: c,
            label: CATEGORY_LABELS[c] ?? c,
          }));
        setCategoryOptions(cats);

        // Genres uniques
        const gens = Array.from(new Set(data.map((p) => p.gender)))
          .filter(Boolean)
          .map((g: string) => ({ value: g, label: g }));
        setGenderOptions(gens);
      }
    } catch (err) {
      console.error("Erreur fetch produits:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  // Filtrage
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (selectedGender) {
      filtered = filtered.filter((p) => p.gender === selectedGender);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedGender, searchQuery, products]);

  const addToCart = async (productId: number, size?: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1, size: size ?? null }),
      });

      if (res.ok) {
        setCartCount((prev) => prev + 1);
        alert("✅ Produit ajouté au panier !");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erreur lors de l'ajout");
      }
    } catch {
      alert("Erreur lors de l'ajout au panier");
    }
  };

  const handleBuyNow = (product: Product, size?: string) => {
    sessionStorage.setItem(
      "irnas_buynow",
      JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || null,
        quantity: 1,
        size: size ?? null,
      })
    );
    router.push("/client/checkout?mode=buynow");
  };

  const toggleFavorite = async (productId: number) => {
    if (!isSignedIn) {
      alert("Connectez-vous pour utiliser les favoris");
      return;
    }
    // Ajoute ici ton appel API favoris si tu veux
    console.log("Toggle favorite", productId);
  };

  const selectSize = (productId: number, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  /* ── Carrousel d'images par produit ─────────────────────── */

  const getActiveIndex = (productId: number) => activeImageIndex[productId] ?? 0;

  const goToImage = (productId: number, index: number) => {
    setActiveImageIndex((prev) => ({ ...prev, [productId]: index }));
  };

  const nextImage = (product: Product) => {
    const total = product.images.length;
    if (total <= 1) return;
    const current = getActiveIndex(product.id);
    goToImage(product.id, (current + 1) % total);
  };

  const prevImage = (product: Product) => {
    const total = product.images.length;
    if (total <= 1) return;
    const current = getActiveIndex(product.id);
    goToImage(product.id, (current - 1 + total) % total);
  };

  const resetFilters = () => {
    setSelectedCategory("");
    setSelectedGender("");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em]">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white pb-20">
      {/* Filtres Desktop */}
      <div className="hidden md:flex flex-wrap items-center gap-4 max-w-7xl mx-auto px-6 pt-8">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-72 bg-[#0f1f33] border border-[#1a2a44] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
        />

        {/* Genres */}
        <div className="flex bg-[#0f1f33] border border-[#1a2a44] rounded-full p-1">
          <button
            onClick={() => setSelectedGender("")}
            className={`px-5 py-2 rounded-full text-sm transition ${
              selectedGender === "" ? "bg-[#3b82f6] text-white" : "text-[#8aabca] hover:text-white"
            }`}
          >
            Tous
          </button>
          {genderOptions.map((g) => (
            <button
              key={g.value}
              onClick={() => setSelectedGender(g.value)}
              className={`px-5 py-2 rounded-full text-sm transition ${
                selectedGender === g.value ? "bg-[#3b82f6] text-white" : "text-[#8aabca] hover:text-white"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Catégories */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0f1f33] border border-[#1a2a44] rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#3b82f6] appearance-none pr-10"
          >
            <option value="">Toutes les catégories</option>
            {categoryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6a8a] pointer-events-none" />
        </div>

        {(selectedCategory || selectedGender || searchQuery) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 text-[#8aabca] hover:text-white transition"
          >
            <X size={18} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Grille des produits */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-[#4a6a8a] text-lg">Aucun produit ne correspond à vos critères.</p>
            <button onClick={resetFilters} className="mt-6 text-[#3b82f6] hover:underline">
              Voir tous les produits
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => {
              const currentSize = selectedSizes[product.id];
              const hasSizes = product.sizes?.length > 0;
              const sizeRequiredButMissing = hasSizes && !currentSize;
              const isOutOfStock = product.stock <= 0;
              const actionsDisabled = isOutOfStock || sizeRequiredButMissing;

              const images = product.images?.length ? product.images : ["/placeholder.jpg"];
              const activeIndex = getActiveIndex(product.id);
              const hasMultipleImages = images.length > 1;

              return (
                <div
                  key={product.id}
                  className="group bg-[#0f1f33] border border-[#1a2a44] rounded-3xl overflow-hidden hover:border-[#3b82f6]/50 transition-all duration-300"
                >
                  <div className="relative h-[320px] bg-[#0a1628] flex items-center justify-center overflow-hidden">
                    <Image
                      src={images[activeIndex] || "/placeholder.jpg"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="object-contain p-6 transition-transform group-hover:scale-105 duration-700"
                    />

                    {product.isNew && (
                      <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                        NOUVEAU
                      </span>
                    )}

                    {/* Flèches de navigation du carrousel (visibles au survol) */}
                    {hasMultipleImages && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); prevImage(product); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                          aria-label="Image précédente"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); nextImage(product); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                          aria-label="Image suivante"
                        >
                          <ChevronRight size={18} />
                        </button>

                        {/* Points de navigation */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); goToImage(product.id, i); }}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i === activeIndex ? "bg-[#3b82f6] w-4" : "bg-white/40 hover:bg-white/70"
                              }`}
                              aria-label={`Image ${i + 1}`}
                            />
                          ))}
                        </div>

                        {/* Compteur d'images */}
                        <span className="absolute top-4 right-4 bg-black/50 text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                          {activeIndex + 1}/{images.length}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg leading-tight">{product.name}</h3>
                        <p className="text-sm text-[#4a6a8a] mt-1">
                          {product.color} • {CATEGORY_LABELS[product.category] ?? product.category}
                        </p>
                      </div>

                      <button onClick={() => toggleFavorite(product.id)} className="text-[#4a6a8a] hover:text-red-500 transition">
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Miniatures (si plusieurs images) */}
                    {hasMultipleImages && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>
                        {images.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => goToImage(product.id, i)}
                            className={`relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border transition ${
                              i === activeIndex ? "border-[#3b82f6]" : "border-[#1e3a5f] opacity-60 hover:opacity-100"
                            }`}
                          >
                            <Image src={img} alt="" fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Tailles */}
                    {hasSizes && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => selectSize(product.id, size)}
                            className={`px-3 py-1 text-xs border rounded-lg transition ${
                              currentSize === size
                                ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                                : "border-[#1e3a5f] hover:border-[#3b82f6]"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex items-baseline gap-2">
                      <span className="text-2xl font-light">{product.price.toFixed(2)} TND</span>
                      <span className="text-sm line-through text-[#4a6a8a]">
                        {(product.price * 1.2).toFixed(2)} TND
                      </span>
                      <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        -20%
                      </span>
                    </div>

                    {sizeRequiredButMissing && (
                      <p className="text-amber-500 text-xs mt-2">Veuillez choisir une taille</p>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => addToCart(product.id, currentSize)}
                        disabled={actionsDisabled}
                        className="py-3 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-gray-700 rounded-2xl text-sm font-medium transition"
                      >
                        Ajouter
                      </button>
                      <button
                        onClick={() => handleBuyNow(product, currentSize)}
                        className="py-3 border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded-2xl text-sm font-medium transition"
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
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center">Chargement...</div>}>
      <CatalogueInner />
    </Suspense>
  );
}