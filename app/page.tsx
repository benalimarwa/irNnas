// app/catalog/page.tsx  (ou app/page.tsx pour la home)
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ShoppingCart, Search, SlidersHorizontal, X, Check, Filter } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  gender: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
  sizes: string[];
  material?: string;
  fit?: string;
  isNew: boolean;
  stockStatus: string;
  category: string;
  originalPrice?: number; // for sale display
};

type CartCount = number;

type AlertType = {
  show: boolean;
  productId: number | null;
  message: string;
  type: "success" | "error" | "auth";
};

const CATEGORIES = ["Tous", "pantalon", "pull", "veste", "chemise", "accessoire", "parfum"];
const GENDERS = ["Tous", "men", "women", "unisex"];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState<CartCount>(0);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertType>({ show: false, productId: null, message: "", type: "success" });
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedGender, setSelectedGender] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const showAlert = (type: AlertType["type"], message: string, productId: number | null = null) => {
    setAlert({ show: true, productId, message, type });
    setTimeout(() => setAlert({ show: false, productId: null, message: "", type: "success" }), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "Tous") params.set("category", selectedCategory);
      if (selectedGender !== "Tous") params.set("gender", selectedGender);
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      console.error("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedGender, searchQuery]);

  const fetchCartCount = async () => {
    try {
      const res = await fetch("/api/cart/count");
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.count);
        setIsAuthenticated(true);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        setCartCount(0);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = async (product: Product) => {
    // Check auth first
    if (isAuthenticated === false) {
      showAlert("auth", "Connectez-vous pour ajouter au panier", product.id);
      return;
    }

    if (product.stock === 0 || product.stockStatus === "OUT_OF_STOCK") {
      showAlert("error", "Produit épuisé", product.id);
      return;
    }

    setAddingToCart(product.id);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          size: product.sizes?.[0] || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert("success", "Ajouté au panier !", product.id);
        setCartCount((prev) => prev + 1);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
        showAlert("auth", "Connectez-vous pour ajouter au panier", product.id);
      } else {
        showAlert("error", data.error || "Erreur lors de l'ajout", product.id);
      }
    } catch {
      showAlert("error", "Erreur réseau", product.id);
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts = products; // Filtering done server-side

  const isSale = (product: Product) => product.originalPrice && product.originalPrice > product.price;
  const isOutOfStock = (product: Product) => product.stockStatus === "OUT_OF_STOCK" || product.stock === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Cart Button */}
      <Link href="/client/panier" className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <div className="w-16 h-16 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105">
            <ShoppingCart size={26} className="text-white" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </div>
      </Link>

      {/* Filter FAB */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-24 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 hover:scale-105"
      >
        <Filter size={24} className="text-white" />
      </button>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="w-80 bg-white h-full overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Recherche
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nom du produit..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Catégorie
              </label>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition font-medium ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="capitalize">{cat}</span>
                    {selectedCategory === cat && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Genre
              </label>
              <div className="flex flex-col gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGender(g)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-left transition font-medium ${
                      selectedGender === g
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span className="capitalize">{g === "Tous" ? "Tous" : g === "men" ? "Homme" : g === "women" ? "Femme" : "Unisexe"}</span>
                    {selectedGender === g && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory("Tous");
                setSelectedGender("Tous");
                setSearchQuery("");
              }}
              className="w-full py-3 border-2 border-slate-300 rounded-2xl font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Produits</h1>
          <div className="mt-3 h-px bg-slate-200" />
        </div>

        {/* Active filters indicator */}
        {(selectedCategory !== "Tous" || selectedGender !== "Tous" || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategory !== "Tous" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full text-sm font-medium">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("Tous")}><X size={14} /></button>
              </span>
            )}
            {selectedGender !== "Tous" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full text-sm font-medium">
                {selectedGender}
                <button onClick={() => setSelectedGender("Tous")}><X size={14} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 text-white rounded-full text-sm font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")}><X size={14} /></button>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-24">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <p className="mt-4 text-slate-400">Chargement...</p>
          </div>
        )}

        {/* Product List */}
        {!loading && (
          <div className="flex flex-col gap-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl font-bold text-slate-400">Aucun produit trouvé</p>
                <p className="text-slate-400 mt-2">Essayez d'autres filtres</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const imageUrl = product.images?.[0];
                const isAdding = addingToCart === product.id;
                const outOfStock = isOutOfStock(product);
                const onSale = isSale(product);
                const alertForThis = alert.show && alert.productId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 mb-6 rounded-sm overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
                      {/* Sale badge */}
                      {onSale && (
                        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-sm">
                          Sale!
                        </div>
                      )}
                      {/* New badge */}
                      {product.isNew && !onSale && (
                        <div className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-sm font-bold px-3 py-1 rounded-sm">
                          Nouveau
                        </div>
                      )}
                      {/* Out of stock overlay */}
                      {outOfStock && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                          <span className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-sm">
                            Épuisé
                          </span>
                        </div>
                      )}

                      <Link href={`/catalog/${product.id}`}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-8xl bg-slate-100">
                            🛍️
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <Link href={`/catalog/${product.id}`}>
                        <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition">
                          {product.name}
                        </h2>
                      </Link>

                      {/* Price */}
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-bold text-slate-900">
                          {product.price.toFixed(3)} د.ت
                        </span>
                        {onSale && product.originalPrice && (
                          <span className="text-lg text-slate-400 line-through">
                            {product.originalPrice.toFixed(3)} د.ت
                          </span>
                        )}
                      </div>

                      {/* Alert for this product */}
                      {alertForThis && (
                        <div className={`mb-3 px-4 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 ${
                          alert.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          alert.type === "auth" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {alert.type === "success" && <Check size={16} />}
                          {alert.message}
                          {alert.type === "auth" && (
                            <Link href="/sign-in" className="underline font-bold ml-1">
                              Se connecter
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdding || outOfStock}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-full font-bold text-base tracking-wide transition-all duration-200 ${
                          outOfStock
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : isAdding
                            ? "bg-slate-700 text-white"
                            : "bg-slate-800 hover:bg-slate-900 text-white active:scale-95"
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Ajout...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={20} />
                            AJOUTER
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}