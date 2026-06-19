// app/api/admin/product/route.ts

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ── helpers ───────────────────────────────────────────────────

function parseCommon(formData: FormData) {
  const priceRaw = formData.get("price") as string;
  const stockRaw = formData.get("stock") as string;

  const price = parseFloat(priceRaw);
  const stock = parseInt(stockRaw);

  return {
    name:        (formData.get("name")        as string)?.trim() || "",
    description: (formData.get("description") as string)?.trim() || "",
    price:       isNaN(price) ? 0 : price,
    category:    (formData.get("category")    as string)?.trim() || "",
    gender:      (formData.get("gender")      as string)?.trim() || "unisex",
    color:       (formData.get("color")       as string)?.trim() || "",
    colorHex:    (formData.get("colorHex")    as string)?.trim() || "#888888",
    stock:       isNaN(stock) ? 0 : stock,
    sizes:       (formData.get("sizes") as string)
                   ?.split(",")
                   .map(s => s.trim())
                   .filter(Boolean) ?? [],
    material:    (formData.get("material")    as string)?.trim() || "",
    fit:         (formData.get("fit")         as string)?.trim() || "",
    isNew:       formData.get("isNew") === "true",
  };
}

function validateCommon(data: ReturnType<typeof parseCommon>): string | null {
  if (!data.name)     return "Le nom est requis";
  if (!data.category) return "La catégorie est requise";
  if (!data.gender)   return "Le genre est requis";
  if (data.price < 0) return "Le prix ne peut pas être négatif";
  if (data.stock < 0) return "Le stock ne peut pas être négatif";
  return null;
}

/**
 * Saves a base64 data URL to /public/uploads/ and returns the
 * public path. Falls back to the raw string if it is already
 * an https:// URL.
 *
 * Replace this function with a CDN call in production
 * (Cloudinary, UploadThing, S3…).
 */
async function resolveImage(imageUrl: string | null): Promise<string | undefined> {
  if (!imageUrl || imageUrl.trim() === "") return undefined;

  // Regular URL — keep as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Relative path already saved — keep as-is
  if (imageUrl.startsWith("/uploads/")) {
    return imageUrl;
  }

  // Base64 data URL — save to disk
  if (imageUrl.startsWith("data:image/")) {
    try {
      const [header, base64Data] = imageUrl.split(",");
      if (!base64Data) throw new Error("Base64 data manquante");

      const ext = header.split("/")[1]?.split(";")[0] ?? "jpg";
      const filename = `product_${Date.now()}.${ext}`;
      const uploadsDir = join(process.cwd(), "public", "uploads");

      await mkdir(uploadsDir, { recursive: true });
      await writeFile(join(uploadsDir, filename), Buffer.from(base64Data, "base64"));

      return `/uploads/${filename}`;
    } catch (err) {
      console.error("resolveImage — échec sauvegarde base64:", err);
      return undefined;
    }
  }

  return undefined;
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const common   = parseCommon(formData);

    const validationError = validateCommon(common);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const imageUrl = await resolveImage(formData.get("imageUrl") as string | null);

    const product = await prisma.product.create({
      data: {
        name:        common.name,
        description: common.description,
        price:       common.price,
        category:    common.category as any,
        gender:      common.gender   as any,
        color:       common.color,
        colorHex:    common.colorHex,
        stock:       common.stock,
        sizes:       common.sizes,
        material:    common.material,
        fit:         common.fit,
        isNew:       common.isNew,
        images:      imageUrl ? [imageUrl] : [],
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("POST /api/admin/product:", error);
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la création" },
      { status: 500 }
    );
  }
}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();
    const idRaw    = formData.get("id") as string;
    const id       = parseInt(idRaw);

    if (!idRaw || isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID produit invalide ou manquant" }, { status: 400 });
    }

    // Check product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    const common = parseCommon(formData);

    const validationError = validateCommon(common);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const imageUrl = await resolveImage(formData.get("imageUrl") as string | null);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name:        common.name,
        description: common.description,
        price:       common.price,
        category:    common.category as any,
        gender:      common.gender   as any,
        color:       common.color,
        colorHex:    common.colorHex,
        stock:       common.stock,
        sizes:       common.sizes,
        material:    common.material,
        fit:         common.fit,
        isNew:       common.isNew,
        // Only update images if a new one was provided
        ...(imageUrl !== undefined ? { images: [imageUrl] } : {}),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("PUT /api/admin/product:", error);
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const idRaw = new URL(req.url).searchParams.get("id");
    const id    = parseInt(idRaw ?? "");

    if (!idRaw || isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID produit invalide ou manquant" }, { status: 400 });
    }

    // Check product exists
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    // Safety check: refuse if product is in any order
    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Ce produit appartient à ${orderCount} commande(s) et ne peut pas être supprimé.` },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Produit supprimé" });
  } catch (error: any) {
    console.error("DELETE /api/admin/product:", error);
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}