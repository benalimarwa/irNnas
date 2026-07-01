import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getInternalUserId(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const internalUserId = await getInternalUserId(clerkId);
  if (!internalUserId) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: internalUserId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites.map((f) => f.product));
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const { productId } = await req.json();

    const internalUserId = await getInternalUserId(clerkId);
    if (!internalUserId) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: { userId: internalUserId, productId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ status: "removed" });
    }

    await prisma.favorite.create({
      data: { userId: internalUserId, productId },
    });
    return NextResponse.json({ status: "added" });
  } catch (err) {
    console.error("Erreur POST /api/favorites:", err);
    return NextResponse.json(
      { error: "Erreur serveur", detail: String(err) },
      { status: 500 }
    );
  }
}