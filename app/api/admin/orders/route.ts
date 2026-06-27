// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ─── Helper pour parser le deliveryMethod ────────────────────────────────────
function parseDeliveryMethod(raw: string) {
  if (raw.startsWith("DELIVERY::")) {
    try {
      const json = raw.slice("DELIVERY::".length); // tout ce qui suit "::"
      const info = JSON.parse(json);
      return {
        method: "DELIVERY" as const,
        phone:       info.phone       ?? null,
        address:     info.address     ?? null,
        city:        info.city        ?? null,
        governorate: info.governorate ?? null,
        postalCode:  info.postalCode  ?? null,
        country:     info.country     ?? null,
        notes:       info.notes       ?? null,
      };
    } catch {
      // JSON corrompu → fallback
      return { method: "DELIVERY" as const };
    }
  }
  return { method: "PICKUP" as const };
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => {
      // ─── Parser les infos de livraison ───────────────────────────────────
      const delivery = parseDeliveryMethod(order.deliveryMethod ?? "PICKUP");

      return {
        id:           order.id,
        userId:       order.userId,
        userName:     `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "Utilisateur",
        userEmail:    order.user.email,
        total:        order.total,
        status:       order.status,
        createdAt:    order.createdAt.toISOString(),

        // ─── Infos livraison parsées ──────────────────────────────────────
        deliveryMethod: delivery.method,          // "PICKUP" | "DELIVERY"
        deliveryInfo: delivery.method === "DELIVERY"
          ? {
              phone:       delivery.phone       ?? null,
              address:     delivery.address     ?? null,
              city:        delivery.city        ?? null,
              governorate: delivery.governorate ?? null,
              postalCode:  delivery.postalCode  ?? null,
              country:     delivery.country     ?? null,
              notes:       delivery.notes       ?? null,
            }
          : null,                                 // null si retrait en magasin

        items: order.items.map((item) => ({
          id:          item.id,
          productName: item.product.name,
          quantity:    item.quantity,
          price:       item.price,
        })),
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId et status sont requis" }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
    });

    return NextResponse.json({ message: "Statut mis à jour avec succès", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}