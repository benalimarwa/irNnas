// app/api/admin/product/check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ error: "ID du produit requis" }, { status: 400 });
    }

    // Vérifier si le produit est utilisé dans des commandes
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id }
    });

    return NextResponse.json({
      inOrders: orderItemsCount > 0,
      count: orderItemsCount
    });

  } catch (error) {
    console.error("Check product error:", error);
    return NextResponse.json({ 
      error: "Erreur serveur",
      inOrders: false,
      count: 0 
    }, { status: 500 });
  }
}