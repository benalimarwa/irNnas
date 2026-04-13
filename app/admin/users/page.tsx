// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Calendar, ShoppingBag, Eye, X, CheckCircle, XCircle, AlertCircle, User as UserIcon } from "lucide-react";

type User = {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  createdAt: string;
  _count: {
    orders: number;
  };
  orders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
};

type AlertType = {
  show: boolean;
  type: "success" | "error" | "warning";
  message: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<AlertType>({ show: false, type: "success", message: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  };

  const showAlert = (type: "success" | "error" | "warning", message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" });
    }, 3000);
  };

  const getTotalSpent = (user: User) => {
    return user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", label: "En attente" },
      CONFIRMED: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", label: "Confirmée" },
      PREPARING: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300", label: "En préparation" },
      SHIPPED: { color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300", label: "Expédiée" },
      DELIVERED: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", label: "Livrée" },
      CANCELLED: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", label: "Annulée" },
    };

    const config = statusConfig[status] || { color: "bg-gray-100 text-gray-800", label: status };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-20">
      
      {/* Alert */}
      {alert.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className={`relative max-w-md w-full rounded-2xl shadow-2xl p-6 ${
            alert.type === "success" ? "bg-gradient-to-br from-green-500 to-emerald-600" :
            alert.type === "error" ? "bg-gradient-to-br from-red-500 to-rose-600" :
            "bg-gradient-to-br from-amber-500 to-orange-600"
          }`}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {alert.type === "success" && <CheckCircle className="w-8 h-8 text-white" />}
                {alert.type === "error" && <XCircle className="w-8 h-8 text-white" />}
                {alert.type === "warning" && <AlertCircle className="w-8 h-8 text-white" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">
                  {alert.type === "success" ? "Succès !" : alert.type === "error" ? "Erreur" : "Attention"}
                </h3>
                <p className="text-white/90">{alert.message}</p>
              </div>
              <button onClick={() => setAlert({ ...alert, show: false })} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""} inscrit{filteredUsers.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Total Utilisateurs</h3>
              <UserIcon className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-4xl font-black">{users.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Commandes Totales</h3>
              <ShoppingBag className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-4xl font-black">
              {users.reduce((sum, user) => sum + user._count.orders, 0)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Revenus Totaux</h3>
              <Mail className="h-8 w-8 opacity-80" />
            </div>
            <p className="text-4xl font-black">
              {users.reduce((sum, user) => sum + getTotalSpent(user), 0).toFixed(2)} TND
            </p>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-2xl text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* User Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold truncate">
                        {user.name || "Utilisateur"}
                      </h3>
                      <p className="text-sm text-white/80 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {user._count.orders} commande{user._count.orders > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Total dépensé: {getTotalSpent(user).toFixed(2)} TND
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowModal(true);
                    }}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold shadow-md hover:shadow-lg"
                  >
                    <Eye size={18} />
                    Voir Détails
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full p-8 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-purple-600 dark:text-purple-400">
                Profil Utilisateur
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X size={32} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
              </button>
            </div>

            {/* User Info */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black">
                  {selectedUser.name?.[0]?.toUpperCase() || selectedUser.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.name || "Utilisateur"}</h3>
                  <p className="text-white/90">{selectedUser.email}</p>
                  <p className="text-sm text-white/70 mt-1">
                    Inscrit le {new Date(selectedUser.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Commandes</p>
                <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {selectedUser._count.orders}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Dépensé</p>
                <p className="text-3xl font-black text-green-600 dark:text-green-400">
                  {getTotalSpent(selectedUser).toFixed(2)} TND
                </p>
              </div>
            </div>

            {/* Orders History */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Historique des Commandes ({selectedUser.orders.length})
              </h3>
              {selectedUser.orders.length === 0 ? (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune commande pour le moment
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedUser.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    >
                      <div>
                        <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-purple-700 dark:text-purple-400">
                          {order.totalAmount.toFixed(2)} TND
                        </p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}