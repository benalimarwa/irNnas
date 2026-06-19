'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Truck, Store, CheckCircle,
  XCircle, AlertCircle, X, User, CreditCard, MapPin
} from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  size: string | null;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
    category: string;
  };
};

type DeliveryMethod = "PICKUP" | "DELIVERY";

const DELIVERY_FEE = 7;

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; type: string; message: string }>({
    show: false, type: "success", message: ""
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
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
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3000);
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        if (!data.items?.length) router.push("/client/panier");
      }
    } catch {
      showAlert("error", "Impossible de charger le panier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      showAlert("warning", "Nom et téléphone sont obligatoires");
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
          deliveryFee: deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0,
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
        showAlert("success", "Commande confirmée avec succès !");
        setTimeout(() => router.push(`/client/orders/${data.orderId}`), 1500);
      } else {
        showAlert("error", data.error || "Erreur lors de la commande");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#D4AF37] text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');

        .checkout-page {
          font-family: 'Instrument Sans', system-ui, sans-serif;
          background: #0A0A0A;
          color: #F8F6F2;
        }

        .glass-card {
          background: rgba(17, 17, 17, 0.85);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.8rem, 5vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .gradient-text {
          background: linear-gradient(135deg, #D4AF37, #F5E6A3);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.15);
        }
      `}</style>

      <div className="checkout-page min-h-screen relative overflow-hidden">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
          {/* Header */}
          <div className="flex items-center gap-4 mb-12">
            <Link href="/client/panier" className="text-[#D4AF37] hover:text-white flex items-center gap-2 transition">
              <ArrowLeft size={22} /> Retour au panier
            </Link>
            <div className="h-px flex-1 bg-white/10" />
          </div>

         
          <div className="grid lg:grid-cols-12 gap-10 mt-16">
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-10">
              {/* Delivery Method */}
              <div className="glass-card rounded-3xl p-10">
                <h2 className="text-3xl font-semibold tracking-tight mb-8 flex items-center gap-4">
                  <Truck className="text-[#D4AF37]" size={32} />
                  Mode de livraison
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setDeliveryMethod("DELIVERY")}
                    className={`p-8 rounded-3xl border transition-all text-left group ${
                      deliveryMethod === "DELIVERY"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Truck size={36} className={deliveryMethod === "DELIVERY" ? "text-[#D4AF37]" : "text-white/40"} />
                      <span className="text-sm font-semibold text-[#D4AF37]">{DELIVERY_FEE} TND</span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Livraison à domicile</h3>
                    <p className="text-white/60">Votre commande vous sera livrée directement</p>
                  </button>

                  <button
                    onClick={() => setDeliveryMethod("PICKUP")}
                    className={`p-8 rounded-3xl border transition-all text-left group ${
                      deliveryMethod === "PICKUP"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Store size={36} className={deliveryMethod === "PICKUP" ? "text-[#D4AF37]" : "text-white/40"} />
                      <span className="text-sm font-semibold text-emerald-400">Gratuit</span>
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Retrait en magasin</h3>
                    <p className="text-white/60">Venez récupérer votre commande sur place</p>
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="glass-card rounded-3xl p-10">
                <h2 className="text-3xl font-semibold tracking-tight mb-8 flex items-center gap-4">
                  <User className="text-[#D4AF37]" size={32} />
                  Informations personnelles
                </h2>

                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Nom complet *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl text-lg"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-white/60 mb-2 block">Téléphone *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field w-full px-6 py-4 rounded-2xl text-lg"
                        placeholder="+216 XX XXX XXX"
                        required
                      />
                    </div>
                  </div>

                  {deliveryMethod === "DELIVERY" && (
                    <>
                      <div>
                        <label className="text-sm text-white/60 mb-2 block">Adresse complète *</label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="input-field w-full px-6 py-4 rounded-2xl text-lg"
                          placeholder="Rue, numéro, immeuble..."
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm text-white/60 mb-2 block">Ville *</label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className="input-field w-full px-6 py-4 rounded-2xl text-lg"
                            placeholder="Tunis"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/60 mb-2 block">Code postal</label>
                          <input
                            type="text"
                            value={form.postalCode}
                            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                            className="input-field w-full px-6 py-4 rounded-2xl text-lg"
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Notes / Instructions</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                      className="input-field w-full px-6 py-4 rounded-2xl text-lg resize-none"
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-10 sticky top-8">
                <h2 className="text-3xl font-semibold mb-8 flex items-center gap-3">
                  <ShoppingBag className="text-[#D4AF37]" /> Résumé de la commande
                </h2>

                <div className="space-y-6 mb-10 max-h-[420px] overflow-y-auto pr-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-5">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0">
                        <img
                          src={item.product.images[0] || "/placeholder.jpg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg leading-tight">{item.product.name}</h4>
                        {item.size && <p className="text-white/50 text-sm">Taille : {item.size}</p>}
                        <p className="text-[#D4AF37] font-medium mt-1">
                          {item.quantity} × {item.product.price} TND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-8 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-white/70">Sous-total</span>
                    <span>{subtotal.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-white/70">Livraison</span>
                    <span className={deliveryFee === 0 ? "text-emerald-400" : ""}>
                      {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} TND`}
                    </span>
                  </div>
                  <div className="flex justify-between text-3xl font-bold pt-6 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubmit()}
                  disabled={processing}
                  className="mt-10 w-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black font-semibold py-5 rounded-2xl text-xl flex items-center justify-center gap-3 hover:brightness-110 transition disabled:opacity-70"
                >
                  {processing ? (
                    <>Traitement en cours...</>
                  ) : (
                    <>
                      <CreditCard size={24} />
                      Confirmer la commande
                    </>
                  )}
                </button>

                <p className="text-center text-white/50 text-sm mt-6">
                  Paiement à la livraison • Sécurisé
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}