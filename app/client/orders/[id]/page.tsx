// app/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Store,
  MapPin,
  Phone,
  Calendar,
  ArrowLeft,
  Home
} from "lucide-react";

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  perfume: {
    id: number;
    name: string;
    imageUrl: string | null;
    house: { name: string };
  };
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  deliveryMethod: "PICKUP" | "DELIVERY";
  createdAt: string;
  items: OrderItem[];
};

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 px-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
            <Package size={100} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
            <h1 className="text-3xl font-black mb-4 text-gray-900 dark:text-gray-100">Commande introuvable</h1>
            <Link 
              href="/catalogue" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition mt-6"
            >
              <Home size={20} />
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500",
    CONFIRMED: "bg-blue-500",
    PREPARING: "bg-purple-500",
    SHIPPED: "bg-indigo-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header succès */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Commande confirmée !
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Merci pour votre commande. Nous la traiterons dans les plus brefs délais.
          </p>
        </div>

        {/* Numéro de commande */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/80 mb-1">Numéro de commande</p>
              <p className="text-3xl font-black">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 mb-1">Statut</p>
              <span className={`inline-block px-4 py-2 rounded-full font-bold ${statusColors[order.status]} bg-white/20`}>
                {statusLabels[order.status]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          
          {/* Info livraison */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
              {order.deliveryMethod === "DELIVERY" ? (
                <Truck className="text-purple-600 dark:text-purple-400" />
              ) : (
                <Store className="text-purple-600 dark:text-purple-400" />
              )}
              Mode de livraison
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-lg font-bold">
                {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
              </p>
              <p className="text-sm">
                {order.deliveryMethod === "DELIVERY" 
                  ? "Votre commande sera livrée à l'adresse indiquée sous 2-5 jours ouvrables."
                  : "Votre commande sera prête à être récupérée en magasin sous 24h. Nous vous contacterons."
                }
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <Calendar className="text-purple-600 dark:text-purple-400" />
              Date de commande
            </h2>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-lg font-bold">
                {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm">
                à {new Date(order.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-6 text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <Package className="text-purple-600 dark:text-purple-400" />
            Articles commandés ({totalItems})
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl"
              >
                <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-600 dark:to-gray-500 rounded-xl overflow-hidden">
                  {item.perfume.imageUrl ? (
                    <img
                      src={item.perfume.imageUrl}
                      alt={item.perfume.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💐</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.perfume.name}</h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium">{item.perfume.house.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Quantité: {item.quantity}</span>
                    <span className="text-xl font-black text-purple-700 dark:text-purple-400">
                      {(item.price * item.quantity).toFixed(2)} TND
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <div className="flex justify-between items-center text-2xl font-black">
              <span className="text-gray-900 dark:text-gray-100">Total payé</span>
              <span className="text-purple-600 dark:text-purple-400">{order.totalAmount.toFixed(2)} TND</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-right mt-2">
              Paiement à la {order.deliveryMethod === "DELIVERY" ? "livraison" : "récupération"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/client/catalog"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition shadow-xl"
          >
            <Home size={20} />
            Retour au catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}