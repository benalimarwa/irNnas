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

    // Validation
    if (!customerInfo?.firstName || !customerInfo?.lastName) {
      return NextResponse.json(
        { error: "Prénom et nom sont obligatoires" },
        { status: 400 }
      );
    }
    if (!customerInfo?.phone) {
      return NextResponse.json(
        { error: "Téléphone est obligatoire" },
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
    // On met à jour firstName/lastName s'ils existent déjà dans User
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: `${userId}@temp.com`,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
        },
      });
    } else {
      // Mettre à jour le nom si le User existe déjà
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
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

    // ─── Encoder toutes les infos client dans deliveryMethod ──────────────────
    // Format : "PICKUP" ou "DELIVERY::{...json...}"
    // Cela évite de modifier le schéma Prisma.
    let deliveryMethodValue: string;

    if (deliveryMethod === "PICKUP") {
      deliveryMethodValue = "PICKUP";
    } else {
      const deliveryData = {
        phone:       customerInfo.phone       ?? null,
        address:     customerInfo.address     ?? null,
        city:        customerInfo.city        ?? null,
        governorate: customerInfo.governorate ?? null,
        postalCode:  customerInfo.postalCode  ?? null,
        country:     customerInfo.country     ?? null,
        notes:       customerInfo.notes       ?? null,
      };
      // "DELIVERY::{...}" — on peut parser côté admin avec .split("::")[1]
      deliveryMethodValue = `DELIVERY::${JSON.stringify(deliveryData)}`;
    }

    // Création de la commande
    const order = await prisma.order.create({
      data: {
        userId: user.clerkId,
        total,
        status: "pending",
        deliveryMethod: deliveryMethodValue, // contient tout
      },
    });

    // Créer les OrderItems
    await prisma.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId:   order.id,
        productId: item.productId,
        quantity:  item.quantity,
        size:      item.size ?? null,
        price:     item.product.price,
      })),
    });

    // Mise à jour du stock
    for (const item of cart.items) {
      const newStock = item.product.stock - item.quantity;

      let stockStatus: "NORMAL" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
      if (newStock === 0)       stockStatus = "OUT_OF_STOCK";
      else if (newStock <= 3)   stockStatus = "CRITICAL";
      else if (newStock <= 10)  stockStatus = "LOW";
      else                      stockStatus = "NORMAL";

      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: newStock, stockStatus },
      });

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