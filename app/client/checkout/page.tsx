'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShoppingBag, Truck, Store, CheckCircle,
  XCircle, AlertCircle, X, User, CreditCard, ChevronDown,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";

type CartItem = {
  id: number;
  quantity: number;
  size: string | null;
  product: { id: number; name: string; price: number; images: string[]; category: string };
};
type DeliveryMethod = "PICKUP" | "DELIVERY";

const DELIVERY_FEE = 7;

const COUNTRIES = [
  { code: "TN", name: "Tunisie",             dial: "+216", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie",             dial: "+213", flag: "🇩🇿" },
  { code: "MA", name: "Maroc",               dial: "+212", flag: "🇲🇦" },
  { code: "LY", name: "Libye",               dial: "+218", flag: "🇱🇾" },
  { code: "EG", name: "Égypte",              dial: "+20",  flag: "🇪🇬" },
  { code: "SA", name: "Arabie Saoudite",     dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "Émirats arabes unis", dial: "+971", flag: "🇦🇪" },
  { code: "QA", name: "Qatar",               dial: "+974", flag: "🇶🇦" },
  { code: "FR", name: "France",              dial: "+33",  flag: "🇫🇷" },
  { code: "BE", name: "Belgique",            dial: "+32",  flag: "🇧🇪" },
  { code: "CH", name: "Suisse",              dial: "+41",  flag: "🇨🇭" },
  { code: "DE", name: "Allemagne",           dial: "+49",  flag: "🇩🇪" },
  { code: "GB", name: "Royaume-Uni",         dial: "+44",  flag: "🇬🇧" },
  { code: "IT", name: "Italie",              dial: "+39",  flag: "🇮🇹" },
  { code: "ES", name: "Espagne",             dial: "+34",  flag: "🇪🇸" },
  { code: "US", name: "États-Unis",          dial: "+1",   flag: "🇺🇸" },
  { code: "CA", name: "Canada",              dial: "+1",   flag: "🇨🇦" },
];

const TUNISIA_DATA: Record<string, string[]> = {
  "Ariana":   ["Ariana Ville","Ettadhamen","Ghazela","Kalâat el-Andalous","Mnihla","Raoued","Sidi Thabet"],
  "Ben Arous":["Ben Arous","Bou Mhel el-Bassatine","El Mourouj","Ezzahra","Fouchana","Hammam Chott","Hammam Lif","Mégrine","Mornag","Radès"],
  "Bizerte":  ["Bizerte Nord","Bizerte Sud","El Alia","Ghar El Melh","Mateur","Menzel Bourguiba","Menzel Jemil","Ras Jebel","Sejnane"],
  "Gabès":    ["El Hamma","Gabès Médina","Gabès Ouest","Gabès Sud","Ghannouch","Mareth","Matmata","Métouia"],
  "Gafsa":    ["El Guettar","El Ksar","Gafsa Nord","Gafsa Sud","Mdhilla","Métlaoui","Redeyef","Sidi Aïch"],
  "Jendouba": ["Aïn Draham","Bou Salem","Fernana","Ghardimaou","Jendouba","Jendouba Nord","Tabarka"],
  "Kairouan": ["Bouhajla","El Alaa","Haffouz","Kairouan Nord","Kairouan Sud","Nasrallah","Sbikha"],
  "Kasserine":["Fériana","Foussana","Kasserine Nord","Kasserine Sud","Sbeitla","Sbiba","Thala"],
  "Kébili":   ["Douz Nord","Douz Sud","El Faouar","Kébili Nord","Kébili Sud"],
  "Le Kef":   ["Dahmani","El Ksour","Jerissa","Le Kef Est","Le Kef Ouest","Nebeur","Sers","Tajerouine"],
  "Mahdia":   ["Chebba","El Jem","Ksour Essef","Mahdia","Melloulèche","Sidi Alouane"],
  "Manouba":  ["Borj El Amri","Djedeida","Douar Hicher","Manouba","Mornaguia","Oued Ellil","Tébourba"],
  "Médenine": ["Ben Gardane","Beni Khedache","Djerba — Ajim","Djerba — Houmt Souk","Djerba — Midoun","Médenine Nord","Médenine Sud","Zarzis"],
  "Monastir": ["Bekalta","Jammel","Ksar Hellal","Moknine","Monastir","Sahline","Téboulba","Zeramdine"],
  "Nabeul":   ["El Haouaria","Grombalia","Hammamet","Kelibia","Korba","Menzel Temime","Nabeul","Soliman"],
  "Sfax":     ["Agareb","El Amra","El Hencha","Kerkennah","Mahres","Sakiet Eddaier","Sakiet Ezzit","Sfax Est","Sfax Médina","Sfax Ouest","Sfax Sud"],
  "Sidi Bouzid":["Bir El Hafey","Jilma","Maknassy","Mezzouna","Regueb","Sidi Bouzid Est","Sidi Bouzid Ouest"],
  "Siliana":  ["Bargou","Bouarada","El Krib","Gaâfour","Makthar","Rouhia","Siliana Nord","Siliana Sud"],
  "Sousse":   ["Akouda","Bouficha","Enfidha","Hammam Sousse","Kalâa Kebira","Msaken","Sidi Bou Ali","Sousse Jawhara","Sousse Khzama","Sousse Médina","Sousse Riadh"],
  "Tataouine":["Bir Lahmar","Dehiba","Ghomrassen","Remada","Tataouine Nord","Tataouine Sud"],
  "Tozeur":   ["Degache","Nefta","Tozeur"],
  "Tunis":    ["Bab Bhar","Bab Souika","Carthage","El Kram","El Menzah","El Omrane","El Ouardia","La Goulette","La Marsa","Le Bardo","Séjoumi","Sidi Bou Saïd","Tunis Médina"],
  "Zaghouan": ["El Fahs","En-Nadhour","Zaghouan","Zriba"],
  "Béja":     ["Amdoun","Béja Nord","Béja Sud","Goubellat","Medjez el-Bab","Nefza","Téboursouk","Testour"],
};

const GOVERNORATES = Object.keys(TUNISIA_DATA).sort();

export default function CheckoutPage() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [cart, setCart]           = useState<{ items: CartItem[] }>({ items: [] });
  const [loading, setLoading]     = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert]         = useState<{ show: boolean; type: string; message: string }>({
    show: false, type: "success", message: "",
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("PICKUP");
  const [phoneCountry, setPhoneCountry]     = useState(COUNTRIES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch]   = useState("");
  const [addressCountry, setAddressCountry] = useState("TN");
  const [selectedGov, setSelectedGov]       = useState("");
  const [selectedCity, setSelectedCity]     = useState("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "",
    streetAddress: "", postalCode: "", notes: "", freeCity: "",
  });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 3500);
  };

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  useEffect(() => { setSelectedCity(""); }, [selectedGov]);
  useEffect(() => { setSelectedGov(""); setSelectedCity(""); }, [addressCountry]);

  useEffect(() => {
    fetch("/api/cart")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) { setCart(data); if (!data.items?.length) router.push("/client/panier"); }
        else showAlert("error", "Erreur lors du chargement du panier");
      })
      .catch(() => showAlert("error", "Impossible de charger le panier"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) { showAlert("warning", "Prénom et nom sont obligatoires"); return; }
    if (!form.phone.trim()) { showAlert("warning", "Le numéro de téléphone est obligatoire"); return; }
    if (deliveryMethod === "DELIVERY") {
      if (addressCountry === "TN" && (!selectedGov || !selectedCity)) { showAlert("warning", "Veuillez sélectionner le gouvernorat et la ville"); return; }
      if (addressCountry !== "TN" && !form.freeCity.trim()) { showAlert("warning", "Veuillez remplir la ville"); return; }
    }

    setProcessing(true);
    try {
      const city = addressCountry === "TN" ? selectedCity : form.freeCity;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          deliveryFee: deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0,
          customerInfo: {
            firstName:   form.firstName.trim(),
            lastName:    form.lastName.trim(),
            phone:       `${phoneCountry.dial} ${form.phone.trim()}`,
            address:     deliveryMethod === "DELIVERY" ? (form.streetAddress.trim() || null) : null,
            city:        deliveryMethod === "DELIVERY" ? (city || null) : null,
            governorate: deliveryMethod === "DELIVERY" && addressCountry === "TN" ? (selectedGov || null) : null,
            postalCode:  deliveryMethod === "DELIVERY" ? (form.postalCode.trim() || null) : null,
            country:     deliveryMethod === "DELIVERY" ? addressCountry : null,
            notes:       form.notes.trim() || null,
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
    } catch { showAlert("error", "Erreur réseau"); }
    finally { setProcessing(false); }
  };

  const subtotal    = cart.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryFee = deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;
  const total       = subtotal + deliveryFee;

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dial.includes(countrySearch)
  );

  // ── Styles partagés ────────────────────────────────────────────────────────
  const inputCls = `
    w-full bg-[#0a1628] border border-[#1e3a5f] rounded-2xl
    px-4 py-3 text-sm text-white placeholder:text-[#4a6a8a]
    focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/20
    transition disabled:opacity-40 disabled:cursor-not-allowed
  `;
  const labelCls = "block text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light mb-2";
  const cardCls  = "bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 md:p-8";

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="relative">
        <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">IRNAS</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      <Navbar />

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage:"radial-gradient(#3b82f6 0.8px,transparent 1px)", backgroundSize:"60px 60px" }} />

      {/* ── Alerts ── */}
      {alert.show && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-light border shadow-2xl animate-[slideIn_.3s_ease] ${
          alert.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
          alert.type === "error"   ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                     "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}>
          {alert.type === "success" && <CheckCircle size={16} />}
          {alert.type === "error"   && <XCircle     size={16} />}
          {alert.type === "warning" && <AlertCircle size={16} />}
          <span>{alert.message}</span>
          <button onClick={() => setAlert(a => ({ ...a, show: false }))}
            className="ml-2 opacity-60 hover:opacity-100 transition">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-28 pb-20 relative z-10">

        {/* Back */}
        <Link href="/client/panier"
          className="inline-flex items-center gap-2 text-[#4a6a8a] hover:text-[#3b82f6] transition mb-10 group text-sm uppercase tracking-[0.15em] font-light">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Retour au panier
        </Link>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight">
            Finaliser la <span className="text-[#3b82f6]">commande</span>
          </h1>
          <p className="mt-2 text-sm text-[#4a6a8a] tracking-widest uppercase font-light">
            {cart.items.length} article{cart.items.length > 1 ? "s" : ""} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Delivery method */}
            <div className={cardCls}>
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                <Truck className="w-5 h-5 text-[#3b82f6]" /> Mode de livraison
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(["DELIVERY", "PICKUP"] as DeliveryMethod[]).map(method => (
                  <button key={method} type="button"
                    onClick={() => setDeliveryMethod(method)}
                    className={`p-6 rounded-2xl border text-left transition-all duration-200 ${
                      deliveryMethod === method
                        ? "border-[#3b82f6] bg-[#3b82f6]/10"
                        : "border-[#1e3a5f] hover:border-[#3b82f6]/40 bg-transparent"
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                      {method === "DELIVERY"
                        ? <Truck  size={24} className={deliveryMethod === method ? "text-[#3b82f6]" : "text-[#4a6a8a]"} />
                        : <Store  size={24} className={deliveryMethod === method ? "text-[#3b82f6]" : "text-[#4a6a8a]"} />
                      }
                      <span className={`text-xs font-light uppercase tracking-[0.15em] ${
                        method === "DELIVERY" ? "text-[#3b82f6]" : "text-emerald-400"
                      }`}>
                        {method === "DELIVERY" ? `${DELIVERY_FEE} TND` : "Gratuit"}
                      </span>
                    </div>
                    <h3 className="text-sm font-light text-white mb-1">
                      {method === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                    </h3>
                    <p className="text-[11px] text-[#4a6a8a] font-light">
                      {method === "DELIVERY"
                        ? "Votre commande vous sera livrée directement"
                        : "Venez récupérer votre commande sur place"}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal info */}
            <div className={cardCls}>
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                <User className="w-5 h-5 text-[#3b82f6]" /> Informations personnelles
              </h2>
              <div className="space-y-5">

                {/* Prénom + Nom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Prénom *</label>
                    <input type="text" value={form.firstName}
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      className={inputCls} placeholder="Votre prénom" />
                  </div>
                  <div>
                    <label className={labelCls}>Nom *</label>
                    <input type="text" value={form.lastName}
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      className={inputCls} placeholder="Votre nom de famille" />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>Téléphone *</label>
                  <div ref={dropdownRef} className="relative flex border border-[#1e3a5f] rounded-2xl bg-[#0a1628] focus-within:border-[#3b82f6]/50 focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition">
                    <button type="button"
                      onClick={() => setShowCountryDropdown(v => !v)}
                      className="flex items-center gap-2 px-4 py-3 border-r border-[#1e3a5f] bg-[#0f1f33] rounded-l-2xl text-sm text-white whitespace-nowrap hover:bg-[#1a2a44] transition min-w-[110px]">
                      <span className="text-lg leading-none">{phoneCountry.flag}</span>
                      <span className="text-[#8aabca] font-light">{phoneCountry.dial}</span>
                      <ChevronDown size={12} className="text-[#4a6a8a] ml-auto" />
                    </button>
                    <input type="tel" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-white placeholder:text-[#4a6a8a] px-4 py-3 font-light"
                      placeholder="XX XXX XXX" />

                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-72 max-w-[92vw] bg-[#0f1f33] border border-[#1e3a5f] rounded-2xl shadow-2xl z-[200] overflow-hidden">
                        <input type="text" className="w-full bg-transparent border-b border-[#1e3a5f] px-4 py-3 text-sm text-white placeholder:text-[#4a6a8a] outline-none font-light"
                          placeholder="Rechercher pays ou indicatif..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          autoFocus />
                        <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth:"thin", scrollbarColor:"#1e3a5f transparent" }}>
                          {filteredCountries.length === 0
                            ? <div className="px-4 py-3 text-[#4a6a8a] text-sm text-center font-light">Aucun résultat</div>
                            : filteredCountries.map(c => (
                              <div key={c.code}
                                onClick={() => { setPhoneCountry(c); setShowCountryDropdown(false); setCountrySearch(""); }}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition ${
                                  phoneCountry.code === c.code
                                    ? "bg-[#3b82f6]/10 text-[#60a5fa]"
                                    : "text-[#8aabca] hover:bg-[#1a2a44] hover:text-white"
                                }`}>
                                <span className="text-lg leading-none">{c.flag}</span>
                                <span className="flex-1 truncate font-light">{c.name}</span>
                                <span className="text-[#3b82f6] text-xs font-light">{c.dial}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery address */}
                {deliveryMethod === "DELIVERY" && (
                  <>
                    <div>
                      <label className={labelCls}>Pays de livraison *</label>
                      <div className="relative">
                        <select value={addressCountry}
                          onChange={e => setAddressCountry(e.target.value)}
                          className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code} style={{ background:"#0f1f33" }}>
                              {c.flag} {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6a8a] pointer-events-none" />
                      </div>
                    </div>

                    {addressCountry === "TN" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className={labelCls}>Gouvernorat *</label>
                          <div className="relative">
                            <select value={selectedGov}
                              onChange={e => setSelectedGov(e.target.value)}
                              className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                              <option value="" style={{ background:"#0f1f33" }}>— Choisir —</option>
                              {GOVERNORATES.map(g => (
                                <option key={g} value={g} style={{ background:"#0f1f33" }}>{g}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6a8a] pointer-events-none" />
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Ville *</label>
                          <div className="relative">
                            <select value={selectedCity}
                              onChange={e => setSelectedCity(e.target.value)}
                              disabled={!selectedGov}
                              className={inputCls + " appearance-none pr-10 cursor-pointer"}>
                              <option value="" style={{ background:"#0f1f33" }}>
                                {selectedGov ? "— Choisir —" : "Gouvernorat d'abord"}
                              </option>
                              {selectedGov && TUNISIA_DATA[selectedGov]?.map(city => (
                                <option key={city} value={city} style={{ background:"#0f1f33" }}>{city}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6a8a] pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className={labelCls}>Ville *</label>
                        <input type="text" value={form.freeCity}
                          onChange={e => setForm(f => ({ ...f, freeCity: e.target.value }))}
                          className={inputCls} placeholder="Votre ville" />
                      </div>
                    )}

                    <div>
                      <label className={labelCls}>
                        {addressCountry === "TN" ? "Adresse (rue, immeuble…)" : "Adresse complète *"}
                      </label>
                      <input type="text" value={form.streetAddress}
                        onChange={e => setForm(f => ({ ...f, streetAddress: e.target.value }))}
                        className={inputCls}
                        placeholder={addressCountry === "TN" ? "Rue, n°, résidence..." : "Adresse complète"} />
                    </div>

                    <div className="max-w-[180px]">
                      <label className={labelCls}>Code postal</label>
                      <input type="text" value={form.postalCode}
                        onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                        className={inputCls} placeholder="1000" />
                    </div>
                  </>
                )}

                <div>
                  <label className={labelCls}>Notes / Instructions</label>
                  <textarea value={form.notes} rows={3}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    className={inputCls} style={{ resize: "none" }}
                    placeholder="Instructions spéciales pour la livraison..." />
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className={cardCls + " sticky top-24"}>
              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#3b82f6]" /> Résumé
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-[320px] overflow-y-auto pr-1"
                style={{ scrollbarWidth:"thin", scrollbarColor:"#1e3a5f transparent" }}>
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#1e3a5f] flex-shrink-0 bg-[#0a1628]">
                      <img src={item.product.images[0] || "/placeholder.jpg"} alt={item.product.name}
                        className="w-full h-full object-contain p-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-light text-white truncate">{item.product.name}</h4>
                      {item.size && (
                        <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest mt-0.5">
                          Taille : {item.size}
                        </p>
                      )}
                      <p className="text-[#60a5fa] text-sm font-light mt-1">
                        {item.quantity} × {item.product.price} TND
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="border-t border-[#1e3a5f] pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4a6a8a] font-light">Sous-total</span>
                  <span className="text-white font-light">{subtotal.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4a6a8a] font-light">Livraison</span>
                  <span className={deliveryFee === 0 ? "text-emerald-400 font-light" : "text-white font-light"}>
                    {deliveryFee === 0 ? "Gratuit" : `${deliveryFee} TND`}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-[#1e3a5f]">
                  <span className="text-sm uppercase tracking-[0.15em] font-light text-white">Total</span>
                  <span className="text-2xl font-light text-white">
                    {total.toFixed(2)} <span className="text-sm text-[#4a6a8a]">TND</span>
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button type="button" onClick={handleSubmit} disabled={processing}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-[#3b82f6] text-[#3b82f6] text-xs uppercase tracking-[0.15em] font-light hover:bg-[#3b82f6]/10 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {processing
                  ? <><div className="w-4 h-4 border border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" /> Traitement...</>
                  : <><CreditCard size={16} /> Confirmer la commande</>
                }
              </button>

              <p className="text-center text-[#4a6a8a] text-[10px] uppercase tracking-[0.15em] font-light mt-4">
                Paiement à la livraison · Sécurisé
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1a2a44] py-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg font-light tracking-[0.2em] text-white">IRNAS</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-[#60a5fa]/50 font-light">Fashion</span>
          </div>
          <p className="text-[10px] text-[#2a3f6a] tracking-widest font-light">© 2026 IRNAS — Tous droits réservés</p>
          <div className="flex items-center gap-6 text-[10px] text-[#2a3f6a] tracking-widest font-light uppercase">
            <Link href="#" className="hover:text-[#3b82f6] transition">Mentions</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Confidentialité</Link>
            <Link href="#" className="hover:text-[#3b82f6] transition">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}