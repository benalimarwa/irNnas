import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { 
        stockStatus: "CRITICAL"   // Ou "LOW" si tu veux inclure les deux
        // Pour inclure CRITICAL et LOW :
        // stockStatus: { in: ["LOW", "CRITICAL"] }
      },
      select: { 
        id: true, 
        name: true, 
        stock: true, 
        category: true 
      },
      orderBy: { stock: "asc" },
      take: 6,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}