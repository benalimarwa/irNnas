// app/catalog/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Home, ShoppingCart, CheckCircle, AlertCircle, XCircle, X, Filter } from "lucide-react";

type House = {
  id: number;
  name: string;
};

type Perfume = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  house: House;
  style: string[];
  stock: number;
};

type AlertType = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
};

export default function ClientCatalogPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const fetchPerfumes = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    
    const res = await fetch(`/api/perfumes/filter?${params}`);
    const data = await res.json();
    setPerfumes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPerfumes();
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = async (perfumeId: number) => {
    setAddingToCart(perfumeId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfumeId, quantity: 1 }),
      });

      if (res.ok) {
        showAlert("success", "Parfum ajouté au panier !");
      } else {
        const error = await res.json();
        showAlert("error", error.error || "Erreur lors de l'ajout au panier");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau");
    } finally {
      setAddingToCart(null);
    }
  };

  const grouped = perfumes.reduce((acc, p) => {
    const house = p.house.name;
    if (!acc[house]) acc[house] = [];
    acc[house].push(p);
    return acc;
  }, {} as Record<string, Perfume[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-20 transition-colors duration-300">
      
      {/* ALERTE */}
      {alert.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`
            relative max-w-md w-full rounded-2xl shadow-2xl p-6 
            transform animate-in zoom-in-95 duration-300
            ${alert.type === "success" ? "bg-gradient-to-br from-green-500 to-emerald-600" : ""}
            ${alert.type === "error" ? "bg-gradient-to-br from-red-500 to-rose-600" : ""}
            ${alert.type === "warning" ? "bg-gradient-to-br from-amber-500 to-orange-600" : ""}
          `}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {alert.type === "success" && <CheckCircle className="w-8 h-8 text-white" />}
                {alert.type === "error" && <XCircle className="w-8 h-8 text-white" />}
                {alert.type === "warning" && <AlertCircle className="w-8 h-8 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {alert.type === "success" && "Succès !"}
                  {alert.type === "error" && "Erreur"}
                  {alert.type === "warning" && "Attention"}
                </h3>
                <p className="text-white/90 text-base">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert({ ...alert, show: false })}
                className="flex-shrink-0 text-white/80 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
              <div className="h-full bg-white/50 animate-progress" style={{ animation: "progress 3s linear" }} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">

        {/* Header Client */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
            Notre Collection
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Découvrez nos parfums d'exception
          </p>
        </div>

        {/* Filtres et Recherche */}
        <div className="max-w-4xl mx-auto mb-12 space-y-6">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un parfum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-5 rounded-full border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg shadow-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Filtres par catégorie */}
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <Filter className="text-gray-500" size={20} />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-3 rounded-full font-bold transition ${
                selectedCategory === "all"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedCategory("women")}
              className={`px-6 py-3 rounded-full font-bold transition ${
                selectedCategory === "women"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
              }`}
            >
              Femme
            </button>
            <button
              onClick={() => setSelectedCategory("men")}
              className={`px-6 py-3 rounded-full font-bold transition ${
                selectedCategory === "men"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
              }`}
            >
              Homme
            </button>
            <button
              onClick={() => setSelectedCategory("unisex")}
              className={`px-6 py-3 rounded-full font-bold transition ${
                selectedCategory === "unisex"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700"
              }`}
            >
              Unisexe
            </button>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
            <p className="text-2xl text-gray-500 dark:text-gray-400 mt-6">Chargement...</p>
          </div>
        ) : perfumes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500 dark:text-gray-400 mb-4">Aucun parfum trouvé</p>
            <p className="text-lg text-gray-400 dark:text-gray-500">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([house, items]) => (
            <div key={house} className="mb-16">
              <h2 className="text-4xl font-black mb-8 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <Home className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                {house}
                <span className="text-xl font-normal text-gray-500 dark:text-gray-400">
                  ({items.length} {items.length > 1 ? 'parfums' : 'parfum'})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-80 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                          💐
                        </div>
                      )}
                      {/* Badge catégorie */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                          p.category === 'women' ? 'bg-pink-500' :
                          p.category === 'men' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}>
                          {p.category === 'women' ? 'Femme' : p.category === 'men' ? 'Homme' : 'Unisexe'}
                        </span>
                      </div>
                      {/* Badge stock faible */}
                      {p.stock > 0 && p.stock <= 5 && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500 text-white shadow-lg animate-pulse">
                            Stock limité
                          </span>
                        </div>
                      )}
                      {/* Badge rupture */}
                      {p.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="px-6 py-3 rounded-full text-lg font-bold bg-red-500 text-white shadow-lg">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 line-clamp-2 min-h-[3.5rem]">
                        {p.name}
                      </h3>
                      
                      {/* Styles */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.style.slice(0, 3).map((s, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {p.style.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                            +{p.style.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Prix */}
                      <p className="text-3xl font-black text-purple-700 dark:text-purple-400 mb-4">
                        {p.price.toFixed(2)} TND
                      </p>

                      {/* Bouton Ajouter au Panier */}
                      <button
                        onClick={() => handleAddToCart(p.id)}
                        disabled={addingToCart === p.id || p.stock === 0}
                        className={`
                          w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300
                          ${p.stock === 0 
                            ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-xl active:scale-95"
                          }
                          ${addingToCart === p.id ? "opacity-50 cursor-wait" : ""}
                        `}
                      >
                        <ShoppingCart size={20} />
                        {addingToCart === p.id ? "Ajout en cours..." : p.stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress 3s linear;
        }
      `}</style>
    </div>
  );
}