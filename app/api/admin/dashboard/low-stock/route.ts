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
    stockStatus: true,
    category: {
      select: { name: true },   // only grab the name
    },
  },
  orderBy: { stock: "asc" },
  take: 8,
});

// Flatten before sending to the client
const formatted = products.map((p) => ({
  id: p.id,
  name: p.name,
  stock: p.stock,
  stockStatus: p.stockStatus,
  category: p.category?.name ?? "Inconnu",
}));

return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}