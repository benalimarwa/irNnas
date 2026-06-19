// app/api/admin/houses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les maisons
export async function GET() {
  try {
    const houses = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(houses);
  } catch (error) {
    console.error("Erreur lors de la récupération des maisons:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle maison
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Nom de maison requis" },
        { status: 400 }
      );
    }


   


   
  } catch (error) {
    console.error("Erreur lors de la création de la maison:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création" },
      { status: 500 }
    );
  }
}