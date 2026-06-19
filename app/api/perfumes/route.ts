// app/api/perfumes/route.ts  (OBLIGATOIREMENT à cet endroit)
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const perfumes = await prisma.product.findMany({
    where: { category: "parfum" },
    orderBy: { price: "desc" },
  });

  // GARANTIE : on renvoie TOUJOURS un tableau
  return NextResponse.json(perfumes);
}