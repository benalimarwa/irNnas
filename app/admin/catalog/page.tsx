'use client';

import { useEffect, useState, useRef } from "react";
import {
  Plus, Search, X, Edit, Trash2, Package, Upload,
  CheckCircle, XCircle, AlertTriangle, LayoutGrid, List,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  gender: string;
  color: string;
  colorHex: string;
  stock: number;
  images: string[];
  sizes: string[];
  material?: string;
  fit?: string;
  isNew: boolean;
  createdAt: string;
};

type AlertType = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
  title?: string;
};

type ImageItem = {
  key: string;                 // identifiant stable pour React
  kind: "url" | "file";        // url déjà hébergée / nouveau fichier local
  preview: string;             // ce qu'on affiche (url réelle ou data: pour preview)
  url?: string;                // valeur envoyée si kind === "url"
  file?: File;                 // valeur envoyée si kind === "file"
};

const GENDERS = [
  { value: "men", label: "Homme" },
  { value: "women", label: "Femme" },
  { value: "unisex", label: "Unisexe" },
];

const INITIAL_CATS = ["pantalon", "pull", "veste", "chemise", "accessoire"];

const EMPTY_PRODUCT = {
  id: 0,
  name: "",
  description: "",
  price: "",
  category: "pantalon",
  gender: "unisex",
  color: "",
  colorHex: "#3b82f6",
  stock: "100",
  sizes: "S,M,L,XL",
  material: "",
  fit: "",
  isNew: false,
};

// Helper : parse une Response en JSON sans jamais planter si le corps
// est vide (ex: 500 renvoyé par la plateforme avant que le handler ne
// s'exécute — c'est ce qui causait "Unexpected end of JSON input").
async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

const genKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function AdminProductsPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(INITIAL_CATS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_PRODUCT });
  const [newCategory, setNewCategory] = useState("");

  // Images (galerie multi-images)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [addMode, setAddMode] = useState<"url" | "file">("url");
  const [urlInput, setUrlInput] = useState("");

  // Alert
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const showAlert = (type: AlertType["type"], message: string, title?: string) => {
    setAlert({ show: true, type, message, title });
    setTimeout(() => setAlert(a => ({ ...a, show: false })), 4000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products/filter?search=${encodeURIComponent(search)}`);
      const data = await safeJson(res);

      if (!res.ok) {
        showAlert("error", data.error || `Erreur serveur (${res.status})`);
        setProducts([]);
        return;
      }

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  // Vidéo background
  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  }, []);

  /* ── Gestion de la galerie d'images ──────────────────────── */

  const addImageByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImages(prev => [...prev, { key: genKey(), kind: "url", preview: url, url }]);
    setUrlInput("");
  };

  const addImagesByFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Vercel serverless functions plafonnent le corps de requête à ~4.5MB.
    // Un fichier trop lourd déclenche un 500 vide côté plateforme, avant
    // même que la route ne s'exécute. On bloque donc ici en amont.
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB de marge de sécurité

    const valid: File[] = [];
    for (const file of files) {
      const isImage =
        file.type.startsWith("image/") ||
        file.name.match(/\.(jpg|jpeg|png|gif|webp|heic|heif|avif|bmp|tiff)$/i);

      if (!isImage) {
        showAlert("error", `"${file.name}" n'est pas une image valide`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        showAlert("error", `"${file.name}" dépasse 4MB`);
        continue;
      }
      valid.push(file);
    }

    valid.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [
          ...prev,
          { key: genKey(), kind: "file", preview: reader.result as string, file },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ""; // permet de resélectionner le même fichier plus tard
  };

  const removeImage = (key: string) => {
    setImages(prev => prev.filter(img => img.key !== key));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  /* ── Soumission du formulaire ────────────────────────────── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      showAlert("error", "Ajoutez au moins une image");
      return;
    }

    const fd = new FormData();
    if (editMode) fd.append("id", form.id.toString());

    ["name", "description", "price", "category", "gender", "color", "colorHex", "stock", "sizes", "material", "fit"]
      .forEach(k => fd.append(k, String((form as any)[k])));

    fd.append("isNew", form.isNew.toString());

    // On envoie l'ordre exact + le type de chaque image pour que le backend
    // puisse reconstruire le tableau `images` dans le bon ordre après upload.
    const order = images.map(img => img.kind);
    fd.append("imageOrder", JSON.stringify(order));

    images.forEach(img => {
      if (img.kind === "file" && img.file) {
        fd.append("images", img.file);      // plusieurs entrées possibles avec la même clé
      } else if (img.kind === "url" && img.url) {
        fd.append("imageUrls", img.url);    // idem, plusieurs entrées possibles
      }
    });

    try {
      const res = await fetch("/api/admin/product", {
        method: editMode ? "PUT" : "POST",
        body: fd,
      });

      const data = await safeJson(res);

      if (res.ok) {
        showAlert("success", editMode ? "Produit modifié avec succès !" : "Produit ajouté avec succès !");
        closeModal();
        fetchProducts();
      } else {
        showAlert("error", data.error || `Erreur lors de l'opération (${res.status})`);
      }
    } catch {
      showAlert("error", "Erreur réseau");
    }
  };

  const confirmDelete = (id: number) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;

    try {
      const checkRes = await fetch(`/api/admin/product/check?id=${productToDelete}`);
      const checkData = await safeJson(checkRes);

      if (checkData.inOrders && checkData.count > 0) {
        showAlert("warning", `Ce produit est présent dans ${checkData.count} commande(s). Suppression impossible.`, "Action bloquée");
        setShowDeleteConfirm(false);
        return;
      }

      const res = await fetch(`/api/admin/product?id=${productToDelete}`, { method: "DELETE" });
      const data = await safeJson(res);

      if (res.ok) {
        showAlert("success", "Produit supprimé avec succès");
        fetchProducts();
      } else {
        showAlert("error", data.error || "Erreur lors de la suppression");
      }
    } catch {
      showAlert("error", "Erreur réseau");
    } finally {
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const openAdd = () => {
    setEditMode(false);
    setForm({ ...EMPTY_PRODUCT });
    setImages([]);
    setAddMode("url");
    setUrlInput("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditMode(true);
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      category: p.category,
      gender: p.gender,
      color: p.color,
      colorHex: p.colorHex,
      stock: p.stock.toString(),
      sizes: p.sizes.join(","),
      material: p.material || "",
      fit: p.fit || "",
      isNew: p.isNew,
    });
    // Toutes les images existantes deviennent des entrées "url"
    setImages(p.images.map(url => ({ key: genKey(), kind: "url", preview: url, url })));
    setAddMode("url");
    setUrlInput("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setImages([]);
    setUrlInput("");
    setNewCategory("");
  };

  const addNewCategory = () => {
    const cat = newCategory.trim().toLowerCase();
    if (!cat || categories.includes(cat)) return;
    setCategories(prev => [...prev, cat]);
    setForm(f => ({ ...f, category: cat }));
    setNewCategory("");
  };

  const stockStatus = (stock: number) => {
    if (stock > 10) return "text-emerald-400 bg-emerald-500/10";
    if (stock > 0) return "text-amber-400 bg-amber-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@300;400;500;600;700&family=Syne:wght@500;600;700;800&display=swap');
        .admin-products { font-family: 'Instrument Sans', system-ui, sans-serif; }
      `}</style>

      <div className="admin-products min-h-screen relative overflow-hidden bg-[#0A0A0A] text-[#F8F6F2]">
        {/* Video Background */}
        <div className="video-background fixed inset-0 z-0">
          <video ref={videoRef} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20">
            <source src="/video/pp.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.12),rgba(0,0,0,0.88))] z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(#D4AF37_0.8px,transparent_1px)] [background-size:60px_60px] opacity-10 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[3px] bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-6">
                <Package size={16} className="text-[#D4AF37]" />
                ADMINISTRATION
              </div>
            </div>

            <button
              onClick={openAdd}
              className="flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black px-8 py-4 rounded-2xl font-semibold hover:brightness-110 transition-all active:scale-95"
            >
              <Plus size={24} /> Nouveau Produit
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl pl-14 py-4 text-white placeholder:text-white/50 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-3xl p-1">
              <button onClick={() => setView("grid")} className={`px-6 py-3 rounded-2xl transition ${view === "grid" ? "bg-[#D4AF37] text-black" : "text-white/70 hover:bg-white/10"}`}>
                <LayoutGrid size={20} />
              </button>
              <button onClick={() => setView("list")} className={`px-6 py-3 rounded-2xl transition ${view === "list" ? "bg-[#D4AF37] text-black" : "text-white/70 hover:bg-white/10"}`}>
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <Package size={80} className="mx-auto mb-6 text-white/30" />
              <h3 className="text-3xl font-semibold">Aucun produit trouvé</h3>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((p) => {
                const status = stockStatus(p.stock);
                return (
                  <div key={p.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all">
                    <div className="relative h-64 bg-black">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">👕</div>
                      )}
                      {p.images?.length > 1 && (
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full">
                          +{p.images.length - 1} photo{p.images.length - 1 > 1 ? "s" : ""}
                        </div>
                      )}
                      {p.isNew && (
                        <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-4 py-1 rounded-full">NOUVEAUTÉ</div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-3">{p.name}</h3>
                      <p className="text-white/60 text-sm mb-4">{p.category} • {p.gender}</p>

                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-3xl font-bold text-[#D4AF37]">{p.price}</span>
                          <span className="text-white/50 text-sm"> TND</span>
                        </div>
                        <div className={`text-sm px-4 py-1 rounded-full ${status}`}>
                          {p.stock} en stock
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 p-4 flex gap-3">
                      <button onClick={() => openEdit(p)} className="flex-1 py-3 rounded-2xl hover:bg-white/10 transition flex items-center justify-center gap-2 text-sm font-medium">
                        <Edit size={18} /> Modifier
                      </button>
                      <button onClick={() => confirmDelete(p.id)} className="flex-1 py-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition flex items-center justify-center gap-2 text-sm font-medium">
                        <Trash2 size={18} /> Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 flex items-center gap-6 rounded-3xl">
                  <div className="flex-1 font-medium">{p.name}</div>
                  <div className="text-[#D4AF37] font-bold">{p.price} TND</div>
                  <button onClick={() => openEdit(p)} className="p-3 hover:bg-white/10 rounded-xl"><Edit size={20} /></button>
                  <button onClick={() => confirmDelete(p.id)} className="p-3 hover:bg-red-500/10 text-red-400 rounded-xl"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === MODAL FORMULAIRE === */}
        {showModal && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6">
            <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-auto">
              <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-semibold">{editMode ? "Modifier le produit" : "Nouveau Produit"}</h2>
                <button onClick={closeModal} className="text-3xl text-white/60 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Identité */}
                <div>
                  <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Identité</p>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                    type="text" 
                    placeholder="Nom du produit" 
                    required 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  />
                  <textarea 
                    className="w-full mt-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 h-28 focus:outline-none focus:border-[#D4AF37] resize-none" 
                    placeholder="Description" 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Catégorie</p>
                  <div className="flex gap-2 flex-wrap">
                    <select 
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      value={form.category} 
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Nouvelle catégorie" 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)} 
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNewCategory(); } }} 
                        className="w-40 bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-[#D4AF37]" 
                      />
                      <button type="button" onClick={addNewCategory} className="bg-[#D4AF37] hover:bg-[#F5E6A3] text-black px-4 rounded-2xl text-sm font-medium">Ajouter</button>
                    </div>
                  </div>
                </div>

                {/* Genre + Prix */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Genre</p>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      value={form.gender} 
                      onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    >
                      {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Prix (TND)</p>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      required 
                      value={form.price} 
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Stock + Tailles */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Stock</p>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      type="number" 
                      min="0" 
                      required 
                      value={form.stock} 
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Tailles</p>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      type="text" 
                      placeholder="S,M,L,XL" 
                      value={form.sizes} 
                      onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Couleur + Matière */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Couleur</p>
                    <div className="flex gap-3">
                      <input 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                        type="text" 
                        placeholder="ex: Bleu marine" 
                        value={form.color} 
                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))} 
                      />
                      <input 
                        type="color" 
                        value={form.colorHex} 
                        onChange={e => setForm(f => ({ ...f, colorHex: e.target.value }))} 
                        className="w-14 h-14 rounded-2xl border border-white/10 cursor-pointer" 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Matière</p>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      type="text" 
                      placeholder="ex: 100% Coton" 
                      value={form.material} 
                      onChange={e => setForm(f => ({ ...f, material: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* Fit + Badge */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Coupe (Fit)</p>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]" 
                      type="text" 
                      placeholder="Slim, Regular..." 
                      value={form.fit} 
                      onChange={e => setForm(f => ({ ...f, fit: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">Badge</p>
                    <label className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 cursor-pointer hover:border-[#D4AF37]">
                      <input 
                        type="checkbox" 
                        checked={form.isNew} 
                        onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} 
                        className="w-5 h-5 accent-[#D4AF37]" 
                      />
                      <span>Marquer comme Nouveau</span>
                    </label>
                  </div>
                </div>

                {/* Images (galerie multi-images) */}
                <div>
                  <p className="text-[#D4AF37] text-sm tracking-widest uppercase mb-4">
                    Images du produit {images.length > 0 && <span className="text-white/40 normal-case">({images.length})</span>}
                  </p>

                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setAddMode("url")}
                      className={`flex-1 py-3 rounded-2xl font-medium transition ${addMode === "url" ? "bg-[#D4AF37] text-black" : "bg-white/5 border border-white/10"}`}
                    >
                      Ajouter par URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddMode("file")}
                      className={`flex-1 py-3 rounded-2xl font-medium transition ${addMode === "file" ? "bg-[#D4AF37] text-black" : "bg-white/5 border border-white/10"}`}
                    >
                      Ajouter des fichiers
                    </button>
                  </div>

                  {addMode === "url" ? (
                    <div className="flex gap-3">
                      <input
                        type="url"
                        placeholder="https://..."
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImageByUrl(); } }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={addImageByUrl}
                        className="bg-[#D4AF37] hover:bg-[#F5E6A3] text-black px-6 rounded-2xl font-medium"
                      >
                        Ajouter
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-white/20 rounded-3xl p-12 text-center cursor-pointer hover:border-[#D4AF37]">
                      <Upload className="mx-auto mb-4 text-white/50" size={48} />
                      <span className="text-white/70">Cliquez ou glissez une ou plusieurs images</span>
                      <p className="text-xs text-white/40 mt-2">JPG, PNG, WEBP, HEIC, etc. (max 4MB chacune)</p>
                      <input
                        type="file"
                        accept="image/*,.heic,.heif,.avif"
                        multiple
                        className="hidden"
                        onChange={addImagesByFiles}
                      />
                    </label>
                  )}

                  {images.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {images.map((img, i) => (
                        <div
                          key={img.key}
                          className="relative group rounded-2xl overflow-hidden border border-white/10 bg-black aspect-square"
                        >
                          <img
                            src={img.preview}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
                          />

                          {i === 0 && (
                            <div className="absolute top-2 left-2 bg-[#D4AF37] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                              PRINCIPALE
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => moveImage(i, -1)}
                                disabled={i === 0}
                                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded-lg"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(i, 1)}
                                disabled={i === images.length - 1}
                                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs px-2 py-1 rounded-lg"
                              >
                                →
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(img.key)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Retirer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-black py-4 rounded-2xl font-semibold">
                    {editMode ? "Enregistrer les modifications" : "Ajouter le produit"}
                  </button>
                  <button type="button" onClick={closeModal} className="flex-1 border border-white/30 py-4 rounded-2xl font-medium hover:bg-white/10">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* === MODAL SUPPRESSION === */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center p-6">
            <div className="bg-[#111] border border-red-500/30 rounded-3xl max-w-md w-full p-8 text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
              <h3 className="text-2xl font-semibold mb-3">Supprimer ce produit ?</h3>
              <p className="text-white/70 mb-8">Cette action est irréversible.</p>
              
              <div className="flex gap-4">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-4 border border-white/30 rounded-2xl font-medium hover:bg-white/10">Annuler</button>
                <button onClick={executeDelete} className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-semibold">Confirmer la suppression</button>
              </div>
            </div>
          </div>
        )}

        {/* === ALERT GLOBAL === */}
        {alert.show && (
          <div className={`fixed top-6 right-6 z-[200] flex items-start gap-3 border rounded-2xl px-5 py-4 max-w-sm shadow-2xl 
            ${alert.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 
              alert.type === 'error' ? 'border-red-500/30 bg-red-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
            {alert.type === 'success' && <CheckCircle size={24} className="text-emerald-400" />}
            {alert.type === 'error' && <XCircle size={24} className="text-red-400" />}
            {alert.type === 'warning' && <AlertTriangle size={24} className="text-amber-400" />}
            
            <div>
              {alert.title && <div className="font-semibold">{alert.title}</div>}
              <div className="text-sm text-white/80">{alert.message}</div>
            </div>
            
            <button onClick={() => setAlert(a => ({ ...a, show: false }))} className="ml-auto text-white/50 hover:text-white">
              <X size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}