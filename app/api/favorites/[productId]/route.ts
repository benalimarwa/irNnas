import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { productId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  await prisma.favorite.deleteMany({
    where: { userId, productId: Number(params.productId) },
  });

  return NextResponse.json({ status: "removed" });
}