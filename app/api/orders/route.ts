// app/api/orders/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/orders - Début");

    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      console.log("❌ Non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { customerInfo, deliveryMethod, deliveryFee = 0 } = body;

    console.log("📦 Données reçues:", { customerInfo, deliveryMethod, deliveryFee });

    if (!customerInfo?.name || !customerInfo?.phone) {
      return NextResponse.json(
        { error: "Informations client incomplètes" },
        { status: 400 }
      );
    }

    if (!deliveryMethod || !["PICKUP", "DELIVERY"].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: "Mode de livraison invalide" },
        { status: 400 }
      );
    }

    // Récupérer ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      console.log("📝 Création utilisateur");
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@temp.com`,
        },
      });
    }

    // Récupérer le panier
    const cart = await prisma.cart.findUnique({
      where: { userId: user.clerkId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    console.log("📦 Panier:", cart.items.length, "articles");

    // Vérifier le stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    // ✅ Total = articles + frais de livraison envoyés depuis le client
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    // ✅ On valide le deliveryFee côté serveur (ne jamais faire confiance au client seul)
    const validatedDeliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
    const total = subtotal + validatedDeliveryFee;

    console.log("💰 Sous-total:", subtotal, "TND");
    console.log("🚚 Frais livraison:", validatedDeliveryFee, "TND");
    console.log("💰 Total:", total, "TND");

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: user.clerkId,
        total,                       // ✅ Inclut les frais de livraison
        status: "pending",
        deliveryMethod,              // ✅ PICKUP ou DELIVERY
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size ?? null,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    console.log("✅ Commande créée:", order.id);

    // Mettre à jour le stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Vider le panier
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    console.log("✅ Commande terminée avec succès");

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      orderId: order.id,
      order,
    });
  } catch (error: any) {
    console.error("❌ Erreur POST orders:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création de la commande",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET — commandes de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.clerkId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("❌ Erreur GET orders:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des commandes",
        message: error.message,
      },
      { status: 500 }
    );
  }
}