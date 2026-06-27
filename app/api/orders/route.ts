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

    // ── Validation ────────────────────────────────────────────────────────────
    if (!customerInfo?.firstName?.trim() && !customerInfo?.name?.trim()) {
      return NextResponse.json(
        { error: "Le prénom est obligatoire" },
        { status: 400 }
      );
    }
    if (!customerInfo?.phone?.trim()) {
      return NextResponse.json(
        { error: "Le numéro de téléphone est obligatoire" },
        { status: 400 }
      );
    }
    if (!deliveryMethod || !["PICKUP", "DELIVERY"].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: "Mode de livraison invalide" },
        { status: 400 }
      );
    }
    if (deliveryMethod === "DELIVERY") {
      if (!customerInfo?.city?.trim()) {
        return NextResponse.json(
          { error: "La ville est obligatoire pour la livraison" },
          { status: 400 }
        );
      }
    }

    // ── Extraire les champs (compatibilité ancien/nouveau format) ─────────────
    // Le checkout envoie firstName/lastName séparément ; on gère aussi
    // l'ancien champ "name" au cas où.
    const firstName: string =
      customerInfo.firstName?.trim() ||
      customerInfo.name?.split(" ")[0]?.trim() ||
      "";
    const lastName: string =
      customerInfo.lastName?.trim() ||
      customerInfo.name?.split(" ").slice(1).join(" ")?.trim() ||
      "";

    const phone: string       = customerInfo.phone?.trim()       ?? "";
    const address: string     = customerInfo.address?.trim()     ?? "";
    const city: string        = customerInfo.city?.trim()        ?? "";
    const governorate: string = customerInfo.governorate?.trim() ?? "";
    const postalCode: string  = customerInfo.postalCode?.trim()  ?? "";
    const country: string     = customerInfo.country?.trim()     ?? "TN";
    const notes: string       = customerInfo.notes?.trim()       ?? "";

    // ── Récupérer / créer l'utilisateur ───────────────────────────────────────
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId:   userId,
          email:     `${userId}@temp.com`,
          firstName: firstName || null,
          lastName:  lastName  || null,
        },
      });
    }

    // ── Panier ────────────────────────────────────────────────────────────────
    const cart = await prisma.cart.findUnique({
      where: { userId: user.clerkId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // ── Vérification stock ────────────────────────────────────────────────────
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour « ${item.product.name} »` },
          { status: 400 }
        );
      }
    }

    // ── Calcul totaux ─────────────────────────────────────────────────────────
    const validatedDeliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = subtotal + validatedDeliveryFee;

    // ── Créer la commande avec toutes les infos client ────────────────────────
    const order = await prisma.order.create({
      data: {
        userId:        user.clerkId,
        total,
        deliveryFee:   validatedDeliveryFee,
        status:        "pending",
        deliveryMethod,

        // Informations client
        customerFirstName:   firstName   || null,
        customerLastName:    lastName    || null,
        customerPhone:       phone       || null,
        customerAddress:     address     || null,
        customerCity:        city        || null,
        customerGovernorate: governorate || null,
        customerPostalCode:  postalCode  || null,
        customerCountry:     country     || null,
        customerNotes:       notes       || null,
      },
    });

    // ── Créer les OrderItems ──────────────────────────────────────────────────
    await prisma.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId:   order.id,
        productId: item.productId,
        quantity:  item.quantity,
        size:      item.size ?? null,
        price:     item.product.price,
      })),
    });

    // ── Mise à jour stock + alerte ────────────────────────────────────────────
    for (const item of cart.items) {
      const newStock = item.product.stock - item.quantity;

      let stockStatus: "NORMAL" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";
      if (newStock === 0)       stockStatus = "OUT_OF_STOCK";
      else if (newStock <= 3)   stockStatus = "CRITICAL";
      else if (newStock <= 10)  stockStatus = "LOW";
      else                      stockStatus = "NORMAL";

      await prisma.product.update({
        where: { id: item.productId },
        data:  { stock: newStock, stockStatus },
      });

      sendStockAlertIfNeeded({
        id:          item.productId,
        name:        item.product.name,
        stock:       newStock,
        stockStatus,
      }).catch((err) => console.error("Alerte stock échouée :", err));
    }

    // ── Vider le panier ───────────────────────────────────────────────────────
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("❌ Erreur création commande :", error);
    return NextResponse.json(
      {
        error:   "Erreur lors de la création de la commande",
        message: error.message,
      },
      { status: 500 }
    );
  }
}