// app/api/admin/product/route.ts

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Gender, StockStatus } from "@prisma/client";

// ── helpers ───────────────────────────────────────────────────

const VALID_GENDERS = Object.values(Gender); // ["men", "women", "unisex"]

function parseCommon(formData: FormData) {
  const priceRaw = formData.get("price") as string;
  const stockRaw = formData.get("stock") as string;

  const price = parseFloat(priceRaw);
  const stock = parseInt(stockRaw);

  return {
    name:        (formData.get("name")        as string)?.trim() || "",
    description: (formData.get("description") as string)?.trim() || "",
    price:       isNaN(price) ? 0 : price,
    categoryName: (formData.get("category")   as string)?.trim() || "",
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
  if (!data.name)         return "Le nom est requis";
  if (!data.categoryName) return "La catégorie est requise";
  if (!VALID_GENDERS.includes(data.gender as Gender)) {
    return `Genre invalide (attendu: ${VALID_GENDERS.join(", ")})`;
  }
  if (data.price < 0)     return "Le prix ne peut pas être négatif";
  if (data.stock < 0)     return "Le stock ne peut pas être négatif";
  return null;
}

/**
 * Déduit le stockStatus à partir du stock, pour rester cohérent
 * avec l'enum StockStatus défini dans le schéma Prisma.
 * Seuils ajustables selon ta logique métier.
 */
function computeStockStatus(stock: number): StockStatus {
  if (stock <= 0)  return StockStatus.OUT_OF_STOCK;
  if (stock <= 5)  return StockStatus.CRITICAL;
  if (stock <= 15) return StockStatus.LOW;
  return StockStatus.NORMAL;
}

/**
 * Résout un nom de catégorie (ex: "pantalon") vers son id Prisma.
 * Crée la catégorie si elle n'existe pas (name est @unique dans le schéma).
 */
async function resolveCategoryId(categoryName: string): Promise<number> {
  const category = await prisma.category.upsert({
    where: { name: categoryName },
    update: {},
    create: { name: categoryName },
  });
  return category.id;
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

/**
 * Upload un seul File vers Vercel Blob et retourne son URL publique.
 */
async function uploadFileToBlob(imageFile: File): Promise<string> {
  try {
    const ext = getExtension(imageFile.type, imageFile.name);
    const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;

    const blob = await put(filename, imageFile, {
      access: "public",
      addRandomSuffix: true,
    });

    console.log("✅ Image uploaded:", blob.url);
    return blob.url;
  } catch (err: any) {
    console.error("uploadFileToBlob — error:", err);
    if (err.message?.includes("token") || err.message?.includes("access")) {
      throw new Error("Token Vercel Blob invalide ou manquant. Vérifiez BLOB_READ_WRITE_TOKEN.");
    }
    throw new Error("Impossible de sauvegarder l'image sur Vercel Blob");
  }
}

/**
 * Résout une URL d'image : passe telle quelle si http(s), ou upload vers
 * Vercel Blob si c'est une data: URL (cas résiduel, normalement plus utilisé
 * côté front puisque le mode "fichier" envoie directement des File).
 */
async function resolveUrlImage(imageUrl: string): Promise<string | undefined> {
  const trimmed = imageUrl?.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("data:")) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN manquant — connecte un Vercel Blob store au projet (Storage → Create Database → Blob)"
      );
    }
    try {
      const commaIdx = trimmed.indexOf(",");
      if (commaIdx === -1) throw new Error("Data URL invalide");

      const header = trimmed.slice(0, commaIdx);
      const base64Data = trimmed.slice(commaIdx + 1);
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
    } catch (err: any) {
      console.error("resolveUrlImage — base64 error:", err);
      throw new Error(`Impossible de traiter l'image: ${err.message ?? err}`);
    }
  }

  return undefined;
}

/**
 * Lit et résout TOUTES les images envoyées par le formulaire admin :
 * - "images"     → plusieurs File (mode "Ajouter des fichiers")
 * - "imageUrls"  → plusieurs string (mode "Ajouter par URL")
 * - "imageOrder" → JSON.stringify(["url","file","url",...]) qui décrit
 *   l'ordre exact choisi dans la galerie côté admin.
 *
 * Retourne le tableau final d'URLs, dans le bon ordre, prêt à être
 * sauvegardé dans Product.images (String[]).
 */
async function resolveImages(formData: FormData): Promise<string[]> {
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls = (formData.getAll("imageUrls") as string[]).filter(Boolean);
  const orderRaw = formData.get("imageOrder") as string | null;
  const order: ("url" | "file")[] = orderRaw ? JSON.parse(orderRaw) : [];

  // Upload de tous les fichiers en parallèle
  const uploadedFileUrls = await Promise.all(
    imageFiles.filter(f => f && f.size > 0).map(f => uploadFileToBlob(f))
  );

  // Résolution de toutes les urls (passthrough http(s), ou upload si data:)
  const resolvedUrls = (
    await Promise.all(imageUrls.map(u => resolveUrlImage(u)))
  ).filter((u): u is string => Boolean(u));

  // Reconstruction dans l'ordre exact envoyé par le front
  if (order.length > 0) {
    let fileIdx = 0;
    let urlIdx = 0;
    const final: string[] = [];
    for (const kind of order) {
      if (kind === "file" && uploadedFileUrls[fileIdx] !== undefined) {
        final.push(uploadedFileUrls[fileIdx++]);
      } else if (kind === "url" && resolvedUrls[urlIdx] !== undefined) {
        final.push(resolvedUrls[urlIdx++]);
      }
    }
    if (final.length > 0) return final;
  }

  // Fallback si "imageOrder" absent ou vide (compat anciens appels)
  return [...resolvedUrls, ...uploadedFileUrls];
}

// ── GET ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const idRaw = new URL(req.url).searchParams.get("id");

    if (idRaw) {
      const id = parseInt(idRaw);
      if (isNaN(id)) {
        return NextResponse.json({ error: "ID invalide" }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!product) {
        return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET /api/admin/product:", error);
    return NextResponse.json(
      { error: error.message ?? "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
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

    const categoryId = await resolveCategoryId(common.categoryName);
    const images = await resolveImages(formData);

    const product = await prisma.product.create({
      data: {
        name: common.name,
        description: common.description,
        price: common.price,
        categoryId,
        gender: common.gender as Gender,
        color: common.color,
        colorHex: common.colorHex,
        stock: common.stock,
        stockStatus: computeStockStatus(common.stock),
        sizes: common.sizes,
        material: common.material,
        fit: common.fit,
        isNew: common.isNew,
        images,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });

  } catch (error: any) {
    console.error("POST /api/admin/product — FULL:", error);
    console.error("META:", error?.meta);
    console.error("CODE:", error?.code);
    return NextResponse.json(
      {
        error: error.message ?? "Erreur lors de la création",
        meta: error?.meta,
        code: error?.code,
      },
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

    const categoryId = await resolveCategoryId(common.categoryName);
    const images = await resolveImages(formData);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: common.name,
        description: common.description,
        price: common.price,
        categoryId,
        gender: common.gender as Gender,
        color: common.color,
        colorHex: common.colorHex,
        stock: common.stock,
        stockStatus: computeStockStatus(common.stock),
        sizes: common.sizes,
        material: common.material,
        fit: common.fit,
        isNew: common.isNew,
        // Le front envoie déjà la galerie complète et ordonnée (anciennes
        // images conservées + nouvelles), donc on remplace entièrement —
        // pas de merge implicite ici. On ne remplace que si au moins une
        // image a été résolue, pour ne jamais vider par erreur.
        ...(images.length > 0 && { images }),
      },
      include: { category: true },
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