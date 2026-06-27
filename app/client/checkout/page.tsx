'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Truck, Store, CheckCircle,
  XCircle, AlertCircle, X, User, CreditCard, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const DELIVERY_FEE = 7;

/** Country list with dial codes — Tunisie first, then alphabetical */
const COUNTRIES = [
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie", dial: "+213", flag: "🇩🇿" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "LY", name: "Libye", dial: "+218", flag: "🇱🇾" },
  { code: "EG", name: "Égypte", dial: "+20",  flag: "🇪🇬" },
  { code: "FR", name: "France", dial: "+33",  flag: "🇫🇷" },
  { code: "BE", name: "Belgique", dial: "+32", flag: "🇧🇪" },
  { code: "DE", name: "Allemagne", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italie", dial: "+39",  flag: "🇮🇹" },
  { code: "ES", name: "Espagne", dial: "+34", flag: "🇪🇸" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
  { code: "US", name: "États-Unis", dial: "+1",  flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1",   flag: "🇨🇦" },
  { code: "SA", name: "Arabie Saoudite", dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "Émirats arabes unis", dial: "+971", flag: "🇦🇪" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Koweït", dial: "+965", flag: "🇰🇼" },
  { code: "TR", name: "Turquie", dial: "+90",  flag: "🇹🇷" },
  { code: "SE", name: "Suède", dial: "+46",   flag: "🇸🇪" },
  { code: "NL", name: "Pays-Bas", dial: "+31", flag: "🇳🇱" },
];

/** Tunisia governorates → cities */
const TUNISIA_DATA: Record<string, string[]> = {
  "Tunis": ["Tunis", "Le Bardo", "La Marsa", "Carthage", "Le Kram", "Sidi Bou Saïd", "La Goulette", "Ariana (ville)", "Ben Arous"],
  "Ariana": ["Ariana", "Raoued", "Kalâat el-Andalous", "Sidi Thabet", "Mnihla", "Ettadhamen", "Ghazela"],
  "Ben Arous": ["Ben Arous", "Mégrine", "Mourouj", "Hammam Lif", "Hammam Chott", "Bou Mhel el-Bassatine", "Ezzahra", "Radès", "Fouchana", "Mornag"],
  "Manouba": ["Manouba", "Oued Ellil", "Tébourba", "Djedeida", "El Battan", "Borj El Amri", "Douar Hicher", "Mornaguia"],
  "Nabeul": ["Nabeul", "Hammamet", "Kelibia", "Grombalia", "Soliman", "Menzel Bouzelfa", "Korba", "Beni Khalled", "Takelsa", "Haouaria"],
  "Zaghouan": ["Zaghouan", "Zriba", "Bir Mcherga", "El Fahs", "Nadhour", "Saouaf"],
  "Bizerte": ["Bizerte", "Menzel Bourguiba", "Mateur", "Ras Jebel", "Ghar El Melh", "El Alia", "Tinja", "Utique", "Sejnane"],
  "Béja": ["Béja", "Medjez el-Bab", "Testour", "Goubellat", "Téboursouk", "Thibar", "Nefza", "Amdoun"],
  "Jendouba": ["Jendouba", "Bou Salem", "Tabarka", "Aïn Draham", "Fernana", "Ghardimaou", "Balta-Bou Aouane", "Oued Mliz"],
  "Le Kef": ["Le Kef", "Dahmani", "Sers", "Tajerouine", "Kalaat Khasba", "Nebeur", "Sakiet Sidi Youssef", "El Ksour"],
  "Siliana": ["Siliana", "Bouarada", "Gaâfour", "El Krib", "Makthar", "Rouhia", "Kesra", "Bargou", "Sidi Morched"],
  "Sousse": ["Sousse", "Msaken", "Kalâa Kebira", "Sidi Bou Ali", "Hammam Sousse", "Akouda", "Kantaoui", "Enfidha"],
  "Monastir": ["Monastir", "Jemmal", "Ksar Hellal", "Bembla", "Sayada", "Téboulba", "Moknine", "Bekalta"],
  "Mahdia": ["Mahdia", "Ksour Essef", "El Jem", "Chebba", "Bou Merdes", "Melloulèche", "Sidi Alouane"],
  "Sfax": ["Sfax", "Sakiet Eddaier", "Sakiet Ezzit", "Chihia", "Agareb", "Djebeniana", "El Hencha", "Mahres", "Bir Ali Ben Khalifa", "Graïba", "Skhira"],
  "Kairouan": ["Kairouan", "Sbikha", "El Alaa", "Haffouz", "Bouhajla", "Oueslatia", "Nasrallah", "Cherarda"],
  "Kasserine": ["Kasserine", "Sbeitla", "Thala", "Haïdra", "Fériana", "Foussana", "Majel Bel Abbès", "Jedeliane"],
  "Sidi Bouzid": ["Sidi Bouzid", "Jilma", "Regueb", "Bir El Hafey", "Souk Jedid", "Mezzouna", "Meknassy", "Menzel Bouzaiane"],
  "Gabès": ["Gabès", "Mareth", "El Hamma", "Matmata", "Ghannouch", "Métouia", "Nouvelle Matmata"],
  "Médenine": ["Médenine", "Zarzis", "Houmt Souk (Djerba)", "Midoun", "Ben Gardane", "Beni Khedache", "Sidi Makhlouf"],
  "Tataouine": ["Tataouine", "Ghomrassen", "Remada", "Dehiba", "Bir Lahmar", "Smâr"],
  "Gafsa": ["Gafsa", "El Ksar", "Métlaoui", "Redeyef", "Mdhilla", "Sned", "Belkhir", "Sidi Aïch"],
  "Tozeur": ["Tozeur", "Nefta", "Hazoua", "Degache", "Tamaghza"],
  "Kébili": ["Kébili", "Douz", "Souk Lahad", "El Faouar", "Jemna"],
};

const GOVERNORATES = Object.keys(TUNISIA_DATA).sort();

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ show: boolean; type: string; message: string }>({
    show: false, type: "success", message: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");

  // Phone country selector state
  const [phoneCountry, setPhoneCountry] = useState(COUNTRIES[0]); // Tunisie default
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Address country
  const [addressCountry, setAddressCountry] = useState("TN");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
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

  useEffect(() => { fetchCart(); }, []);

  // Reset city when governorate changes
  useEffect(() => { setSelectedCity(""); }, [selectedGov]);
  // Reset governorate when address country changes
  useEffect(() => { setSelectedGov(""); setSelectedCity(""); }, [addressCountry]);

  const handleSubmit = async () => {
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showAlert("warning", "Prénom et nom sont obligatoires");
      return;
    }
    if (!form.phone.trim()) {
      showAlert("warning", "Le numéro de téléphone est obligatoire");
      return;
    }
    if (deliveryMethod === "DELIVERY") {
      if (addressCountry === "TN" && (!selectedGov || !selectedCity)) {
        showAlert("warning", "Veuillez sélectionner le gouvernorat et la ville");
        return;
      }
      if (addressCountry !== "TN" && !form.address.trim()) {
        showAlert("warning", "Veuillez remplir l'adresse de livraison");
        return;
      }
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
            name: fullName,
            phone: `${phoneCountry.dial} ${form.phone}`,
            address: deliveryMethod === "DELIVERY"
              ? (addressCountry === "TN"
                  ? `${form.address || ""}, ${selectedCity}, ${selectedGov}`.replace(/^,\s*/, "")
                  : form.address)
              : null,
            city: deliveryMethod === "DELIVERY"
              ? (addressCountry === "TN" ? selectedCity : null)
              : null,
            postalCode: deliveryMethod === "DELIVERY" ? (form.postalCode || null) : null,
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

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dial.includes(countrySearch)
  );

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

        .input-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
          color: #F8F6F2;
          outline: none;
          width: 100%;
          border-radius: 1rem;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          font-family: inherit;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .input-field:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.15);
        }

        /* Select styled like input */
        .select-field {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
          color: #F8F6F2;
          outline: none;
          width: 100%;
          border-radius: 1rem;
          padding: 1rem 2.5rem 1rem 1.25rem;
          font-size: 1rem;
          font-family: inherit;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }
        .select-field:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.15);
        }
        .select-field option {
          background: #1a1a1a;
          color: #F8F6F2;
        }
        .select-wrapper {
          position: relative;
        }
        .select-wrapper .chevron-icon {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: rgba(255,255,255,0.4);
        }

        /* Phone field composite */
        .phone-composite {
          display: flex;
          gap: 0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1rem;
          overflow: visible;
          background: rgba(255,255,255,0.05);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }
        .phone-composite:focus-within {
          border-color: #D4AF37;
          box-shadow: 0 0 0 4px rgba(212,175,55,0.15);
        }
        .phone-dial-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          border: none;
          background: rgba(255,255,255,0.06);
          color: #F8F6F2;
          cursor: pointer;
          white-space: nowrap;
          font-size: 0.9rem;
          font-family: inherit;
          border-radius: 1rem 0 0 1rem;
          border-right: 1px solid rgba(255,255,255,0.1);
          transition: background 0.2s;
          min-width: 110px;
        }
        .phone-dial-btn:hover { background: rgba(255,255,255,0.1); }
        .phone-input {
          background: transparent;
          border: none;
          outline: none;
          color: #F8F6F2;
          font-size: 1rem;
          font-family: inherit;
          padding: 0.875rem 1rem;
          flex: 1;
          min-width: 0;
        }
        .phone-input::placeholder { color: rgba(255,255,255,0.3); }

        /* Country dropdown */
        .country-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 280px;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 1rem;
          z-index: 100;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
          animation: dropIn 0.15s ease;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .country-search {
          background: rgba(255,255,255,0.05);
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: #F8F6F2;
          outline: none;
          padding: 0.75rem 1rem;
          width: 100%;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .country-search::placeholder { color: rgba(255,255,255,0.3); }
        .country-list {
          max-height: 220px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(212,175,55,0.3) transparent;
        }
        .country-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.15s;
          font-size: 0.9rem;
        }
        .country-item:hover { background: rgba(255,255,255,0.07); }
        .country-item.selected { background: rgba(212,175,55,0.12); }
        .country-dial { color: #D4AF37; font-weight: 600; margin-left: auto; font-size: 0.85rem; }

        /* Alert */
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
        .checkout-alert.success { background: rgba(110,231,183,0.15); border: 1px solid rgba(110,231,183,0.3); color: #6ee7b7; }
        .checkout-alert.error   { background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); color: #f87171; }
        .checkout-alert.warning { background: rgba(251,191, 36,0.15); border: 1px solid rgba(251,191, 36,0.3); color: #fbbf24; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Delivery buttons */
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
        .delivery-btn:hover { border-color: rgba(255,255,255,0.3); }
        .delivery-btn.active { border-color: #D4AF37; background: rgba(212,175,55,0.1); }

        /* Confirm button */
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
        .confirm-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Field label */
        .field-label {
          display: block;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 0.5rem;
          letter-spacing: 0.02em;
        }

        @media (max-width: 768px) {
          .glass-card { padding: 1.75rem !important; }
          .delivery-btn { padding: 1.5rem !important; }
          .country-dropdown { width: 100%; }
        }
      `}</style>

      {/* ── Alert ── */}
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

      {/* ── Page ── */}
      <div className="checkout-page min-h-screen relative overflow-hidden">
        {/* Dot grid */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0, opacity: 0.1, pointerEvents: "none",
          backgroundImage: "radial-gradient(#D4AF37 0.8px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
          {/* Back link */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/client/panier" className="text-[#D4AF37] flex items-center gap-2 hover:text-white transition-colors">
              <ArrowLeft size={22} />
              Retour au panier
            </Link>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* ── LEFT ── */}
            <div className="lg:col-span-7 space-y-8">

              {/* Delivery Method */}
              <div className="glass-card rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-4">
                  <Truck color="#D4AF37" size={28} />
                  Mode de livraison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setDeliveryMethod("DELIVERY")}
                    className={`delivery-btn ${deliveryMethod === "DELIVERY" ? "active" : ""}`}>
                    <div className="flex justify-between items-start mb-6">
                      <Truck size={32} color={deliveryMethod === "DELIVERY" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span className="text-sm font-semibold text-[#D4AF37]">{DELIVERY_FEE} TND</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Livraison à domicile</h3>
                    <p className="text-sm text-white/60">Votre commande vous sera livrée directement</p>
                  </button>

                  <button type="button" onClick={() => setDeliveryMethod("PICKUP")}
                    className={`delivery-btn ${deliveryMethod === "PICKUP" ? "active" : ""}`}>
                    <div className="flex justify-between items-start mb-6">
                      <Store size={32} color={deliveryMethod === "PICKUP" ? "#D4AF37" : "rgba(255,255,255,0.3)"} />
                      <span className="text-sm font-semibold text-[#6ee7b7]">Gratuit</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Retrait en magasin</h3>
                    <p className="text-sm text-white/60">Venez récupérer votre commande sur place</p>
                  </button>
                </div>
              </div>

              {/* Personal Info */}
              <div className="glass-card rounded-3xl p-6 md:p-10">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-4">
                  <User color="#D4AF37" size={28} />
                  Informations personnelles
                </h2>

                <div className="space-y-6">
                  {/* First name + Last name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="field-label">Prénom *</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => setForm({ ...form, firstName: e.target.value })}
                        className="input-field"
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <label className="field-label">Nom *</label>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={e => setForm({ ...form, lastName: e.target.value })}
                        className="input-field"
                        placeholder="Votre nom de famille"
                      />
                    </div>
                  </div>

                  {/* Phone with country dial */}
                  <div>
                    <label className="field-label">Téléphone *</label>
                    <div className="phone-composite">
                      {/* Country dial button */}
                      <button
                        type="button"
                        className="phone-dial-btn"
                        onClick={() => setShowCountryDropdown(v => !v)}
                      >
                        <span style={{ fontSize: "1.25rem" }}>{phoneCountry.flag}</span>
                        <span>{phoneCountry.dial}</span>
                        <ChevronDown size={14} style={{ opacity: 0.5, marginLeft: "auto" }} />
                      </button>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="phone-input"
                        placeholder="XX XXX XXX"
                      />

                      {/* Dropdown */}
                      {showCountryDropdown && (
                        <div className="country-dropdown">
                          <input
                            type="text"
                            className="country-search"
                            placeholder="Rechercher un pays..."
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            autoFocus
                          />
                          <div className="country-list">
                            {filteredCountries.map(c => (
                              <div
                                key={c.code}
                                className={`country-item ${phoneCountry.code === c.code ? "selected" : ""}`}
                                onClick={() => {
                                  setPhoneCountry(c);
                                  setShowCountryDropdown(false);
                                  setCountrySearch("");
                                }}
                              >
                                <span style={{ fontSize: "1.2rem" }}>{c.flag}</span>
                                <span>{c.name}</span>
                                <span className="country-dial">{c.dial}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery address fields */}
                  {deliveryMethod === "DELIVERY" && (
                    <>
                      {/* Address country selector */}
                      <div>
                        <label className="field-label">Pays de livraison *</label>
                        <div className="select-wrapper">
                          <select
                            value={addressCountry}
                            onChange={e => setAddressCountry(e.target.value)}
                            className="select-field"
                          >
                            {COUNTRIES.map(c => (
                              <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={16} className="chevron-icon" />
                        </div>
                      </div>

                      {/* Tunisia: Governorate → City */}
                      {addressCountry === "TN" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="field-label">Gouvernorat *</label>
                            <div className="select-wrapper">
                              <select
                                value={selectedGov}
                                onChange={e => setSelectedGov(e.target.value)}
                                className="select-field"
                              >
                                <option value="">Sélectionner un gouvernorat</option>
                                {GOVERNORATES.map(g => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="chevron-icon" />
                            </div>
                          </div>
                          <div>
                            <label className="field-label">Ville *</label>
                            <div className="select-wrapper">
                              <select
                                value={selectedCity}
                                onChange={e => setSelectedCity(e.target.value)}
                                className="select-field"
                                disabled={!selectedGov}
                              >
                                <option value="">
                                  {selectedGov ? "Sélectionner une ville" : "Choisissez d'abord un gouvernorat"}
                                </option>
                                {selectedGov && TUNISIA_DATA[selectedGov]?.map(city => (
                                  <option key={city} value={city}>{city}</option>
                                ))}
                              </select>
                              <ChevronDown size={16} className="chevron-icon" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Other countries: free text city */
                        <div>
                          <label className="field-label">Ville *</label>
                          <input
                            type="text"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            className="input-field"
                            placeholder="Votre ville"
                          />
                        </div>
                      )}

                      {/* Street address */}
                      <div>
                        <label className="field-label">
                          {addressCountry === "TN" ? "Adresse (rue, immeuble…)" : "Adresse complète *"}
                        </label>
                        <input
                          type="text"
                          value={addressCountry === "TN" ? form.address : form.address}
                          onChange={e => setForm({ ...form, address: e.target.value })}
                          className="input-field"
                          placeholder={addressCountry === "TN" ? "Rue, n°, résidence..." : "Adresse complète"}
                        />
                      </div>

                      {/* Postal code */}
                      <div style={{ maxWidth: "200px" }}>
                        <label className="field-label">Code postal</label>
                        <input
                          type="text"
                          value={form.postalCode}
                          onChange={e => setForm({ ...form, postalCode: e.target.value })}
                          className="input-field"
                          placeholder="1000"
                        />
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="field-label">Notes / Instructions</label>
                    <textarea
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                      className="input-field"
                      style={{ resize: "none" }}
                      placeholder="Instructions spéciales pour la livraison..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT — Order Summary ── */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 md:p-10 sticky top-6 lg:top-8">
                <h2 className="text-2xl md:text-[1.75rem] font-semibold mb-8 flex items-center gap-3">
                  <ShoppingBag color="#D4AF37" size={28} />
                  Résumé de la commande
                </h2>

                <div className="space-y-6 mb-10 max-h-[420px] overflow-y-auto pr-2">
                  {cart.items.map(item => (
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
                  {processing ? "Traitement en cours..." : (
                    <><CreditCard size={22} /> Confirmer la commande</>
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

      {/* Close country dropdown on outside click */}
      {showCountryDropdown && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50 }}
          onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }}
        />
      )}
    </>
  );
}