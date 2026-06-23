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
        OR: [
          { stockStatus: { in: ["LOW", "CRITICAL", "OUT_OF_STOCK"] } },
          { stock: { lte: 15 } },
        ],
      },
      select: {
        id: true,
        name: true,
        stock: true,
        category: true,
        stockStatus: true,
      },
      orderBy: { stock: "asc" },
      take: 8,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}