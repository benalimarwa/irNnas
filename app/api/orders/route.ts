import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { customerInfo, deliveryMethod } = body;

    if (!customerInfo?.name || !customerInfo?.phone) {
      return NextResponse.json({ error: "Nom et téléphone sont obligatoires" }, { status: 400 });
    }

    if (!deliveryMethod || !["PICKUP", "DELIVERY"].includes(deliveryMethod)) {
      return NextResponse.json({ error: "Mode de livraison invalide" }, { status: 400 });
    }

    // Récupérer ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@temp.com`,
          firstName: customerInfo.name.split(" ")[0] || null,
          lastName: customerInfo.name.split(" ").slice(1).join(" ") || null,
        },
      });
    }

    // Récupérer le panier
    const cart = await prisma.cart.findUnique({
      where: { userId: user.clerkId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Vérification stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour ${item.product.name}` }, { status: 400 });
      }
    }

    const validatedDeliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + validatedDeliveryFee;

    // Création de la commande (seulement les champs existants)
    const order = await prisma.order.create({
      data: {
        userId: user.clerkId,
        total,
        status: "pending",
        deliveryMethod,
        // Pas de "notes" pour éviter l'erreur
      },
    });

    // Mise à jour du stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Vider le panier
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur création commande:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la création de la commande", 
      message: error.message 
    }, { status: 500 });
  }
}