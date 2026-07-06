// app/api/products/filter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Gender } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search   = searchParams.get("search")   ?? "";
    const category = searchParams.get("category") ?? "";
    const gender   = searchParams.get("gender")   ?? "";

    const products = await prisma.product.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { name:        { contains: search, mode: "insensitive" } },
                  { color:       { contains: search, mode: "insensitive" } },
                  { description: { contains: search, mode: "insensitive" } },
                ],
              }
            : {},
          category
            ? { category: { name: { equals: category, mode: "insensitive" } } }
            : {},
          gender && Object.values(Gender).includes(gender as Gender)
            ? { gender: gender as Gender }
            : {},
        ],
      },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Le front attend `category` en string (voir type Product côté admin),
    // pas l'objet relation complet renvoyé par Prisma via `include`.
    const flattened = products.map(p => ({
      ...p,
      category: p.category?.name ?? "",
    }));

    return NextResponse.json(flattened);
  } catch (error: any) {
  console.error("GET /api/products/filter — FULL ERROR:", error);
  console.error("STACK:", error?.stack);
  return NextResponse.json(
    { error: error.message ?? "Erreur", stack: error?.stack, code: error?.code },
    { status: 500 }
  );
  }}