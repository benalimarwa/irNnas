// app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  MapPin, 
  Truck, 
  Store,
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  X,
  Phone,
  User,
  CreditCard
} from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  perfume: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
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

type DeliveryMethod = "PICKUP" | "DELIVERY";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("DELIVERY");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

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
        if (!data.items || data.items.length === 0) {
          router.push("/cart");
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim() || !form.phone.trim()) {
      showAlert("warning", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (deliveryMethod === "DELIVERY" && (!form.address.trim() || !form.city.trim())) {
      showAlert("warning", "Veuillez remplir l'adresse de livraison");
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          customerInfo: {
            name: form.name,
            phone: form.phone,
            address: deliveryMethod === "DELIVERY" ? form.address : null,
            city: deliveryMethod === "DELIVERY" ? form.city : null,
            postalCode: deliveryMethod === "DELIVERY" ? form.postalCode : null,
            notes: form.notes || null,
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert("success", "Commande passée avec succès !");
        setTimeout(() => {
          router.push(`/client/orders/${data.orderId}`);
        }, 1500);
      } else {
        showAlert("error", data.error || "Erreur lors de la création de la commande");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.perfume.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
  const total = subtotal + deliveryFee;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Chargement...</p>
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
            href="/cart" 
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold mb-6 transition"
          >
            <ArrowLeft size={20} />
            Retour au panier
          </Link>
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Finaliser la commande
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Méthode de livraison */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Truck className="text-purple-600 dark:text-purple-400" />
                Mode de livraison
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("DELIVERY")}
                  className={`p-6 rounded-2xl border-2 transition text-left ${
                    deliveryMethod === "DELIVERY"
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <Truck className={`w-8 h-8 mb-3 ${
                    deliveryMethod === "DELIVERY" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
                  }`} />
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Livraison à domicile</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Recevez votre commande chez vous</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">7.00 TND</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("PICKUP")}
                  className={`p-6 rounded-2xl border-2 transition text-left ${
                    deliveryMethod === "PICKUP"
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
                  }`}
                >
                  <Store className={`w-8 h-8 mb-3 ${
                    deliveryMethod === "PICKUP" ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
                  }`} />
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Retrait en magasin</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Récupérez votre commande sur place</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Gratuit</p>
                </button>
              </div>
            </div>

            {/* Informations client */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <User className="text-purple-600 dark:text-purple-400" />
                Vos informations
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                {deliveryMethod === "DELIVERY" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Adresse de livraison *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="123 Rue Example"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Ville *
                        </label>
                        <input
                          type="text"
                          required
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Tunis"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Code postal
                        </label>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="1000"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none transition resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Instructions de livraison, préférences..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 sticky top-24">
              <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100">Résumé</h2>

              {/* Articles */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
                      {item.perfume.imageUrl ? (
                        <img
                          src={item.perfume.imageUrl}
                          alt={item.perfume.name}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">💐</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.perfume.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.perfume.house.name}</p>
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {item.quantity} × {item.perfume.price.toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-3 text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex justify-between">
                  <span>Sous-total ({totalItems} article{totalItems > 1 ? "s" : ""})</span>
                  <span className="font-bold">{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="font-bold">{deliveryFee.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-purple-600 dark:text-purple-400">{total.toFixed(2)} TND</span>
                </div>
              </div>

              {/* Bouton commander */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={processing}
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black py-5 rounded-2xl text-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    Commander
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                🔒 Paiement à la livraison / au retrait
              </p>
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