// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            role:true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Sans nom",
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt.toISOString(),
      _count: user._count,
      orders: user.orders.map((order) => ({
        id: order.id,
        totalAmount: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}