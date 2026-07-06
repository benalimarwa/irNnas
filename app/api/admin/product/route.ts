import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Gender } from "@prisma/client";   // ← Important

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (e) {
    console.error("Erreur création dossier uploads:", e);
  }
}

function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext)
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 100);
  return `${base}-${Date.now()}${ext}`;
}

// ====================== GET ======================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    } : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ isNew: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Erreur lors du chargement" }, { status: 500 });
  }
}

// ====================== POST ======================
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await ensureUploadDir();
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const gender = formData.get("gender") as Gender;           // ← Correction ici
    const color = formData.get("color") as string;
    const colorHex = formData.get("colorHex") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sizes = (formData.get("sizes") as string)?.split(",").map(s => s.trim()) || [];
    const material = formData.get("material") as string;
    const fit = formData.get("fit") as string;
    const isNew = formData.get("isNew") === "true";

    const imageFile = formData.get("image") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = sanitizeFilename(imageFile.name);
      const filepath = path.join(UPLOAD_DIR, filename);

      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    if (!imageUrl) return NextResponse.json({ error: "Image requise" }, { status: 400 });

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        gender,                    // ← Maintenant typé correctement
        color,
        colorHex: colorHex || "#888888",
        stock,
        images: [imageUrl],
        sizes,
        material,
        fit,
        isNew,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message || "Erreur création" }, { status: 500 });
  }
}

// ====================== PUT ======================
export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await ensureUploadDir();
    const formData = await req.formData();
    const id = parseInt(formData.get("id") as string);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const gender = formData.get("gender") as Gender;           // ← Correction ici
    const color = formData.get("color") as string;
    const colorHex = formData.get("colorHex") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sizes = (formData.get("sizes") as string)?.split(",").map(s => s.trim()) || [];
    const material = formData.get("material") as string;
    const fit = formData.get("fit") as string;
    const isNew = formData.get("isNew") === "true";

    const imageFile = formData.get("image") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = sanitizeFilename(imageFile.name);
      const filepath = path.join(UPLOAD_DIR, filename);

      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        gender,                    // ← Correction ici
        color,
        colorHex,
        stock,
        sizes,
        material,
        fit,
        isNew,
        ...(imageUrl && { images: [imageUrl] }),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json({ error: error.message || "Erreur mise à jour" }, { status: 500 });
  }
}

// ====================== DELETE ======================
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}