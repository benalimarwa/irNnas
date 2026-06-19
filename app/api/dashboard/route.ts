// app/api/dashboard/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Orders — userId dans Order = clerkId directement
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const loyaltyPoints = Math.floor(totalSpent * 1.25);

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ordersCount,
      wishlistCount: 0, // pas de modèle Favorite dans le schema
      totalSpent,
      loyaltyPoints,
      recentOrders,
    });
  } catch (err) {
    console.error('[API /dashboard]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}