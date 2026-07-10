'use client';

import { useEffect, useState, useRef, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import { useSignUp } from "@clerk/nextjs/legacy";

import { useUser, useClerk} from "@clerk/nextjs";

import {

  ArrowLeft, ShoppingBag, Truck, Store, CheckCircle,

  XCircle, AlertCircle, X, User, CreditCard, ChevronDown, Mail, ShieldCheck,

} from "lucide-react";

import Navbar from "@/components/ClientNavbar";

/* ─── Types ─────────────────────────────────────────────────── */

type CartItem = {

  id: number;

  quantity: number;

  size: string | null;

  product: { id: number; name: string; price: number; images: string[]; category: string };

};

type GuestItem = { productId: number; quantity: number; size?: string | null };

type DeliveryMethod = "PICKUP" | "DELIVERY";

/* ─── Guest cart (localStorage) ─────────────────────────────── */

const GUEST_KEY = "irnas_guest_cart";

const guestCart = {

  get(): GuestItem[] {

    if (typeof window === "undefined") return [];

    try { return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]"); } catch { return []; }

  },

  clear() { localStorage.removeItem(GUEST_KEY); },

};

/* ─── Constants ─────────────────────────────────────────────── */

const DELIVERY_FEE = 7;

const COUNTRIES = [

  { code: "TN", name: "Tunisie",             dial: "+216", flag: "🇹🇳" },

  { code: "DZ", name: "Algérie",             dial: "+213", flag: "🇩🇿" },

  { code: "MA", name: "Maroc",               dial: "+212", flag: "🇲🇦" },

  { code: "LY", name: "Libye",               dial: "+218", flag: "🇱🇾" },

  { code: "EG", name: "Égypte",              dial: "+20",  flag: "🇪🇬" },

  { code: "SA", name: "Arabie Saoudite",     dial: "+966", flag: "🇸🇦" },

  { code: "AE", name: "Émirats arabes unis", dial: "+971", flag: "🇦🇪" },

  { code: "FR", name: "France",              dial: "+33",  flag: "🇫🇷" },

  { code: "BE", name: "Belgique",            dial: "+32",  flag: "🇧🇪" },

  { code: "DE", name: "Allemagne",           dial: "+49",  flag: "🇩🇪" },

  { code: "GB", name: "Royaume-Uni",         dial: "+44",  flag: "🇬🇧" },

  { code: "IT", name: "Italie",              dial: "+39",  flag: "🇮🇹" },

  { code: "US", name: "États-Unis",          dial: "+1",   flag: "🇺🇸" },

];

const TUNISIA_DATA: Record<string, string[]> = {

  "Ariana":    ["Ariana Ville","Ettadhamen","Ghazela","Kalâat el-Andalous","Mnihla","Raoued","Sidi Thabet"],

  "Ben Arous": ["Ben Arous","Bou Mhel el-Bassatine","El Mourouj","Ezzahra","Fouchana","Hammam Chott","Hammam Lif","Mégrine","Radès"],

  "Bizerte":   ["Bizerte Nord","Bizerte Sud","El Alia","Mateur","Menzel Bourguiba","Ras Jebel"],

  "Gabès":     ["El Hamma","Gabès Médina","Gabès Ouest","Gabès Sud","Ghannouch","Mareth"],

  "Gafsa":     ["El Guettar","Gafsa Nord","Gafsa Sud","Mdhilla","Métlaoui","Redeyef"],

  "Kairouan":  ["Bouhajla","El Alaa","Haffouz","Kairouan Nord","Kairouan Sud"],

  "Kasserine": ["Fériana","Kasserine Nord","Kasserine Sud","Sbeitla","Thala"],

  "Manouba":   ["Borj El Amri","Djedeida","Douar Hicher","Manouba","Oued Ellil","Tébourba"],

  "Médenine":  ["Ben Gardane","Djerba — Ajim","Djerba — Houmt Souk","Djerba — Midoun","Médenine Nord","Zarzis"],

  "Monastir":  ["Bekalta","Jammel","Ksar Hellal","Moknine","Monastir","Zeramdine"],

  "Nabeul":    ["El Haouaria","Grombalia","Hammamet","Kelibia","Korba","Nabeul","Soliman","El Mida","Menzel Temime","Menzel Bouzelfa"],

  "Sfax":      ["Agareb","Kerkennah","Mahres","Sakiet Eddaier","Sfax Est","Sfax Médina","Sfax Ouest"],

  "Sousse":    ["Akouda","Bouficha","Enfidha","Hammam Sousse","Kalâa Kebira","Msaken","Sousse Médina"],

  "Tunis":     ["Bab Bhar","Bab Souika","Carthage","El Kram","El Menzah","La Goulette","La Marsa","Le Bardo","Sidi Bou Saïd"],

  "Zaghouan":  ["El Fahs","Zaghouan","Zriba"],

  "Béja":      ["Amdoun","Béja Nord","Béja Sud","Medjez el-Bab","Nefza","Téboursouk"],

};

const GOVERNORATES = Object.keys(TUNISIA_DATA).sort();

/* ─── Component ─────────────────────────────────────────────── */

function CheckoutInner() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const { isSignedIn, user } = useUser();

  const { signOut } = useClerk(); // if needed elsewhere

  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cart — DB for auth users, localStorage for guests

  const [cart,       setCart]       = useState<{ items: CartItem[] }>({ items: [] });

  const [guestItems, setGuestItems] = useState<GuestItem[]>([]);

  const [loading,    setLoading]    = useState(true);

  const [processing, setProcessing] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; type: string; message: string }>({

    show: false, type: "success", message: "",

  });

  const [deliveryMethod,      setDeliveryMethod]      = useState<DeliveryMethod>("PICKUP");

  const [phoneCountry,        setPhoneCountry]        = useState(COUNTRIES[0]);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const [countrySearch,       setCountrySearch]       = useState("");

  const [addressCountry,      setAddressCountry]      = useState("TN");

  const [selectedGov,         setSelectedGov]         = useState("");

  const [selectedCity,        setSelectedCity]        = useState("");

  const [form, setForm] = useState({

    email: "", firstName: "", lastName: "", phone: "",

    streetAddress: "", postalCode: "", notes: "", freeCity: "",

  });

  /* ── Email verification (guest, new account) ───────────── */

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");

  const [verifying, setVerifying] = useState(false);

  const [verifyError, setVerifyError] = useState("");

  const [resending, setResending] = useState(false);

  /* ── Alert helper ───────────────────────────────────────── */

  const showAlert = (type: "success" | "error" | "warning", message: string) => {

    setAlert({ show: true, type, message });

    setTimeout(() => setAlert({ show: false, type: "success", message: "" }), 4000);

  };

  /* ── Outside click for phone dropdown ──────────────────── */

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

  /* ── Load cart ──────────────────────────────────────────── */

  useEffect(() => {

    if (isSignedIn === undefined) return; // Clerk still loading

    const isBuyNow = searchParams.get("mode") === "buynow";

    let buyNowItem: { productId: number; quantity: number; size?: string | null } | null = null;

    if (isBuyNow) {

      try {

        const raw = sessionStorage.getItem("irnas_buynow");

        if (raw) {

          const parsed = JSON.parse(raw);

          buyNowItem = {

            productId: parsed.productId,

            quantity:  parsed.quantity ?? 1,

            size:      parsed.size ?? null,

          };

        }

      } catch {}

      sessionStorage.removeItem("irnas_buynow"); // usage unique

    }

    if (isSignedIn) {

      // Pre-fill form with Clerk user data

      setForm(f => ({

        ...f,

        email:     user?.primaryEmailAddress?.emailAddress ?? "",

        firstName: user?.firstName ?? "",

        lastName:  user?.lastName  ?? "",

      }));

      const loadCart = () =>

        fetch("/api/cart")

          .then(r => r.ok ? r.json() : null)

          .then(data => {

            if (data?.items?.length) setCart(data);

          })

          .catch(() => showAlert("error", "Impossible de charger le panier"))

          .finally(() => setLoading(false));

      if (buyNowItem) {

        // Ajoute silencieusement le produit "achat direct" au panier puis charge

        fetch("/api/cart", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(buyNowItem),

        })

          .catch(() => {})

          .finally(loadCart);

      } else {

        loadCart();

      }

    } else {

      // Guest

      if (buyNowItem) {

        setGuestItems([buyNowItem]);

        setLoading(false);

      } else {

        const items = guestCart.get();

        setGuestItems(items);

        setLoading(false);

      }

    }

  }, [isSignedIn, user, router, searchParams]);

  /* ── Derived values ─────────────────────────────────────── */

  const authItems  = cart.items;

  const isGuest    = !isSignedIn;

  const subtotal   = isGuest

    ? 0 // will be computed server-side

    : authItems.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const deliveryFee = deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0;

  const total       = subtotal + deliveryFee;

  /* ── Validation ─────────────────────────────────────────── */

  function validate(): string | null {

    if (isGuest && !form.email.trim()) return "L'adresse email est obligatoire";

    if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))

      return "Adresse email invalide";

    if (!form.firstName.trim() || !form.lastName.trim()) return "Prénom et nom sont obligatoires";

    if (!form.phone.trim()) return "Le numéro de téléphone est obligatoire";

    if (deliveryMethod === "DELIVERY") {

      if (addressCountry === "TN" && (!selectedGov || !selectedCity))

        return "Veuillez sélectionner le gouvernorat et la ville";

      if (addressCountry !== "TN" && !form.freeCity.trim())

        return "Veuillez remplir la ville";

    }

    return null;

  }

  /* ── Entry point: click "Confirmer la commande" ─────────── */

  const handleSubmit = async () => {

    const error = validate();

    if (error) { showAlert("warning", error); return; }

    if (!isGuest) {

      setProcessing(true);

      await submitOrder();

      return;

    }

    // Invité : on regarde d'abord si cet email a déjà un compte.

    setProcessing(true);

    try {

      const checkRes = await fetch("/api/auth/check-guest-email", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),

      });

      const checkData = await checkRes.json();

      if (checkData.exists) {

        // Email connu → flux invité classique (auto-login par ticket)

        await submitOrder();

      } else {

        // Nouvel email → vérification par code obligatoire avant toute création

        await startEmailVerification();

      }

    } catch {

      showAlert("error", "Erreur réseau");

      setProcessing(false);

    }

  };

  /* ── Start Clerk sign-up + send verification code ───────── */

  const startEmailVerification = async () => {

    if (!signUpLoaded || !signUp) { setProcessing(false); return; }

    try {

      await signUp.create({

        emailAddress: form.email.trim().toLowerCase(),

        password: `${crypto.randomUUID()}!Aa1`,

        firstName: form.firstName.trim(),

        lastName: form.lastName.trim(),

      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerificationCode("");

      setVerifyError("");

      setShowVerifyModal(true);

      setProcessing(false);

    } catch (err: any) {

      console.error(err);

      showAlert("error", err?.errors?.[0]?.message || "Impossible d'envoyer le code de vérification");

      setProcessing(false);

    }

  };

  /* ── Resend code ─────────────────────────────────────────── */

  const handleResendCode = async () => {

    if (!signUpLoaded || !signUp || resending) return;

    setResending(true);

    try {

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      showAlert("success", "Un nouveau code a été envoyé");

    } catch {

      showAlert("error", "Impossible de renvoyer le code");

    } finally {

      setResending(false);

    }

  };

  /* ── Confirm code → create Clerk session → sync DB user → create order ── */

  const handleVerifyCode = async () => {

    if (!signUpLoaded || !signUp || !verificationCode.trim()) return;

    setVerifying(true);

    setVerifyError("");

    try {

      const result = await signUp.attemptEmailAddressVerification({

        code: verificationCode.trim(),

      });

      if (result.status === "complete" && result.createdSessionId) {

        await setActive({ session: result.createdSessionId });

        // Crée/lie l'utilisateur en base maintenant que le compte Clerk existe

        await fetch("/api/sync-user", { method: "POST" }).catch(() => {});

        setShowVerifyModal(false);

        setProcessing(true);

        await submitOrder({ afterVerification: true });

      } else {

        setVerifyError("Code invalide. Veuillez réessayer.");

      }

    } catch (err: any) {

      setVerifyError(err?.errors?.[0]?.message || "Code invalide. Veuillez réessayer.");

    } finally {

      setVerifying(false);

    }

  };

  const handleCancelVerification = () => {

    setShowVerifyModal(false);

    setVerificationCode("");

    setVerifyError("");

    setProcessing(false);

  };

  /* ── Actual order creation ───────────────────────────────── */

  const submitOrder = async (opts: { afterVerification?: boolean } = {}) => {

    const { afterVerification = false } = opts;

    try {

      const city = addressCountry === "TN" ? selectedCity : form.freeCity;

      const payload: Record<string, unknown> = {

        deliveryMethod,

        deliveryFee:  deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0,

        customerInfo: {

          email:       form.email.trim().toLowerCase(),

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

      };

      // Invité (avant ou juste après vérification) : le panier DB n'existe

      // pas encore pour ce user, donc on envoie toujours les items explicitement.

      if (isGuest || afterVerification) {

        payload.items = guestItems;

      }

      const res  = await fetch("/api/orders", {

        method:  "POST",

        headers: { "Content-Type": "application/json" },

        body:    JSON.stringify(payload),

      });

      const data = await res.json();

      if (res.ok) {

        const orderId = data.orderId;

        const productsSnapshot = (isGuest || afterVerification)

          ? guestItems.map(i => ({

              productId: i.productId,

              quantity: i.quantity,

              size: i.size ?? null,

            }))

          : authItems.map(i => ({

              productId: i.product.id,

              name: i.product.name,

              price: i.product.price,

              quantity: i.quantity,

              size: i.size ?? null,

            }));

        fetch("/api/order-snapshot", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({

            orderId,

            customerEmail: form.email.trim().toLowerCase(),

            customerFirstName: form.firstName.trim(),

            customerLastName: form.lastName.trim(),

            customerPhone: `${phoneCountry.dial} ${form.phone.trim()}`,

            deliveryMethod,

            deliveryFee: deliveryMethod === "DELIVERY" ? DELIVERY_FEE : 0,

            total: (isGuest && !afterVerification) ? null : total,

            address: deliveryMethod === "DELIVERY" ? (form.streetAddress.trim() || null) : null,

            city: deliveryMethod === "DELIVERY" ? (addressCountry === "TN" ? selectedCity : form.freeCity) || null : null,

            governorate: deliveryMethod === "DELIVERY" && addressCountry === "TN" ? (selectedGov || null) : null,

            postalCode: deliveryMethod === "DELIVERY" ? (form.postalCode.trim() || null) : null,

            country: deliveryMethod === "DELIVERY" ? addressCountry : null,

            notes: form.notes.trim() || null,

            products: productsSnapshot,

          }),

        }).catch(err => console.error("Erreur sauvegarde snapshot:", err));

        if (afterVerification) {

          // Compte Clerk + user DB tout juste créés et connectés.

          guestCart.clear();

          showAlert("success", "Compte vérifié et commande confirmée !");

          setTimeout(() => router.push(`/client/orders/${orderId}`), 1200);

          return;

        }

        if (isGuest) {

          guestCart.clear();

          const guestOrders = JSON.parse(localStorage.getItem("irnas_guest_orders") || "[]");

          guestOrders.push(orderId);

          localStorage.setItem("irnas_guest_orders", JSON.stringify(guestOrders));

        }

        // Auto-login pour guest existant : redirige avec le ticket

        if (isGuest && data.signInToken) {

          router.push(`/client/orders/${orderId}?ticket=${data.signInToken}`);

          return;

        }

        showAlert("success", "Commande confirmée avec succès !");

        setTimeout(() => router.push(`/client/orders/${orderId}`), 1200);

      } else {

        showAlert("error", data.error || "Erreur lors de la commande");

      }

    } catch {

      showAlert("error", "Erreur réseau");

    } finally {

      setProcessing(false);

    }

  };

  /* ── Shared styles ──────────────────────────────────────── */

  const inputCls = `w-full bg-[#0a1628] border border-[#1e3a5f] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[#4a6a8a] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/20 transition disabled:opacity-40 disabled:cursor-not-allowed`;

  const labelCls = "block text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light mb-2";

  const cardCls  = "bg-[#0f1f33] border border-[#1a2a44] rounded-3xl p-6 md:p-8 hover:border-[#3b82f6]/20 transition";

  const filteredCountries = COUNTRIES.filter(c =>

    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dial.includes(countrySearch)

  );

  /* ── Loading ────────────────────────────────────────────── */

  if (loading) return (

    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">

      <div className="relative">

        <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />

        <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em] animate-pulse">IRNAS</div>

      </div>

    </div>

  );

  /* ── Render ─────────────────────────────────────────────── */

  return (

    <div className="min-h-screen bg-[#0a1628] text-white">

      <Navbar />

      {/* Dot grid */}

      <div className="fixed inset-0 pointer-events-none opacity-[0.07]"

        style={{ backgroundImage: "radial-gradient(#3b82f6 0.8px,transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Alert */}

      {alert.show && (

        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-light border shadow-2xl ${

          alert.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :

          alert.type === "error"   ? "bg-red-500/10 border-red-500/30 text-red-400" :

                                     "bg-amber-500/10 border-amber-500/30 text-amber-400"

        }`}>

          {alert.type === "success" && <CheckCircle size={16} />}

          {alert.type === "error"   && <XCircle     size={16} />}

          {alert.type === "warning" && <AlertCircle size={16} />}

          <span>{alert.message}</span>

          <button onClick={() => setAlert(a => ({ ...a, show: false }))} className="ml-2 opacity-60 hover:opacity-100">

            <X size={14} />

          </button>

        </div>

      )}

      {/* Email verification modal */}

      {showVerifyModal && (

        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

          <div className="w-full max-w-sm bg-[#0f1f33] border border-[#1e3a5f] rounded-3xl p-8 relative">

            <button onClick={handleCancelVerification}

              className="absolute top-5 right-5 text-[#4a6a8a] hover:text-white transition">

              <X size={18} />

            </button>

            <div className="flex flex-col items-center text-center mb-6">

              <div className="w-14 h-14 rounded-2xl bg-[#3b82f6]/10 flex items-center justify-center mb-4">

                <ShieldCheck className="w-7 h-7 text-[#3b82f6]" />

              </div>

              <h3 className="text-lg font-light uppercase tracking-[0.15em] mb-2">Vérifiez votre email</h3>

              <p className="text-sm text-[#8aabca] font-light">

                Un code à 6 chiffres a été envoyé à<br />

                <span className="text-white">{form.email.trim()}</span>

              </p>

            </div>

            <input

              type="text"

              inputMode="numeric"

              autoFocus

              maxLength={6}

              value={verificationCode}

              onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ""))}

              onKeyDown={e => { if (e.key === "Enter") handleVerifyCode(); }}

              className={inputCls + " text-center text-lg tracking-[0.5em] mb-2"}

              placeholder="------"

            />

            {verifyError && (

              <p className="text-red-400 text-xs font-light mb-2 text-center">{verifyError}</p>

            )}

            <button

              onClick={handleVerifyCode}

              disabled={verifying || verificationCode.trim().length < 6}

              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[#3b82f6] text-[#3b82f6] text-xs uppercase tracking-[0.15em] font-light hover:bg-[#3b82f6]/10 disabled:opacity-50 disabled:cursor-not-allowed transition">

              {verifying

                ? <><div className="w-4 h-4 border border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" /> Vérification...</>

                : "Valider le code"

              }

            </button>

            <button

              onClick={handleResendCode}

              disabled={resending}

              className="w-full mt-3 text-[11px] uppercase tracking-[0.15em] text-[#4a6a8a] hover:text-[#3b82f6] font-light transition disabled:opacity-50">

              {resending ? "Envoi..." : "Renvoyer le code"}

            </button>

          </div>

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

            {isGuest

              ? `${guestItems.length} article${guestItems.length > 1 ? "s" : ""} · Commande sans compte`

              : `${cart.items.length} article${cart.items.length > 1 ? "s" : ""} dans votre panier`

            }

          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* LEFT COLUMN */}

          <div className="lg:col-span-7 space-y-6">

            {/* Delivery method */}

            <div className={cardCls}>

              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">

                <Truck className="w-5 h-5 text-[#3b82f6]" /> Mode de livraison

              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {(["DELIVERY", "PICKUP"] as DeliveryMethod[]).map(method => (

                  <button key={method} type="button" onClick={() => setDeliveryMethod(method)}

                    className={`p-6 rounded-2xl border text-left transition-all duration-200 ${

                      deliveryMethod === method

                        ? "border-[#3b82f6] bg-[#3b82f6]/10"

                        : "border-[#1e3a5f] hover:border-[#3b82f6]/40"

                    }`}>

                    <div className="flex justify-between items-start mb-4">

                      {method === "DELIVERY"

                        ? <Truck  size={22} className={deliveryMethod === method ? "text-[#3b82f6]" : "text-[#4a6a8a]"} />

                        : <Store  size={22} className={deliveryMethod === method ? "text-[#3b82f6]" : "text-[#4a6a8a]"} />

                      }

                      <span className={`text-xs font-light uppercase tracking-[0.15em] ${method === "DELIVERY" ? "text-[#3b82f6]" : "text-emerald-400"}`}>

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

                {/* Email */}

                <div>

                  <label className={labelCls}>

                    Email * {isGuest && <span className="text-[#3b82f6]/60 normal-case">(utilisé pour suivre votre commande)</span>}

                  </label>

                  <div className="relative">

                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6a8a] pointer-events-none" />

                    <input

                      type="email"

                      value={form.email}

                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}

                      disabled={!isGuest}

                      className={inputCls + " pl-10"}

                      placeholder="votre@email.com"

                    />

                  </div>

                  {isGuest && (

                    <p className="text-[10px] text-[#3a5a7a] font-light mt-1.5 pl-1">

                      Si vous avez déjà commandé, votre historique sera retrouvé automatiquement. Sinon, un code de vérification vous sera envoyé.

                    </p>

                  )}

                </div>

                {/* Name */}

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

                {/* Phone with country selector */}

                <div>

                  <label className={labelCls}>Téléphone *</label>

                  <div ref={dropdownRef} className="relative flex border border-[#1e3a5f] rounded-2xl bg-[#0a1628] focus-within:border-[#3b82f6]/50 focus-within:ring-1 focus-within:ring-[#3b82f6]/20 transition">

                    <button type="button" onClick={() => setShowCountryDropdown(v => !v)}

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

                        <input type="text" autoFocus

                          className="w-full bg-transparent border-b border-[#1e3a5f] px-4 py-3 text-sm text-white placeholder:text-[#4a6a8a] outline-none font-light"

                          placeholder="Rechercher pays ou indicatif..."

                          value={countrySearch} onChange={e => setCountrySearch(e.target.value)} />

                        <div className="max-h-52 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>

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

                        <select value={addressCountry} onChange={e => setAddressCountry(e.target.value)}

                          className={inputCls + " appearance-none pr-10 cursor-pointer"}>

                          {COUNTRIES.map(c => (

                            <option key={c.code} value={c.code} style={{ background: "#0f1f33" }}>

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

                            <select value={selectedGov} onChange={e => setSelectedGov(e.target.value)}

                              className={inputCls + " appearance-none pr-10 cursor-pointer"}>

                              <option value="" style={{ background: "#0f1f33" }}>— Choisir —</option>

                              {GOVERNORATES.map(g => (

                                <option key={g} value={g} style={{ background: "#0f1f33" }}>{g}</option>

                              ))}

                            </select>

                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6a8a] pointer-events-none" />

                          </div>

                        </div>

                        <div>

                          <label className={labelCls}>Ville *</label>

                          <div className="relative">

                            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}

                              disabled={!selectedGov}

                              className={inputCls + " appearance-none pr-10 cursor-pointer"}>

                              <option value="" style={{ background: "#0f1f33" }}>

                                {selectedGov ? "— Choisir —" : "Gouvernorat d'abord"}

                              </option>

                              {selectedGov && TUNISIA_DATA[selectedGov]?.map(city => (

                                <option key={city} value={city} style={{ background: "#0f1f33" }}>{city}</option>

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

          {/* RIGHT COLUMN - Summary */}

          <div className="lg:col-span-5">

            <div className={cardCls + " sticky top-24"}>

              <h2 className="text-lg font-light uppercase tracking-[0.15em] mb-6 flex items-center gap-3">

                <ShoppingBag className="w-5 h-5 text-[#3b82f6]" /> Résumé

              </h2>

              <div className="space-y-4 mb-6 max-h-[280px] overflow-y-auto pr-1"

                style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>

                {isGuest ? (

                  <div className="text-center py-6 border border-[#1e3a5f] rounded-2xl">

                    <ShoppingBag className="w-8 h-8 text-[#3b82f6] mx-auto mb-2" />

                    <p className="text-sm font-light text-white">

                      {guestItems.reduce((s, i) => s + i.quantity, 0)} article{guestItems.reduce((s, i) => s + i.quantity, 0) > 1 ? "s" : ""}

                    </p>

                    <p className="text-[10px] text-[#4a6a8a] mt-1 font-light">Le total sera confirmé à la validation</p>

                  </div>

                ) : (

                  authItems.map(item => (

                    <div key={item.id} className="flex gap-4 items-center">

                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#1e3a5f] flex-shrink-0 bg-[#0a1628]">

                        <img src={item.product.images[0] || "/placeholder.jpg"} alt={item.product.name}

                          className="w-full h-full object-contain p-1.5" />

                      </div>

                      <div className="flex-1 min-w-0">

                        <h4 className="text-sm font-light text-white truncate">{item.product.name}</h4>

                        {item.size && (

                          <p className="text-[10px] text-[#4a6a8a] uppercase tracking-widest mt-0.5">Taille : {item.size}</p>

                        )}

                        <p className="text-[#60a5fa] text-sm font-light mt-1">

                          {item.quantity} × {item.product.price} TND

                        </p>

                      </div>

                    </div>

                  ))

                )}

              </div>

              {!isGuest && (

                <div className="border-t border-[#1e3a5f] pt-5 space-y-3 mb-6">

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

              )}

              {isGuest && (

                <div className="border-t border-[#1e3a5f] pt-5 mb-6">

                  <div className="flex justify-between text-sm">

                    <span className="text-[#4a6a8a] font-light">Livraison</span>

                    <span className={deliveryFee === 0 ? "text-emerald-400 font-light" : "text-white font-light"}>

                      {deliveryFee === 0 ? "Gratuit" : `+${deliveryFee} TND`}

                    </span>

                  </div>

                </div>

              )}

              <button type="button" onClick={handleSubmit} disabled={processing}

                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-[#3b82f6] text-[#3b82f6] text-xs uppercase tracking-[0.15em] font-light hover:bg-[#3b82f6]/10 disabled:opacity-50 disabled:cursor-not-allowed transition">

                {processing

                  ? <><div className="w-4 h-4 border border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" /> Traitement...</>

                  : <><CreditCard size={16} /> Confirmer la commande</>

                }

              </button>

              <p className="text-center text-[#4a6a8a] text-[10px] uppercase tracking-[0.15em] font-light mt-4">

                Paiement à la {deliveryMethod === "DELIVERY" ? "livraison" : "récupération"} · Sécurisé

              </p>

            </div>

          </div>

        </div>

      </div>

     

    </div>

  );

}

export default function CheckoutPage() {

  return (

    <Suspense fallback={<div className="min-h-screen bg-[#0a1628] flex items-center justify-center">Chargement...</div>}>

      <CheckoutInner />

    </Suspense>

  );

}