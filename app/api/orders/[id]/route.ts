// app/api/orders/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ Next.js 15 : params est une Promise
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // ✅ Next.js 15 : il faut await params
    const { id: rawId } = await params;
    const orderId = Number(rawId);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("params.id brut :", rawId);
    console.log("orderId parsé  :", orderId);
    console.log("clerkId        :", clerkId);

    if (!rawId || isNaN(orderId) || orderId <= 0) {
      return NextResponse.json(
        { error: "ID de commande invalide", received: rawId },
        { status: 400 }
      );
    }

    // Diagnostic : cherche sans filtre userId
    const orderRaw = await prisma.order.findUnique({
      where: { id: orderId },
    });

    console.log(
      "Order sans filtre userId :",
      orderRaw
        ? { id: orderRaw.id, userId: orderRaw.userId, status: orderRaw.status }
        : null
    );

    if (orderRaw) {
      console.log("clerkId actuel  :", clerkId);
      console.log("userId en base  :", orderRaw.userId);
      console.log("Correspondent ? :", clerkId === orderRaw.userId);
    }

    // Cherche avec filtre userId (sécurisé)
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: clerkId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.log("❌ 404 — commande introuvable avec filtre userId");
      return NextResponse.json(
        {
          error: "Commande introuvable",
          debug: {
            orderId,
            clerkId,
            orderExistsWithoutFilter: !!orderRaw,
            storedUserId: orderRaw?.userId ?? null,
            userIdMatch: orderRaw ? clerkId === orderRaw.userId : null,
          },
        },
        { status: 404 }
      );
    }

    console.log("✅ Commande trouvée :", order.id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("❌ Erreur GET order:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la commande",
        message: error.message,
      },
      { status: 500 }
    );
  }
}