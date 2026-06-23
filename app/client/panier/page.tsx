// app/client/panier/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trash2, ShoppingBag, Plus, Minus, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, X,
} from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  size: string;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    stock: number;
    category: string;
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
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3000);
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
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: number, size: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const key = `${productId}-${size}`;
    setUpdatingItem(key);

    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQuantity, size }),
      });

      const data = await res.json();

      if (res.ok) {
        setCart(data.cart);
      } else {
        showAlert("error", data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeFromCart = async (productId: number, size: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cet article ?")) return;

    const key = `${productId}-${size}`;
    setUpdatingItem(key);

    try {
      const res = await fetch(
        `/api/cart?productId=${productId}&size=${encodeURIComponent(size)}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (res.ok) {
        showAlert("success", "Article retiré du panier");
        setCart(data.cart);
      } else {
        showAlert("error", data.error || "Erreur lors de la suppression");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setUpdatingItem(null);
    }
  };

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          <p className="mt-6 text-lg text-slate-400">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pt-24 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-3xl p-12 md:p-16">
            <ShoppingBag size={80} className="mx-auto text-slate-500 mb-8" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Votre panier est vide</h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10">Découvrez nos collections exclusives</p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-8 md:px-10 py-5 rounded-3xl text-lg md:text-xl font-semibold hover:scale-105 transition"
            >
              Découvrir le catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 pb-20 overflow-x-hidden">
      {/* Alert */}
      {alert.show && (
        <div className="fixed top-6 right-4 md:right-6 z-50 max-w-sm w-full px-4">
          <div className={`rounded-3xl p-5 flex gap-4 shadow-2xl backdrop-blur-xl ${
            alert.type === "success" ? "bg-emerald-900/90 border border-emerald-700" :
            alert.type === "error" ? "bg-red-900/90 border border-red-700" : 
            "bg-amber-900/90 border border-amber-700"
          }`}>
            {alert.type === "success" && <CheckCircle className="text-emerald-400 mt-0.5 flex-shrink-0" size={28} />}
            {alert.type === "error" && <XCircle className="text-red-400 mt-0.5 flex-shrink-0" size={28} />}
            {alert.type === "warning" && <AlertCircle className="text-amber-400 mt-0.5 flex-shrink-0" size={28} />}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium break-words">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/70 hover:text-white flex-shrink-0">
              <X size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-24">
        {/* Header */}
        <div className="mb-10 md:mb-12">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition mb-6"
          >
            <ArrowLeft size={20} />
            Retour au catalogue
          </Link>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
            Mon Panier
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mt-3">
            {totalItems} article{totalItems > 1 ? "s" : ""} • {total.toFixed(2)} TND
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Liste des articles */}
          <div className="lg:col-span-8 space-y-6">
            {cart.items.map((item) => {
              const itemKey = `${item.product.id}-${item.size}`;
              const isUpdating = updatingItem === itemKey;
              const imageUrl = item.product.images?.[0];

              return (
                <div
                  key={item.id}
                  className="group relative bg-slate-900/70 backdrop-blur-xl border border-slate-700 hover:border-blue-500/30 rounded-3xl p-6 md:p-8 transition-all duration-300"
                >
                  {isUpdating && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-3xl">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0 bg-slate-950 rounded-2xl overflow-hidden border border-slate-700 mx-auto sm:mx-0">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-contain p-3 md:p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">👕</div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-xl md:text-2xl font-semibold text-white leading-tight">{item.product.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          disabled={isUpdating}
                          className="text-red-400 hover:text-red-500 transition p-2 -mr-2"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 mb-6">
                        <span className="text-blue-400 font-medium capitalize">{item.product.category}</span>
                        {item.size && (
                          <span className="px-4 py-1 bg-slate-800 rounded-full text-sm text-blue-400">
                            Taille : {item.size}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 justify-center sm:justify-start">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center transition"
                          >
                            <Minus size={18} />
                          </button>

                          <span className="text-3xl font-bold w-12 text-center">{item.quantity}</span>

                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || isUpdating}
                            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center transition"
                          >
                            <Plus size={18} />
                          </button>
                        </div>

                        <div className="text-center sm:text-right">
                          <p className="text-3xl md:text-4xl font-bold text-blue-400 tracking-tighter">
                            {(item.product.price * item.quantity).toFixed(2)} TND
                          </p>
                          <p className="text-slate-400 text-sm">
                            {item.product.price.toFixed(2)} TND / unité
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700 rounded-3xl p-6 md:p-10 sticky top-6 md:top-24">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Récapitulatif</h2>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-base md:text-lg">
                  <span className="text-slate-400">Sous-total</span>
                  <span className="font-semibold">{total.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-base md:text-lg">
                  <span className="text-slate-400">Livraison</span>
                  <span className="text-emerald-400">Calculée à la caisse</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-8 mb-10">
                <div className="flex justify-between text-2xl md:text-3xl font-bold">
                  <span>Total</span>
                  <span className="text-blue-400">{total.toFixed(2)} TND</span>
                </div>
              </div>

              <Link
                href="/client/checkout"
                className="block w-full text-center bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 py-5 rounded-3xl text-lg md:text-xl font-semibold transition mb-4"
              >
                Passer à la caisse
              </Link>

              <Link
                href="/client/catalog"
                className="block w-full text-center border border-slate-700 hover:bg-slate-800 py-4 rounded-3xl font-medium transition"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}