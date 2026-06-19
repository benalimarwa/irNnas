"use client";

import { Heart, ShoppingBag } from "lucide-react";
import { PerfumeWithHouse } from "@/types/perfume";
import { useState } from "react";

export function PerfumeCard({ perfume }: { perfume: PerfumeWithHouse }) {
  const [isLiked, setIsLiked] = useState(false);

  const mainImage =
    perfume.images?.[0] ||
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600";

  return (
    <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden hover:shadow-pink-300/50 transition-all duration-500 border border-pink-100">
      <div className="relative h-80 bg-gradient-to-br from-purple-50 to-pink-50 p-8 flex items-center justify-center">
        <img
          src={mainImage}
          alt={perfume.name}
          className="max-h-full max-w-full object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
        />
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg hover:scale-110 transition"
        >
          <Heart
            className={`w-6 h-6 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-gray-800">{perfume.name}</h3>
          <span className="text-sm font-medium text-purple-600 bg-purple-100 px-4 py-2 rounded-full capitalize">
            {perfume.gender}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {perfume.description || "Un parfum d'exception"}
        </p>

        <div className="flex justify-between items-center mb-4">
          <span className="text-3xl font-black text-purple-700">
            {perfume.price.toLocaleString()} TND
          </span>
          <button className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:shadow-xl transition-shadow">
            <ShoppingBag size={20} />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}