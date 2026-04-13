// app/admin/profile/AdminProfileEditForm.tsx
"use client";

import { useState } from "react";
import { Edit3, Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function AdminProfileEditForm({
  userId,
  currentName,
  currentEmail,
}: {
  userId: string;
  currentName: string;
  currentEmail: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { user } = useUser();
  const router = useRouter();

  // Le reste du code est IDENTIQUE au ClientProfileEditForm
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      if (selectedFile) {
        await user.setProfileImage({ file: selectedFile });
      }

      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name }),
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      alert("Une erreur est survenue.");
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg"
      >
        <Edit3 className="h-5 w-5" />
        Modifier mes informations
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Modifier mon profil Admin</h2>
              <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload - Identique */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-indigo-200">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                    ) : user?.imageUrl ? (
                      <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-5xl">👑</div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Nom et Email - Identique */}
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3.5 border border-gray-300 dark:border-gray-600 rounded-2xl focus:border-indigo-500" required />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Email</label>
                <p className="px-5 py-3.5 bg-gray-100 dark:bg-gray-700 rounded-2xl">{currentEmail}</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-4 border rounded-2xl">Annuler</button>
                <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-70">
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}