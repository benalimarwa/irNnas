import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  const { id } = await params;  // ← await
  const orderId = parseInt(id);
  if (isNaN(orderId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

  const { userId: clerkId } = await auth();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  if (clerkId) {
    const dbUser = await prisma.user.findUnique({ where: { clerkId } });
    if (!dbUser || order.userId !== dbUser.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  return NextResponse.json({ order });
}