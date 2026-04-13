// app/api/orders/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const orderId = params.id;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id, // S'assurer que la commande appartient à l'utilisateur
      },
      include: {
        items: {
          include: {
            perfume: {
              include: {
                house: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("❌ Erreur GET order:", error);
    return NextResponse.json({
      error: "Erreur lors de la récupération de la commande",
      message: error.message,
    }, { status: 500 });
  }
}