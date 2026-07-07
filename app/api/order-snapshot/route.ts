import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ajuste le chemin si ton client Prisma est ailleurs

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      orderId,
      customerEmail,
      customerFirstName,
      customerLastName,
      customerPhone,
      deliveryMethod,
      deliveryFee,
      total,
      address,
      city,
      governorate,
      postalCode,
      country,
      notes,
      products,
    } = body;

    if (!customerEmail || !customerFirstName || !customerLastName || !customerPhone) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const snapshot = await prisma.orderSnapshot.create({
      data: {
        orderId: orderId ?? null,
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone,
        deliveryMethod,
        deliveryFee: deliveryFee ?? 0,
        total: total ?? 0,
        address: address ?? null,
        city: city ?? null,
        governorate: governorate ?? null,
        postalCode: postalCode ?? null,
        country: country ?? null,
        notes: notes ?? null,
        products: products ?? [],
      },
    });

    return NextResponse.json({ success: true, snapshotId: snapshot.id });
  } catch (err) {
    console.error("Erreur order-snapshot:", err);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}