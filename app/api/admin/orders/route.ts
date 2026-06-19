// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
            product: {                       // ✅ product (pas perfume)
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,                          // ✅ Int
      userId: order.userId,
      userName: `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "Utilisateur",
      userEmail: order.user.email,
      total: order.total,                    // ✅ total (pas totalAmount)
      status: order.status,                  // ✅ minuscules (pending, confirmed…)
      deliveryMethod: (order as any).deliveryMethod ?? "DELIVERY",
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.product.name,      // ✅ productName (pas perfumeName)
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des commandes" }, { status: 500 });
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
      where: { id: parseInt(orderId) },      // ✅ parseInt (id est un Int)
      data: { status },
    });

    return NextResponse.json({ message: "Statut mis à jour avec succès", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}