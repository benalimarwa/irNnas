// app/admin/profile/page.tsx
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { User, Shield, Users, TrendingUp, ShoppingBag, Camera, Edit3 } from "lucide-react";
import Image from "next/image";
import AdminProfileEditForm from "./AdminProfileEditForm";

export default async function AdminProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses.find(addr => 
    addr.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!email) redirect("/sign-in");

  // Vérifier que c'est bien un admin
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (dbUser?.role !== "ADMIN") {
    redirect("/client/profile");
  }

  // Statistiques globales pour l'admin
  const [totalUsers, totalOrders, totalRevenue, recentOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Admin */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-52 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden shadow-xl">
                  {clerkUser.imageUrl ? (
                    <img src={clerkUser.imageUrl} alt="Profile" width={128} height={128} className="object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-6xl font-bold">
                      👑
                    </div>
                  )}
                </div>
                <a href="https://accounts.clerk.com/user/profile" target="_blank" className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg">
                  <Camera className="h-5 w-5 text-indigo-600" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-20 pb-8 px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  {clerkUser.firstName} {clerkUser.lastName}
                  <span className="text-2xl">👑</span>
                </h1>
                <p className="text-lg text-indigo-600 font-semibold">Administrateur</p>
              </div>
              <AdminProfileEditForm 
                userId={dbUser.id}
                currentName={dbUser.name || ""}
                currentEmail={dbUser.email}
              />
            </div>
          </div>
        </div>

        {/* Statistiques Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-blue-600" />
              <div>
                <p className="text-3xl font-bold">{totalUsers}</p>
                <p className="text-gray-500">Utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-4">
              <ShoppingBag className="h-10 w-10 text-purple-600" />
              <div>
                <p className="text-3xl font-bold">{totalOrders}</p>
                <p className="text-gray-500">Commandes totales</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-10 w-10 text-green-600" />
              <div>
                <p className="text-3xl font-bold">{totalRevenue._sum.totalAmount?.toFixed(0) || 0}</p>
                <p className="text-gray-500">CA Total (TND)</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
            <div className="flex items-center gap-4">
              <Shield className="h-10 w-10 text-amber-600" />
              <div>
                <p className="text-3xl font-bold">Admin</p>
                <p className="text-gray-500">Rôle actuel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières commandes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Dernières Commandes</h2>
          {/* Liste des commandes récentes */}
        </div>
      </div>
    </div>
  );
}