// app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  ShoppingBag, 
  ArrowLeft,
  Truck,
  Store,
  ChevronRight,
  Calendar,
  Eye,
  AlertCircle
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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusLabels: Record<string, string> = {
    PENDING: "En attente",
    CONFIRMED: "Confirmée",
    PREPARING: "En préparation",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELLED: "Annulée",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    PREPARING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    SHIPPED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <AlertCircle className="w-5 h-5" />,
    CONFIRMED: <Package className="w-5 h-5" />,
    PREPARING: <Package className="w-5 h-5" />,
    SHIPPED: <Truck className="w-5 h-5" />,
    DELIVERED: <Package className="w-5 h-5" />,
    CANCELLED: <AlertCircle className="w-5 h-5" />,
  };

  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-2xl text-gray-600 dark:text-gray-400">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <Link 
            href="/catalogue" 
            className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold mb-6 transition"
          >
            <ArrowLeft size={20} />
            Retour au catalogue
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Mes Commandes
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                {orders.length} commande{orders.length > 1 ? "s" : ""} au total
              </p>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-xl font-bold transition ${
                filter === "all"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Toutes ({orders.length})
            </button>
            {Object.entries(statusLabels).map(([status, label]) => {
              const count = orders.filter(o => o.status === status).length;
              if (count === 0) return null;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-bold transition ${
                    filter === status
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <ShoppingBag size={100} className="mx-auto text-purple-300 dark:text-purple-600 mb-6" />
              <h2 className="text-3xl font-black mb-4 text-gray-900 dark:text-gray-100">
                {filter === "all" ? "Aucune commande" : `Aucune commande ${statusLabels[filter].toLowerCase()}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {filter === "all" 
                  ? "Vous n'avez pas encore passé de commande."
                  : "Aucune commande ne correspond à ce filtre."
                }
              </p>
              {filter === "all" && (
                <Link 
                  href="/catalogue" 
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition"
                >
                  Découvrir le catalogue
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              const firstThreeItems = order.items.slice(0, 3);
              
              return (
                <div 
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition"
                >
                  <div className="p-6 md:p-8">
                    
                    {/* En-tête de la commande */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl flex items-center justify-center">
                          {order.deliveryMethod === "DELIVERY" ? (
                            <Truck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Store className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Commande</p>
                          <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${statusColors[order.status]}`}>
                          {statusIcons[order.status]}
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>

                    {/* Détails de la commande */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      
                      {/* Date et mode de livraison */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                          <Calendar size={16} />
                          <span className="text-sm">Commandé le</span>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {order.deliveryMethod === "DELIVERY" ? "Livraison à domicile" : "Retrait en magasin"}
                        </p>
                      </div>

                      {/* Total et articles */}
                      <div className="text-right md:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total</p>
                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                          {order.totalAmount.toFixed(2)} TND
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {totalItems} article{totalItems > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Aperçu des articles */}
                    <div className="mb-6">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Articles</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {firstThreeItems.map((item) => (
                          <div 
                            key={item.id}
                            className="flex-shrink-0 w-24 h-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden relative group"
                          >
                            {item.perfume.imageUrl ? (
                              <img
                                src={item.perfume.imageUrl}
                                alt={item.perfume.name}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">💐</div>
                            )}
                            {item.quantity > 1 && (
                              <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {item.quantity}
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                              +{order.items.length - 3}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bouton voir détails */}
                    <Link
                      href={`/client/orders/${order.id}`}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl hover:scale-105 transition"
                    >
                      <Eye size={20} />
                      Voir les détails
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}