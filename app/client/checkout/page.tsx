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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0A" }}>
        <div style={{ color: "#D4AF37", fontSize: "1.5rem" }}>Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
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
          color: #F8F6F2;
          outline: none;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.3);
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
        .checkout-alert.success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #6ee7b7; }
        .checkout-alert.error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.4);  color: #fca5a5; }
        .checkout-alert.warning { background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.4); color: #fcd34d; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
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
      `}</style>

      {/* Alert */}
      {alert.show && (
        <div className={`checkout-alert ${alert.type}`}>
          {alert.type === "success" && <CheckCircle size={20} />}
          {alert.type === "error"   && <XCircle size={20} />}
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
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, opacity: 0.1,
          backgroundImage: "radial-gradient(#D4AF37 0.8px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem 6rem", position: "relative", zIndex: 10 }}>

          {/* Back link */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem" }}>
            <Link href="/client/panier" style={{ color: "#D4AF37", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", transition: "color 0.2s" }}>
              <ArrowLeft size={22} /> Retour au panier
            </Link>
            <div style={{ height: "1px", flex: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "2.5rem", marginTop: "2rem" }}>

            {/* Left column */}
            <div style={{ gridColumn: "span 7", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

              {/* Delivery method */}
              <div className="glass-card" style={{ borderRadius: "1.5rem", padding: "2.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Truck color="#D4AF37" size={28} />
                  Mode de livraison
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("DELIVERY")}
                    className={`delivery-btn${deliveryMethod === "DELIVERY" ? " active" : ""}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <Truck size={32} color={deliveryMethod === "DELIVERY" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#D4AF37" }}>{DELIVERY_FEE} TND</span>
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Livraison à domicile</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Votre commande vous sera livrée directement</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod("PICKUP")}
                    className={`delivery-btn${deliveryMethod === "PICKUP" ? " active" : ""}`}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                      <Store size={32} color={deliveryMethod === "PICKUP" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#6ee7b7" }}>Gratuit</span>
                    </div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Retrait en magasin</h3>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>Venez récupérer votre commande sur place</p>
                  </button>
                </div>
              </div>

              {/* Customer info */}
              <div className="glass-card" style={{ borderRadius: "1.5rem", padding: "2.5rem" }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <User color="#D4AF37" size={28} />
                  Informations personnelles
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field"
                        style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", boxSizing: "border-box" }}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field"
                        style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", boxSizing: "border-box" }}
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>

                  {deliveryMethod === "DELIVERY" && (
                    <>
                      <div>
                        <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                          Adresse complète *
                        </label>
                        <input
                          type="text"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          className="input-field"
                          style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", boxSizing: "border-box" }}
                          placeholder="Rue, numéro, immeuble..."
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                          <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                            Ville *
                          </label>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                            className="input-field"
                            style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", boxSizing: "border-box" }}
                            placeholder="Tunis"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                            Code postal
                          </label>
                          <input
                            type="text"
                            value={form.postalCode}
                            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                            className="input-field"
                            style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", boxSizing: "border-box" }}
                            placeholder="1000"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", display: "block", marginBottom: "0.5rem" }}>
                      Notes / Instructions
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                      className="input-field"
                      style={{ width: "100%", padding: "1rem 1.25rem", borderRadius: "0.75rem", fontSize: "1rem", resize: "none", boxSizing: "border-box" }}
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — Order summary */}
            <div style={{ gridColumn: "span 5" }}>
              <div className="glass-card" style={{ borderRadius: "1.5rem", padding: "2.5rem", position: "sticky", top: "2rem" }}>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <ShoppingBag color="#D4AF37" /> Résumé de la commande
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem", maxHeight: "420px", overflowY: "auto", paddingRight: "0.5rem" }}>
                  {cart.items.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "1.25rem" }}>
                      <div style={{ width: "5rem", height: "5rem", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
                        <img
                          src={item.product.images[0] || "/placeholder.jpg"}
                          alt={item.product.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 600, fontSize: "1.05rem", lineHeight: 1.3 }}>{item.product.name}</h4>
                        {item.size && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem" }}>Taille : {item.size}</p>}
                        <p style={{ color: "#D4AF37", fontWeight: 500, marginTop: "0.25rem" }}>
                          {item.quantity} × {item.product.price} TND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Sous-total</span>
                    <span>{subtotal.toFixed(2)} TND</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem" }}>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Livraison</span>
                    <span style={{ color: deliveryFee === 0 ? "#6ee7b7" : undefined }}>
                      {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} TND`}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.75rem", fontWeight: 700, paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <span>Total</span>
                    <span style={{ color: "#D4AF37" }}>{total.toFixed(2)} TND</span>
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

                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", marginTop: "1.25rem" }}>
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