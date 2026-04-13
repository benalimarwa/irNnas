// app/api/perfumes/route.ts  (OBLIGATOIREMENT à cet endroit)
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const perfumes = await prisma.perfume.findMany({
    include: {
      house: {
        select: { id: true, name: true },
      },
    },
    orderBy: { price: "desc" },
  });

  // GARANTIE : on renvoie TOUJOURS un tableau
  return NextResponse.json(perfumes);
}