// app/api/products/filter/route.ts
import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";           // ← Correction : sans les accolades
import { Category, Gender } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const search   = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const gender   = searchParams.get("gender")   ?? "";

  const products = await prisma.product.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name:  { contains: search, mode: "insensitive" } },
                { color: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        category && Object.values(Category).includes(category as Category)
          ? { category: category as Category }
          : {},
        gender && Object.values(Gender).includes(gender as Gender)
          ? { gender: gender as Gender }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}