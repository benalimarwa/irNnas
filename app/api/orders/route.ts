import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendStockAlertIfNeeded } from "@/utils/stock-alert";

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
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.product.name}` },
          { status: 400 }
        );
      }
    }

    const validatedDeliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = subtotal + validatedDeliveryFee;

    // Création de la commande
    const order = await prisma.order.create({
      data: {
        userId: user.clerkId,
        total,
        status: "pending",
        deliveryMethod,
      },
    });

    // Mise à jour du stock + calcul stockStatus + alerte
    for (const item of cart.items) {
      const newStock = item.product.stock - item.quantity;

      // Calcul du nouveau statut
      let stockStatus: "NORMAL" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
      if (newStock === 0) stockStatus = "OUT_OF_STOCK";
      else if (newStock <= 3) stockStatus = "CRITICAL";
      else if (newStock <= 10) stockStatus = "LOW";
      else stockStatus = "NORMAL";

      // Mise à jour stock + stockStatus en une seule opération
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: newStock, stockStatus },
      });

      // Envoi alerte si nécessaire (non bloquant)
      sendStockAlertIfNeeded({
        id: item.productId,
        name: item.product.name,
        stock: newStock,
        stockStatus,
      }).catch((err) => console.error("Alerte stock échouée:", err));
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
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande", message: error.message },
      { status: 500 }
    );
  }
}