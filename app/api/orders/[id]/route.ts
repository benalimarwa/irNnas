import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = parseInt(params.id);
  if (isNaN(orderId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const { userId: clerkId } = await auth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  // Si connecté → vérifier que la commande appartient à cet utilisateur
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser || order.userId !== dbUser.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }
  // Si guest → accès libre par orderId (pas de vérification)

  return NextResponse.json({ order });
}