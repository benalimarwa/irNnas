// app/api/admin/product/route.ts

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
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

function getExtension(mimeType: string, fallbackName?: string): string {
  const mimeMap: Record<string, string> = {
    "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
    "image/gif": "gif", "image/webp": "webp", "image/avif": "avif",
    "image/heic": "heic", "image/heif": "heif", "image/bmp": "bmp",
    "application/octet-stream": "jpg",
  };

  const fromMime = mimeMap[mimeType.toLowerCase()];
  if (fromMime) return fromMime;

  if (fallbackName) {
    const ext = fallbackName.split(".").pop()?.toLowerCase();
    if (ext && ["jpg","jpeg","png","gif","webp","heic","heif","avif","bmp"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  }
  return "jpg";
}

async function resolveImage(
  imageFile: File | null,
  imageUrl: string | null,
): Promise<string | undefined> {
  // 1. Fichier uploadé
  if (imageFile && imageFile.size > 0) {
    try {
      const ext = getExtension(imageFile.type, imageFile.name);
      const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;

      const blob = await put(filename, imageFile, {
        access: "public",
      });

      return blob.url; // ex: https://xxxx.public.blob.vercel-storage.com/product_....jpg
    } catch (err) {
      console.error("resolveImage — file error:", err);
      throw new Error("Impossible de sauvegarder l'image");
    }
  }

  if (!imageUrl?.trim()) return undefined;

  // 2. URL externe déjà hébergée (http(s) ou déjà un blob vercel)
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // 3. Data URL (base64) venant du preview file-reader
  if (imageUrl.startsWith("data:")) {
    try {
      const commaIdx = imageUrl.indexOf(",");
      if (commaIdx === -1) throw new Error("Data URL invalide");

      const header = imageUrl.slice(0, commaIdx);
      const base64Data = imageUrl.slice(commaIdx + 1);
      const mimeMatch = header.match(/data:([^;]+)/);
      const mimeType = mimeMatch?.[1] ?? "image/jpeg";

      const ext = getExtension(mimeType);
      const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const buffer = Buffer.from(base64Data, "base64");

      const blob = await put(filename, buffer, {
        access: "public",
        contentType: mimeType,
      });

      return blob.url;
    } catch (err) {
      console.error("resolveImage — base64 error:", err);
      throw new Error("Impossible de traiter l'image");
    }
  }

  return undefined;
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const formData = await req.formData();
    const common = parseCommon(formData);

    const validationError = validateCommon(common);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    const resolvedImage = await resolveImage(imageFile, imageUrl);

    const product = await prisma.product.create({
      data: {
        name: common.name,
        description: common.description,
        price: common.price,
        category: common.category as any,
        gender: common.gender as any,
        color: common.color,
        colorHex: common.colorHex,
        stock: common.stock,
        sizes: common.sizes,
        material: common.material,
        fit: common.fit,
        isNew: common.isNew,
        images: resolvedImage ? [resolvedImage] : [],
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
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const formData = await req.formData();
    const idRaw = formData.get("id") as string;
    const id = parseInt(idRaw);

    if (!idRaw || isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    const common = parseCommon(formData);
    const validationError = validateCommon(common);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;
    const resolvedImage = await resolveImage(imageFile, imageUrl);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: common.name,
        description: common.description,
        price: common.price,
        category: common.category as any,
        gender: common.gender as any,
        color: common.color,
        colorHex: common.colorHex,
        stock: common.stock,
        sizes: common.sizes,
        material: common.material,
        fit: common.fit,
        isNew: common.isNew,
        ...(resolvedImage !== undefined && { images: [resolvedImage] }),
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
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const idRaw = new URL(req.url).searchParams.get("id");
    const id = parseInt(idRaw ?? "");

    if (!idRaw || isNaN(id) || id <= 0) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    const orderCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderCount > 0) {
      return NextResponse.json(
        { error: `Ce produit est dans ${orderCount} commande(s)` },
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