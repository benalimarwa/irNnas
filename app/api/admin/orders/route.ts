// app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

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
              select: {
                id: true,
                name: true,
                price: true,
                color: true,
                colorHex: true,
                images: true,
                category: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ─── Récupérer les snapshots liés (nouvelle table, indépendante) ──────
    const orderIds = orders.map((o) => o.id);
    const snapshots = await prisma.orderSnapshot.findMany({
      where: { orderId: { in: orderIds } },
      orderBy: { createdAt: "desc" },
    });

    // Map orderId -> snapshot le plus récent
    const snapshotByOrderId = new Map<number, (typeof snapshots)[number]>();
    for (const snap of snapshots) {
      if (snap.orderId != null && !snapshotByOrderId.has(snap.orderId)) {
        snapshotByOrderId.set(snap.orderId, snap);
      }
    }

    const formattedOrders = orders.map((order) => {
      // ─── Parser les infos de livraison (ancien système) ────────────────
      const delivery = parseDeliveryMethod(order.deliveryMethod ?? "PICKUP");
      const snapshot = snapshotByOrderId.get(order.id) ?? null;

    // ─── Méthode de livraison : le snapshot est la source de vérité ────


// ─── Méthode de livraison : le snapshot est la source de vérité ────
const resolvedMethod = snapshot?.deliveryMethod === "DELIVERY" || snapshot?.deliveryMethod === "PICKUP"
  ? snapshot.deliveryMethod
  : delivery.method;

return {
  id:           order.id,
  userId:       order.userId,
  userName:     `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "Utilisateur",
  userEmail:    order.user.email,
  total:        order.total,
  status:       order.status,
  createdAt:    order.createdAt.toISOString(),

  // ─── Méthode de livraison (priorité au snapshot) ───────────────────
  deliveryMethod: resolvedMethod,
  deliveryInfo: resolvedMethod === "DELIVERY"
    ? {
        phone:       snapshot?.customerPhone ?? delivery.phone       ?? null,
        address:     snapshot?.address       ?? delivery.address     ?? null,
        city:        snapshot?.city          ?? delivery.city        ?? null,
        governorate: snapshot?.governorate   ?? delivery.governorate ?? null,
        postalCode:  snapshot?.postalCode    ?? delivery.postalCode  ?? null,
        country:     snapshot?.country       ?? delivery.country     ?? null,
        notes:       snapshot?.notes         ?? delivery.notes       ?? null,
      }
    : null,

        // ─── Couleur affichée directement depuis le produit (fix) ──────────
        items: order.items.map((item) => ({
          id:          item.id,
          productName: item.product.name,
          quantity:    item.quantity,
          price:       item.price,
          size:        item.size ?? null,
          color:       item.product.color,
          colorHex:    item.product.colorHex,
          category:    item.product.category?.name ?? null,
          image:       item.product.images?.[0] ?? null,
        })),

        // ─── Détails enregistrés dans OrderSnapshot (nouvelle table) ───────
        snapshot: snapshot
          ? {
              customerEmail:     snapshot.customerEmail,
              customerFirstName: snapshot.customerFirstName,
              customerLastName:  snapshot.customerLastName,
              customerPhone:     snapshot.customerPhone,
              deliveryMethod:    snapshot.deliveryMethod,
              deliveryFee:       snapshot.deliveryFee,
              total:             snapshot.total,
              address:           snapshot.address,
              city:              snapshot.city,
              governorate:       snapshot.governorate,
              postalCode:        snapshot.postalCode,
              country:           snapshot.country,
              notes:             snapshot.notes,
              products:          snapshot.products,
              createdAt:         snapshot.createdAt.toISOString(),
            }
          : null,
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
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
    });

    // ─── Envoi de l'email de confirmation au client ────────────────────────
    if (status === "confirmed") {
      try {
        // Le snapshot n'a pas de relation stricte -> on le récupère à part
        const snapshot = await prisma.orderSnapshot.findFirst({
          where: { orderId: updatedOrder.id },
          orderBy: { createdAt: "desc" },
        });

        const toEmail = snapshot?.customerEmail ?? updatedOrder.user.email;
        const toName = snapshot
          ? `${snapshot.customerFirstName} ${snapshot.customerLastName}`.trim()
          : `${updatedOrder.user.firstName ?? ""} ${updatedOrder.user.lastName ?? ""}`.trim() ||
            updatedOrder.user.email;

        const delivery = parseDeliveryMethod(updatedOrder.deliveryMethod ?? "PICKUP");

        await sendOrderConfirmationEmail({
          toEmail,
          toName,
          orderId: updatedOrder.id,
          items: updatedOrder.items.map((item) => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: updatedOrder.total,
          deliveryMethod: snapshot?.deliveryMethod ?? delivery.method,
          address:
            snapshot?.address ??
            (delivery.method === "DELIVERY" ? delivery.address ?? null : null),
        });
      } catch (emailError) {
        // On ne bloque jamais la mise à jour de statut si l'email échoue
        console.error("Erreur lors de l'envoi de l'email de confirmation:", emailError);
      }
    }

    return NextResponse.json({ message: "Statut mis à jour avec succès", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}