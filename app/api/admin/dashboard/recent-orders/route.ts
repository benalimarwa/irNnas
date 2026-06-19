import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    const result = orders.map((o) => ({
      id: o.id,
      userName: o.user.firstName
        ? `${o.user.firstName} ${o.user.lastName ?? ""}`.trim()
        : o.user.email,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}