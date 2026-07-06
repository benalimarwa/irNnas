// app/api/admin/category/route.ts
//
// ⚠️ N'oublie pas d'ajouter d'abord ce modèle à ton schema.prisma :
//
// model Category {
//   id        Int      @id @default(autoincrement())
//   name      String   @unique
//   createdAt DateTime @default(now())
// }
//
// Puis lance : npx prisma migrate dev --name add_category_model

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ── GET : liste toutes les catégories ────────────────────────
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories.map(c => c.name));
  } catch (error: any) {
    console.error("GET /api/admin/category:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des catégories" },
      { status: 500 }
    );
  }
}

// ── POST : crée une nouvelle catégorie ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const body = await req.json();
    const name = (body.name as string)?.trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      // Pas une erreur bloquante : on renvoie juste la catégorie existante
      return NextResponse.json({ success: true, category: existing });
    }

    const category = await prisma.category.create({ data: { name } });
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error("POST /api/admin/category:", error);
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}