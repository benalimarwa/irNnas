import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId } });

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true, price: true } },
          },
        },
      },
    });

    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const loyaltyPoints = Math.floor(totalSpent * 1.25);

    const recentOrders = orders.slice(0, 5).map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
      itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
      items: o.items.slice(0, 3).map((i) => ({
        productName: i.product.name,
        productImage: i.product.images?.[0] ?? null,
      })),
    }));

    // Isolé : si Favorite plante (mauvais nom de champ, etc.), on ne bloque pas tout le dashboard
    let wishlistCount = 0;
    try {
      wishlistCount = await prisma.favorite.count({
        where: { userId: dbUser.id },
      });
    } catch (favErr) {
      console.error('[API /dashboard] favorite count failed:', favErr);
    }

    return NextResponse.json({
      ordersCount,
      wishlistCount,
      totalSpent,
      loyaltyPoints,
      recentOrders,
    });
  } catch (err) {
    console.error('[API /dashboard]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}