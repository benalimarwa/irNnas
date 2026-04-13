// app/admin/catalog/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X, Edit, Trash2, Home, Upload, Link as LinkIcon, CheckCircle, AlertCircle, XCircle } from "lucide-react";

type House = {
  id: number;
  name: string;
};

type Perfume = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  house: House;
  style: string[];
  stock: number;
};

type AlertType = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
};

export default function AdminCatalogPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNewHouseModal, setShowNewHouseModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newHouseName, setNewHouseName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageInputMode, setImageInputMode] = useState<"url" | "file">("url");
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  const [form, setForm] = useState({
    id: 0,
    name: "",
    price: "",
    category: "women",
    houseId: "",
    style: "floral, fruité",
    stock: "100",
    imageUrl: "",
  });

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const fetchPerfumes = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    const res = await fetch(`/api/perfumes/filter?${params}`);
    const data = await res.json();
    setPerfumes(data);
    setLoading(false);
  };

  const fetchHouses = async () => {
    const res = await fetch("/api/admin/houses");
    const data = await res.json();
    setHouses(data);
  };

  useEffect(() => {
    fetchPerfumes();
    fetchHouses();
  }, [searchTerm]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setForm({ ...form, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedHouse = houses.find(h => h.id === parseInt(form.houseId));
    if (!selectedHouse) {
      showAlert("error", "Veuillez sélectionner une maison");
      return;
    }

    const formData = new FormData();
    
    if (editMode) {
      formData.append("id", form.id.toString());
    }
    
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("house", selectedHouse.name);
    formData.append("style", form.style);
    formData.append("stock", form.stock);
    
    if (imageInputMode === "file" && imageFile) {
      formData.append("image", imageFile);
    } else {
      formData.append("imageUrl", form.imageUrl || "");
    }

    const url = "/api/admin/perfume";
    const method = editMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const responseData = await res.json();

      if (res.ok) {
        showAlert("success", editMode ? "Parfum modifié avec succès !" : "Parfum ajouté avec succès !");
        closeModal();
        fetchPerfumes();
      } else {
        showAlert("error", responseData.error || "Erreur lors de l'opération");
      }
    } catch (error) {
      showAlert("error", "Erreur réseau lors de l'opération");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce parfum ?")) return;

    const res = await fetch(`/api/admin/perfume?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      showAlert("success", "Parfum supprimé avec succès !");
      fetchPerfumes();
    } else {
      showAlert("error", "Erreur lors de la suppression");
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setImageFile(null);
    setImagePreview("");
    setImageInputMode("url");
    const defaultForm = {
      id: 0,
      name: "",
      price: "",
      category: "women",
      houseId: houses.length > 0 ? houses[0].id.toString() : "",
      style: "floral, fruité",
      stock: "100",
      imageUrl: "",
    };
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (perfume: Perfume) => {
    setEditMode(true);
    setImageFile(null);
    setImagePreview(perfume.imageUrl || "");
    setImageInputMode("url");
    const editForm = {
      id: perfume.id,
      name: perfume.name,
      price: perfume.price.toString(),
      category: perfume.category,
      houseId: perfume.house.id.toString(),
      style: perfume.style.join(", "),
      stock: perfume.stock.toString(),
      imageUrl: perfume.imageUrl || "",
    };
    setForm(editForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setImageFile(null);
    setImagePreview("");
    setImageInputMode("url");
  };

  const handleAddHouse = async () => {
    if (!newHouseName.trim()) {
      showAlert("warning", "Veuillez entrer un nom de maison");
      return;
    }

    const res = await fetch("/api/admin/houses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newHouseName }),
    });

    if (res.ok) {
      showAlert("success", "Maison ajoutée avec succès !");
      setNewHouseName("");
      setShowNewHouseModal(false);
      fetchHouses();
    } else {
      const error = await res.json();
      showAlert("error", error.error || "Erreur lors de l'ajout");
    }
  };

  const grouped = perfumes.reduce((acc, p) => {
    const house = p.house.name;
    if (!acc[house]) acc[house] = [];
    acc[house].push(p);
    return acc;
  }, {} as Record<string, Perfume[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-20 transition-colors duration-300">
      
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

      <div className="max-w-7xl mx-auto px-6">

        {/* Header Admin */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Gestion du Catalogue
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Interface Administrateur
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 hover:scale-110 transition shadow-xl"
          >
            <Plus size={28} />
            Ajouter un parfum
          </button>
        </div>

        {/* Recherche */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un parfum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 py-5 rounded-full border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg shadow-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : perfumes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500 dark:text-gray-400">Aucun parfum</p>
            <button
              onClick={openAddModal}
              className="mt-6 bg-purple-600 text-white px-8 py-4 rounded-full font-bold"
            >
              Ajouter le premier parfum
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([house, items]) => (
            <div key={house} className="mb-16">
              <h2 className="text-4xl font-black mb-6 text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <Home className="w-8 h-8" />
                {house}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition relative group"
                  >
                    {/* Boutons d'action Admin */}
                    <div className="absolute top-4 right-4 z-10 flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 shadow-lg transition"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 shadow-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="relative h-80 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-contain p-8 group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                          💐
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {p.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{p.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {p.style.slice(0, 3).map((s, i) => (
                          <span key={i} className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                      <p className="text-3xl font-black text-purple-700 dark:text-purple-400 mb-3">{p.price} TND</p>
                      <p className={`text-sm font-medium mb-2 ${p.stock > 10 ? 'text-green-600 dark:text-green-400' : p.stock > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'}`}>
                        Stock: {p.stock} unités
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALE AJOUT/MODIFICATION */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-10 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-purple-600 dark:text-purple-400">
                {editMode ? `Modifier le Parfum` : "Nouveau Parfum"}
              </h2>
              <button onClick={closeModal}>
                <X size={32} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <input
                type="text"
                placeholder="Nom du parfum (ex: Baccarat Rouge 540)"
                required
                value={form.name}
                className="w-full px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="flex gap-2">
                <select
                  value={form.houseId}
                  required
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => setForm({ ...form, houseId: e.target.value })}
                >
                  <option value="">Sélectionner une maison</option>
                  {houses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewHouseModal(true)}
                  className="bg-green-600 text-white px-6 py-4 rounded-xl hover:bg-green-700 font-bold"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Prix en TND"
                  required
                  value={form.price}
                  className="px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />

                <select
                  value={form.category}
                  className="px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="women">Femme</option>
                  <option value="men">Homme</option>
                  <option value="unisex">Unisexe</option>
                </select>
              </div>

              <input
                type="text"
                placeholder="Styles (ex: floral, oriental, boisé)"
                value={form.style}
                className="w-full px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={(e) => setForm({ ...form, style: e.target.value })}
              />

              <input
                type="number"
                placeholder="Stock disponible"
                required
                value={form.stock}
                className="w-full px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              {/* Section Image */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Image du parfum
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageInputMode("url")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                      imageInputMode === "url"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <LinkIcon size={18} />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode("file")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                      imageInputMode === "file"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Upload size={18} />
                    Fichier
                  </button>
                </div>

                {imageInputMode === "url" ? (
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    className="w-full px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                  />
                ) : (
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition bg-purple-50 dark:bg-gray-700">
                      <Upload size={32} className="text-purple-500 dark:text-purple-400 mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {imageFile ? imageFile.name : "Cliquez pour sélectionner une image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>
                )}

                {(imagePreview || form.imageUrl) && (
                  <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                    <img
                      src={imagePreview || form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-xl font-black text-xl hover:scale-105 transition"
                >
                  {editMode ? "Enregistrer" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-5 bg-gray-200 dark:bg-gray-600 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-gray-900 dark:text-gray-100"
                >
                  Annuler
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODALE NOUVELLE MAISON */}
      {showNewHouseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">Nouvelle Maison</h3>
              <button onClick={() => setShowNewHouseModal(false)}>
                <X size={24} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Nom de la maison"
              value={newHouseName}
              onChange={(e) => setNewHouseName(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-purple-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none text-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              onKeyPress={(e) => e.key === 'Enter' && handleAddHouse()}
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleAddHouse}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowNewHouseModal(false)}
                className="px-8 py-4 bg-gray-200 dark:bg-gray-600 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-500 transition text-gray-900 dark:text-gray-100"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

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