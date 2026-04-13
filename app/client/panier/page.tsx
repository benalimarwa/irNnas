// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  perfume: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
    stock: number;
    house: { name: string };
  };
};

type Cart = {
  items: CartItem[];
};

type AlertType = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
};

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        showAlert("error", "Erreur lors du chargement du panier");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (perfumeId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItem(perfumeId);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfumeId, quantity: newQuantity }),
      });

      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      } else {
        showAlert("error", data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeFromCart = async (perfumeId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cet article ?")) return;

    setUpdatingItem(perfumeId);
    try {
      const res = await fetch(`/api/cart?perfumeId=${perfumeId}`, { 
        method: "DELETE" 
      });

      const data = await res.json();

      if (res.ok) {
        showAlert("success", "Article retiré du panier");
        setCart(data.cart);
      } else {
        showAlert("error", data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau");
    } finally {
      setUpdatingItem(null);
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.perfume.price * item.quantity, 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 px-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
            <ShoppingBag size={120} className="mx-auto text-purple-300 dark:text-purple-600 mb-6" />
            <h1 className="text-4xl font-black mb-4 text-gray-900 dark:text-gray-100">Votre panier est vide</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Découvrez notre collection de parfums exceptionnels
            </p>
            <Link 
              href="/catalogue" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition shadow-xl"
            >
              <ArrowLeft size={24} />
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-20 px-6">
      
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

      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <Link 
            href="/catalogue" 
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold mb-6 transition"
          >
            <ArrowLeft size={20} />
            Retour au catalogue
          </Link>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Mon Panier
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
            {totalItems} article{totalItems > 1 ? "s" : ""} dans votre panier
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-6">
            {cart.items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition relative overflow-hidden"
              >
                {updatingItem === item.perfume.id && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl overflow-hidden">
                    {item.perfume.imageUrl ? (
                      <img
                        src={item.perfume.imageUrl}
                        alt={item.perfume.name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        💐
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
                      {item.perfume.name}
                    </h3>
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-4">
                      {item.perfume.house.name}
                    </p>

                    {/* Quantité et prix */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.perfume.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItem === item.perfume.id}
                          className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center font-bold"
                        >
                          <Minus size={18} />
                        </button>
                        
                        <span className="text-2xl font-black min-w-[3rem] text-center text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateQuantity(item.perfume.id, item.quantity + 1)}
                          disabled={item.quantity >= item.perfume.stock || updatingItem === item.perfume.id}
                          className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center font-bold"
                        >
                          <Plus size={18} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl font-black text-purple-700 dark:text-purple-400">
                          {(item.perfume.price * item.quantity).toFixed(2)} TND
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.perfume.price.toFixed(2)} TND / unité
                        </p>
                      </div>
                    </div>

                    {/* Stock warning */}
                    {item.quantity >= item.perfume.stock && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <AlertCircle size={16} />
                        Stock maximum atteint ({item.perfume.stock} disponible{item.perfume.stock > 1 ? "s" : ""})
                      </p>
                    )}
                  </div>

                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeFromCart(item.perfume.id)}
                    disabled={updatingItem === item.perfume.id}
                    className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="text-red-600 dark:text-red-400" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl p-8 shadow-2xl sticky top-24">
              <h2 className="text-3xl font-black mb-8">Récapitulatif</h2>
              
              <div className="space-y-4 text-lg mb-6">
                <div className="flex justify-between">
                  <span>Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
                  <span className="font-bold">{total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="font-bold">Calculée à la caisse</span>
                </div>
              </div>

              <div className="border-t border-white/30 pt-6 mb-8">
                <div className="flex justify-between font-black text-2xl">
                  <span>Total</span>
                  <span>{total.toFixed(2)} TND</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block text-center bg-white text-purple-600 font-black py-5 rounded-2xl text-xl hover:scale-105 transition shadow-lg mb-4"
              >
                Passer commande
              </Link>

              <Link
                href="/catalogue"
                className="block text-center bg-white/20 backdrop-blur text-white font-bold py-4 rounded-2xl text-lg hover:bg-white/30 transition"
              >
                Continuer mes achats
              </Link>

              {/* Info sécurité */}
              <div className="mt-8 pt-6 border-t border-white/30">
                <p className="text-sm text-white/80 text-center">
                  🔒 Paiement 100% sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>
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