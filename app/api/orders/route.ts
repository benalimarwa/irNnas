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
    const { deliveryMethod, customerInfo } = body;

    console.log("📦 Données reçues:", { deliveryMethod, customerInfo });

    // Validation
    if (!deliveryMethod || !["PICKUP", "DELIVERY"].includes(deliveryMethod)) {
      return NextResponse.json({ error: "Méthode de livraison invalide" }, { status: 400 });
    }

    if (!customerInfo?.name || !customerInfo?.phone) {
      return NextResponse.json({ error: "Informations client incomplètes" }, { status: 400 });
    }

    if (deliveryMethod === "DELIVERY" && (!customerInfo.address || !customerInfo.city)) {
      return NextResponse.json({ error: "Adresse de livraison requise" }, { status: 400 });
    }

    // Récupérer l'utilisateur
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
      where: { userId: user.id },
      include: {
        items: {
          include: {
            perfume: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    console.log("📦 Panier:", cart.items.length, "articles");

    // Vérifier le stock pour chaque article
    for (const item of cart.items) {
      if (item.perfume.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour ${item.perfume.name}` },
          { status: 400 }
        );
      }
    }

    // Calculer le total
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.perfume.price * item.quantity,
      0
    );
    const deliveryFee = deliveryMethod === "DELIVERY" ? 7 : 0;
    const totalAmount = subtotal + deliveryFee;

    console.log("💰 Total:", totalAmount, "TND");

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        status: "PENDING",
        deliveryMethod,
        items: {
          create: cart.items.map((item) => ({
            perfumeId: item.perfumeId,
            quantity: item.quantity,
            price: item.perfume.price,
          })),
        },
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

    console.log("✅ Commande créée:", order.id);

    // Mettre à jour le stock
    for (const item of cart.items) {
      await prisma.perfume.update({
        where: { id: item.perfumeId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    console.log("✅ Stock mis à jour");

    // Vider le panier
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log("✅ Panier vidé");

    // TODO: Sauvegarder les infos client (vous pouvez créer un modèle CustomerInfo si besoin)
    // Pour l'instant, on peut les stocker dans un champ JSON de la commande
    // ou créer une table séparée

    console.log("✅ Commande terminée avec succès");

    return NextResponse.json({
      success: true,
      message: "Commande créée avec succès",
      orderId: order.id,
      order,
    });
  } catch (error: any) {
    console.error("❌ Erreur POST orders:", error);
    console.error("Stack:", error.stack);
    
    return NextResponse.json({
      error: "Erreur lors de la création de la commande",
      message: error.message,
    }, { status: 500 });
  }
}

// GET pour récupérer les commandes de l'utilisateur
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
      where: { userId: user.id },
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("❌ Erreur GET orders:", error);
    return NextResponse.json({
      error: "Erreur lors de la récupération des commandes",
      message: error.message,
    }, { status: 500 });
  }
}