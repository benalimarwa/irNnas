import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const ordersWithItems = await prisma.order.findMany({
      where: { 
        status: { not: "cancelled" } 
      },
      include: {
        items: {
          include: { 
            product: true 
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalCost = 0;

    ordersWithItems.forEach((order) => {
      totalRevenue += order.total || 0;                    // ← Correction : "total" et non "totalAmount"
      
      
    });

    const grossProfit = totalRevenue - totalCost;
    const margin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
    });
  } catch (error) {
    console.error("Erreur profit dashboard:", error);
    return NextResponse.json({
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      margin: 0,
    });
  }
}