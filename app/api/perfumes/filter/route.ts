// app/api/perfumes/filter/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");
  const search = searchParams.get("search")?.toLowerCase();

  let where: any = { stock: { gt: 0 } };

  if (style && style !== "Tous") {
    where.style = { has: style.toLowerCase() };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { house: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const perfumes = await prisma.perfume.findMany({
    where,
    include: {
      house: { select: { id: true, name: true } },
    },
    orderBy: { price: "desc" },
  });

  return NextResponse.json(perfumes);
}