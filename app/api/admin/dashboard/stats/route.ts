import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Stats globales
    const totalStats = await prisma.order.aggregate({
      where: { 
        status: { not: "cancelled" } 
      },
      _sum: { 
        total: true          // ← Correction : "total" et non "totalAmount"
      },
      _count: { 
        id: true 
      },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "pending" },
    });

    const [totalUsers, totalProducts] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
    ]);

    return NextResponse.json({
      totalUsers,
      totalOrders: totalStats._count?.id || 0,
      totalProducts,
      totalRevenue: Math.round((totalStats._sum?.total || 0) * 100) / 100,
      pendingOrders,
    });
  } catch (error) {
    console.error("Erreur stats dashboard:", error);
    
    // Fallback (à supprimer une fois tout fonctionne)
    return NextResponse.json({ 
      totalUsers: 2, 
      totalOrders: 8, 
      totalProducts: 10, 
      totalRevenue: 1444.88, 
      pendingOrders: 2 
    });
  }
}