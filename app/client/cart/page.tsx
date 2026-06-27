// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";

type CartItem = {
  id: number;
  quantity: number;
  perfume: {
    id: number;
    name: string;
    price: number;
    imageUrl: string | null;
    house: { name: string };
  };
};

export default function CartPage() {
  const [cart, setCart] = useState<{ items: CartItem[] }>({ items: [] });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const removeFromCart = async (perfumeId: number) => {
    await fetch(`/api/cart?perfumeId=${perfumeId}`, { method: "DELETE" });
    fetchCart();
  };

  const total = cart.items.reduce((sum, item) => sum + item.perfume.price * item.quantity, 0);

  if (loading) return <div className="text-center py-20">Chargement du panier...</div>;
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <ShoppingBag size={80} className="mx-auto text-purple-300 mb-6" />
        <h1 className="text-4xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/catalogue" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-bold">
          Découvrir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 max-w-6xl mx-auto px-6">
     

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl shadow-xl p-6 flex gap-6 hover:shadow-2xl transition">
              <div className="relative w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden">
                <Image
                  src={item.perfume.imageUrl || "/placeholder.jpg"}
                  alt={item.perfume.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold">{item.perfume.name}</h3>
                <p className="text-purple-600 font-medium">{item.perfume.house.name}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-3xl font-black text-purple-700">
                    {(item.perfume.price * item.quantity).toLocaleString()} TND
                  </span>
                  <button
                    onClick={() => removeFromCart(item.perfume.id)}
                    className="p-3 bg-red-100 rounded-full hover:bg-red-200 transition"
                  >
                    <Trash2 className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-black mb-8">Récapitulatif</h2>
          <div className="space-y-4 text-xl">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{total.toLocaleString()} TND</span>
            </div>
            <div className="flex justify-between font-black text-2xl pt-6 border-t border-white/30">
              <span>Total</span>
              <span>{total.toLocaleString()} TND</span>
            </div>
          </div>
          <Link
            href="/client/checkout"
            className="block mt-8 text-center bg-white text-purple-600 font-black py-5 rounded-2xl text-2xl hover:scale-105 transition"
          >
            Passer commande
          </Link>
        </div>
      </div>
    </div>
  );
}