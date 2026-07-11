"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft, Heart, ChevronLeft, ChevronRight,
  ShoppingCart, CreditCard, CheckCircle, AlertCircle,
} from "lucide-react";
import Navbar from "@/components/ClientNavbar";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: { id: number; name: string } | string;
  gender: string;
  color: string;
  colorHex?: string;
  stock: number;
  material?: string;
  fit?: string;
  isNew?: boolean;
  sizes: string[];
};

const CATEGORY_LABELS: Record<string, string> = {
  pantalon: "Pantalon",
  pull: "Pull",
  veste: "Veste",
  chemise: "Chemise",
  accessoire: "Accessoire",
  robe: "Robe",
  jupe: "Jupe",
  "t-shirt": "T-shirt",
  chaussure: "Chaussure",
  manteau: "Manteau",
};

const GENDER_LABELS: Record<string, string> = {
  men: "Homme",
  women: "Femme",
  unisex: "Unisexe",
};

export default function DetailsProduitPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [alert, setAlert] = useState<{ show: boolean; type: "success" | "error" | "warning"; message: string }>({
    show: false, type: "success", message: "",
  });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert(a => ({ ...a, show: false })), 3500);
  };

  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    setNotFound(false);

    fetch(`/api/products/${productId}`)
      .then(res => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then(data => {
        if (data) {
          setProduct(data);
          setActiveIndex(0);
          setSelectedSize(null);
        }
      })
      .catch(() => showAlert("error", "Impossible de charger le produit"))
      .finally(() => setLoading(false));
  }, [productId]);

  const categoryName =
    product?.category && typeof product.category === "object"
      ? product.category.name
      : (product?.category as string) || "";

  const images = product?.images?.length ? product.images : ["/placeholder.jpg"];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => setActiveIndex(i => (i + 1) % images.length);
  const prevImage = () => setActiveIndex(i => (i - 1 + images.length) % images.length);

  const hasSizes = (product?.sizes?.length ?? 0) > 0;
  const isOutOfStock = (product?.stock ?? 0) <= 0;
  const sizeRequiredButMissing = hasSizes && !selectedSize;
  const actionsDisabled = isOutOfStock || sizeRequiredButMissing || adding;

  const addToCart = async () => {
    if (!product) return;
    if (sizeRequiredButMissing) {
      showAlert("warning", "Veuillez choisir une taille");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1, size: selectedSize }),
      });
      if (res.ok) {
        showAlert("success", "Produit ajouté au panier !");
      } else {
        const data = await res.json().catch(() => ({}));
        showAlert("error", data.error || "Erreur lors de l'ajout");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setAdding(false);
    }
  };

  const buyNow = () => {
    if (!product) return;
    if (sizeRequiredButMissing) {
      showAlert("warning", "Veuillez choisir une taille");
      return;
    }
    sessionStorage.setItem(
      "irnas_buynow",
      JSON.stringify({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || null,
        quantity: 1,
        size: selectedSize,
      })
    );
    router.push("/client/checkout?mode=buynow");
  };

  const toggleFavorite = () => {
    if (!isSignedIn) {
      showAlert("warning", "Connectez-vous pour utiliser les favoris");
      return;
    }
    // Ajoute ici ton appel API favoris si tu veux
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#3b82f6] text-[10px] font-light tracking-[0.3em]">
            IRNAS
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-2xl font-light">Produit introuvable</p>
        <Link href="/client/catalog" className="text-[#3b82f6] hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

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
          {alert.type !== "success" && <AlertCircle size={16} />}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-20 relative z-10">
        <Link href="/client/catalog"
          className="inline-flex items-center gap-2 text-[#4a6a8a] hover:text-[#3b82f6] transition mb-10 group text-sm uppercase tracking-[0.15em] font-light">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Galerie d'images ────────────────────────────── */}
          <div>
            <div className="relative h-[420px] md:h-[520px] bg-[#0f1f33] border border-[#1a2a44] rounded-3xl flex items-center justify-center overflow-hidden">
              <Image
                src={images[activeIndex]}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain p-8"
                priority
              />

              {product.isNew && (
                <span className="absolute top-5 left-5 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  NOUVEAU
                </span>
              )}

              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <span className="absolute top-5 right-5 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {activeIndex + 1}/{images.length}
                  </span>
                </>
              )}
            </div>

            {/* Miniatures */}
            {hasMultipleImages && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#1e3a5f transparent" }}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition ${
                      i === activeIndex ? "border-[#3b82f6]" : "border-[#1e3a5f] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Infos produit ───────────────────────────────── */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#3b82f6] font-light mb-3">
              {CATEGORY_LABELS[categoryName] ?? categoryName} • {GENDER_LABELS[product.gender] ?? product.gender}
            </p>

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-light">{product.name}</h1>
              <button onClick={toggleFavorite} className="flex-shrink-0 text-[#4a6a8a] hover:text-red-500 transition mt-1">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {product.description && (
              <p className="mt-4 text-[#8aabca] font-light leading-relaxed">{product.description}</p>
            )}

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-light">{product.price.toFixed(2)} TND</span>
              <span className="text-base line-through text-[#4a6a8a]">
                {(product.price * 1.2).toFixed(2)} TND
              </span>
              <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                -20%
              </span>
            </div>

            {/* Couleur */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light">Couleur</span>
              {product.colorHex && (
                <span className="w-5 h-5 rounded-full border border-[#1e3a5f]" style={{ backgroundColor: product.colorHex }} />
              )}
              <span className="text-sm font-light">{product.color}</span>
            </div>

            {/* Matière / Coupe */}
            {(product.material || product.fit) && (
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm font-light text-[#8aabca]">
                {product.material && <span>Matière : <span className="text-white">{product.material}</span></span>}
                {product.fit && <span>Coupe : <span className="text-white">{product.fit}</span></span>}
              </div>
            )}

            {/* Tailles */}
            {hasSizes && (
              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#4a6a8a] font-light block mb-3">
                  Taille {sizeRequiredButMissing && <span className="text-amber-500">— obligatoire</span>}
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border rounded-xl transition ${
                        selectedSize === size
                          ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                          : "border-[#1e3a5f] hover:border-[#3b82f6] text-[#8aabca]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p className={`mt-6 text-sm font-light ${isOutOfStock ? "text-red-400" : "text-emerald-400"}`}>
              {isOutOfStock ? "Rupture de stock" : `${product.stock} en stock`}
            </p>

            {/* Actions */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={addToCart}
                disabled={actionsDisabled}
                className="flex items-center justify-center gap-2 py-4 bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-2xl text-sm font-medium transition"
              >
                <ShoppingCart size={18} /> Ajouter
              </button>
              <button
                onClick={buyNow}
                disabled={isOutOfStock || sizeRequiredButMissing}
                className="flex items-center justify-center gap-2 py-4 border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-sm font-medium transition"
              >
                <CreditCard size={18} /> Acheter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}