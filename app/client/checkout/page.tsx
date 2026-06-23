'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Truck, Store, CheckCircle, XCircle, AlertCircle, X, User, CreditCard, MapPin } from "lucide-react";

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
    show: false,
    type: "success",
    message: "",
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
      } else {
        showAlert("error", "Erreur lors du chargement du panier");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      showAlert("error", "Impossible de charger le panier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSubmit = async () => {
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
    } catch (err) {
      console.error("Order submit error:", err);
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
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
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
          font-size: clamp(2.4rem, 5vw, 4.5rem);
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
          color: #F8F6F2;
          outline: none;
          width: 100%;
        }

        .input-field:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.15);
        }

        .checkout-alert {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          padding: 16px 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          font-size: 1rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .delivery-btn {
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #F8F6F2;
          width: 100%;
        }

        .delivery-btn:hover {
          border-color: rgba(255,255,255,0.3);
        }

        .delivery-btn.active {
          border-color: #D4AF37;
          background: rgba(212,175,55,0.1);
        }

        .confirm-btn {
          margin-top: 2.5rem;
          width: 100%;
          background: linear-gradient(135deg, #D4AF37, #F5E6A3);
          color: #000;
          font-weight: 600;
          padding: 1.25rem;
          border-radius: 1rem;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          border: none;
          cursor: pointer;
          transition: filter 0.2s ease;
        }

        .confirm-btn:hover:not(:disabled) {
          filter: brightness(1.1);
        }

        .confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .glass-card {
            padding: 1.75rem !important;
          }
          .delivery-btn {
            padding: 1.5rem !important;
          }
          h2 {
            font-size: 1.6rem !important;
          }
          .input-field {
            padding: 1rem 1.125rem !important;
            font-size: 1rem !important;
          }
        }
      `}</style>

      {/* Alert */}
      {alert.show && (
        <div className={`checkout-alert ${alert.type}`}>
          {alert.type === "success" && <CheckCircle size={20} />}
          {alert.type === "error" && <XCircle size={20} />}
          {alert.type === "warning" && <AlertCircle size={20} />}
          {alert.message}
          <button
            type="button"
            onClick={() => setAlert({ ...alert, show: false })}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="checkout-page min-h-screen relative overflow-hidden">
        {/* Background dot grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            opacity: 0.1,
            backgroundImage: "radial-gradient(#D4AF37 0.8px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          {/* Back link */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/client/panier"
              className="text-[#D4AF37] flex items-center gap-2 hover:text-white transition-colors"
            >
              <ArrowLeft size={22} />
              Retour au panier
            </Link>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Main Grid - RESPONSIVE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-8">
              {/* Delivery Method */}
              <div className="glass-card rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-4">
                  <Truck color="#D4AF37" size={28} />
                  Mode de livraison
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("DELIVERY")}
                    className={`delivery-btn ${deliveryMethod === "DELIVERY" ? "active" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Truck size={32} color={deliveryMethod === "DELIVERY" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span className="text-sm font-semibold text-[#D4AF37]">{DELIVERY_FEE} TND</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Livraison à domicile</h3>
                    <p className="text-sm text-white/60">Votre commande vous sera livrée directement</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("PICKUP")}
                    className={`delivery-btn ${deliveryMethod === "PICKUP" ? "active" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <Store size={32} color={deliveryMethod === "PICKUP" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span className="text-sm font-semibold text-[#6ee7b7]">Gratuit</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Retrait en magasin</h3>
                    <p className="text-sm text-white/60">Venez récupérer votre commande sur place</p>
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="glass-card rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-4">
                  <User color="#D4AF37" size={28} />
                  Informations personnelles
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Nom complet *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field px-5 py-4 rounded-2xl text-base"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field px-5 py-4 rounded-2xl text-base"
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>

                  {deliveryMethod === "DELIVERY" && (
                    <>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">Adresse complète *</label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="input-field px-5 py-4 rounded-2xl text-base"
                          placeholder="Rue, numéro, immeuble..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Ville *</label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className="input-field px-5 py-4 rounded-2xl text-base"
                            placeholder="Tunis"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-2">Code postal</label>
                          <input
                            type="text"
                            value={form.postalCode}
                            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                            className="input-field px-5 py-4 rounded-2xl text-base"
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm text-white/60 mb-2">Notes / Instructions</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                      className="input-field px-5 py-4 rounded-2xl text-base resize-none"
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 md:p-10 sticky top-6 lg:top-8">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-3">
                  <ShoppingBag color="#D4AF37" size={28} />
                  Résumé de la commande
                </h2>

                <div className="space-y-6 mb-10 max-h-[420px] overflow-y-auto pr-2 custom-scroll">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-4">
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
                    <span className={deliveryFee === 0 ? "text-[#6ee7b7]" : ""}>
                      {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} TND`}
                    </span>
                  </div>

                  <div className="flex justify-between text-2xl font-bold pt-6 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#D4AF37]">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={processing}
                  className="confirm-btn"
                >
                  {processing ? (
                    <>Traitement en cours...</>
                  ) : (
                    <>
                      <CreditCard size={22} />
                      Confirmer la commande
                    </>
                  )}
                </button>

                <p className="text-center text-white/40 text-sm mt-4">
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