import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - liste des parfums (ou un seul par id)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");

    if (idStr) {
      const id = parseInt(idStr);
      if (isNaN(id)) {
        return NextResponse.json({ error: "ID invalide" }, { status: 400 });
      }

      const perfume = await prisma.product.findUnique({
        where: { id },
      });

      if (!perfume || perfume.category !== "parfum") {
        return NextResponse.json({ error: "Parfum introuvable" }, { status: 404 });
      }

      return NextResponse.json(perfume);
    }

    const perfumes = await prisma.product.findMany({
      where: { category: "parfum" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(perfumes);
  } catch (error) {
    console.error("❌ Error fetching perfumes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des parfums" },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();

    const idStr = formData.get("id") as string;
    const id = parseInt(idStr);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID invalide ou manquant" }, { status: 400 });
    }

    // Vérifier que le parfum existe
    const existingPerfume = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingPerfume || existingPerfume.category !== "parfum") {
      return NextResponse.json(
        { error: `Parfum avec ID ${id} introuvable` },
        { status: 404 }
      );
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const priceStr = formData.get("price") as string;
    const price = parseFloat(priceStr);
    const genderStr = formData.get("gender") as string;
    const color = formData.get("color") as string;
    const colorHex = (formData.get("colorHex") as string) || existingPerfume.colorHex;
    const sizesStr = formData.get("sizes") as string;
    const material = formData.get("material") as string | null;
    const fit = formData.get("fit") as string | null;
    const stockStr = formData.get("stock") as string;
    const stock = parseInt(stockStr);
    const isNewStr = formData.get("isNew") as string | null;

    if (!name || !priceStr || isNaN(price) || !genderStr || !color || !stockStr || isNaN(stock)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (!["men", "women", "unisex"].includes(genderStr)) {
      return NextResponse.json(
        { error: "Genre invalide (men, women, unisex attendu)" },
        { status: 400 }
      );
    }
    const gender = genderStr as "men" | "women" | "unisex";

    let images: string[] = existingPerfume.images;
    const imageFile = formData.get("image") as File | null;
    const imageUrlStr = formData.get("imageUrl") as string | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      images = [`data:${imageFile.type};base64,${base64}`];
    } else if (imageUrlStr && !existingPerfume.images.includes(imageUrlStr)) {
      images = [imageUrlStr];
    }

    const sizes = sizesStr
      ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean)
      : existingPerfume.sizes;

    const perfume = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description ?? existingPerfume.description,
        price,
        category: "parfum",
        gender,
        color,
        colorHex,
        sizes,
        material: material ?? existingPerfume.material,
        fit: fit ?? existingPerfume.fit,
        stock,
        images,
        isNew: isNewStr ? isNewStr === "true" : existingPerfume.isNew,
      },
    });

    return NextResponse.json(perfume);
  } catch (error) {
    console.error("❌ Error updating perfume:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la modification du parfum",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const priceStr = formData.get("price") as string;
    const price = parseFloat(priceStr);
    const genderStr = formData.get("gender") as string;
    const color = formData.get("color") as string;
    const colorHex = (formData.get("colorHex") as string) || "#888888";
    const sizesStr = formData.get("sizes") as string;
    const material = formData.get("material") as string | null;
    const fit = formData.get("fit") as string | null;
    const stockStr = formData.get("stock") as string;
    const stock = parseInt(stockStr) || 0;
    const isNewStr = formData.get("isNew") as string | null;

    if (!name || !priceStr || isNaN(price) || !genderStr || !color) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (!["men", "women", "unisex"].includes(genderStr)) {
      return NextResponse.json(
        { error: "Genre invalide (men, women, unisex attendu)" },
        { status: 400 }
      );
    }
    const gender = genderStr as "men" | "women" | "unisex";

    let images: string[] = [];
    const imageFile = formData.get("image") as File | null;
    const imageUrlStr = formData.get("imageUrl") as string | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      images = [`data:${imageFile.type};base64,${base64}`];
    } else if (imageUrlStr) {
      images = [imageUrlStr];
    }

    const sizes = sizesStr
      ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const perfume = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category: "parfum",
        gender,
        color,
        colorHex,
        sizes,
        material,
        fit,
        stock,
        images,
        isNew: isNewStr === "true",
      },
    });

    return NextResponse.json(perfume, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating perfume:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la création du parfum",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    const id = idStr ? parseInt(idStr) : 0;

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "ID manquant ou invalide" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting perfume:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du parfum" },
      { status: 500 }
    );
  }
}