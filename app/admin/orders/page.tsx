"use client";

import { useState, useEffect } from "react";
import { Package, Truck, Clock, CheckCircle, XCircle, MapPin, TrendingUp } from "lucide-react";

interface OrderItem {
  id: number;
  perfumeName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  deliveryMethod: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders");
      if (!response.ok) {
        throw new Error("Échec du chargement des commandes");
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du statut");
      }

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<
      string,
      { label: string; color: string; icon: React.ElementType }
    > = {
      PENDING: {
        label: "En attente",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: Clock,
      },
      CONFIRMED: {
        label: "Confirmée",
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        icon: CheckCircle,
      },
      PREPARING: {
        label: "Préparation",
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        icon: Package,
      },
      SHIPPED: {
        label: "Expédiée",
        color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
        icon: Truck,
      },
      DELIVERED: {
        label: "Livrée",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        icon: CheckCircle,
      },
      CANCELLED: {
        label: "Annulée",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        icon: XCircle,
      },
    };

    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getDeliveryBadge = (method: string) => {
    return method === "PICKUP" ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm">
        <MapPin className="w-3.5 h-3.5" />
        Sur place
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30 backdrop-blur-sm">
        <Truck className="w-3.5 h-3.5" />
        Livraison
      </span>
    );
  };

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-indigo-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <p className="text-slate-400 text-lg mt-6 font-medium">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec effet glassmorphism */}
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
              Gestion des Commandes
            </h1>
            <p className="text-slate-400 text-lg">
              Suivez et gérez toutes les commandes en temps réel
            </p>
          </div>
        </div>

        {/* Statistiques avec cartes glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total", count: orders.length, color: "from-indigo-500 to-purple-500", icon: Package },
            {
              label: "En attente",
              count: orders.filter((o) => o.status === "PENDING").length,
              color: "from-yellow-500 to-orange-500",
              icon: Clock,
            },
            {
              label: "En cours",
              count: orders.filter((o) =>
                ["CONFIRMED", "PREPARING", "SHIPPED"].includes(o.status)
              ).length,
              color: "from-blue-500 to-cyan-500",
              icon: TrendingUp,
            },
            {
              label: "Livrées",
              count: orders.filter((o) => o.status === "DELIVERED").length,
              color: "from-green-500 to-emerald-500",
              icon: CheckCircle,
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" style={{background: `linear-gradient(135deg, ${stat.color})`}}></div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.count}</p>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filtres avec design moderne */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
            Filtrer par statut
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              "ALL",
              "PENDING",
              "CONFIRMED",
              "PREPARING",
              "SHIPPED",
              "DELIVERED",
              "CANCELLED",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 {
                  filter === status
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50 scale-105"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50"
                }`}
              >
                {status === "ALL" ? "Toutes" : getStatusBadge(status).props.children[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-16 text-center border border-slate-700/50">
              <div className="w-20 h-20 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Aucune commande
              </h3>
              <p className="text-slate-400">
                Aucune commande ne correspond à ce filtre
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="p-6">
                  {/* En-tête */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        <span className="text-slate-500">#</span>
                        {order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {getStatusBadge(order.status)}
                      {getDeliveryBadge(order.deliveryMethod)}
                    </div>
                  </div>

                  {/* Client */}
                  <div className="bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-700/30">
                    <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                      Client
                    </h4>
                    <p className="text-base text-white font-semibold mb-1">
                      {order.userName}
                    </p>
                    <p className="text-sm text-slate-400">{order.userEmail}</p>
                  </div>

                  {/* Articles */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">
                      Articles commandés
                    </h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-white mb-1">
                              {item.perfumeName}
                            </p>
                            <p className="text-sm text-slate-400">
                              Quantité: <span className="text-indigo-400 font-medium">{item.quantity}</span>
                            </p>
                          </div>
                          <p className="font-bold text-lg text-white">
                            {item.price.toFixed(2)} <span className="text-slate-400 text-sm">TND</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total et actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-700/50">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Montant total</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {order.totalAmount.toFixed(2)} <span className="text-xl text-slate-400">TND</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {order.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                            disabled={updatingOrderId === order.id}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                          >
                            {updatingOrderId === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Confirmer
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                            disabled={updatingOrderId === order.id}
                            className="px-6 py-3 bg-slate-700/50 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {updatingOrderId === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400 border-t-transparent"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Annuler
                          </button>
                        </>
                      )}

                      {order.status === "CONFIRMED" && (
                        <div className="flex items-center gap-3">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order.id, "SHIPPED");
                              }
                            }}
                            disabled={updatingOrderId === order.id}
                            className="px-4 py-3 bg-slate-700/50 border-2 border-indigo-500/50 text-indigo-400 rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Société de livraison</option>
                            <option value="aramex">Aramex</option>
                            <option value="dhl">DHL Express</option>
                            <option value="fedex">FedEx</option>
                            <option value="tunisie-poste">Tunisie Poste</option>
                            <option value="glovo">Glovo</option>
                            <option value="yassir">Yassir Express</option>
                          </select>
                          <button
                            onClick={() => updateOrderStatus(order.id, "PREPARING")}
                            disabled={updatingOrderId === order.id}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                          >
                            {updatingOrderId === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                            Préparer
                          </button>
                        </div>
                      )}

                      {order.status === "PREPARING" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                          disabled={updatingOrderId === order.id}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                        >
                          {updatingOrderId === order.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                          Expédiée
                        </button>
                      )}

                      {order.status === "SHIPPED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                          disabled={updatingOrderId === order.id}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
                        >
                          {updatingOrderId === order.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Livrée
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}