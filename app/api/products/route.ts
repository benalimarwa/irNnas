import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (category) {
      where.category = category;
    }

    if (gender) {
      where.gender = gender;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        gender: true,
        color: true,
        colorHex: true,
        stock: true,
        images: true,
        sizes: true,
        material: true,
        fit: true,
        isNew: true,
        stockStatus: true,
        category: true,
        createdAt: true,
      },
      orderBy: [
        { isNew: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des produits" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const gender = formData.get("gender") as string;
    const color = formData.get("color") as string;
    const colorHex = formData.get("colorHex") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sizes = (formData.get("sizes") as string)?.split(",").map(s => s.trim());
    const material = formData.get("material") as string;
    const fit = formData.get("fit") as string;
    const isNew = formData.get("isNew") === "true";

    /* ── Images : lecture multi-fichiers / multi-urls ─────────
       Le formulaire admin envoie désormais :
       - "images"     → plusieurs File (getAll)
       - "imageUrls"  → plusieurs string (getAll)
       - "imageOrder" → JSON.stringify(["url","file","url",...])
         qui décrit l'ordre exact choisi par l'admin dans la galerie.
    ────────────────────────────────────────────────────────── */
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls = formData.getAll("imageUrls") as string[];
    const orderRaw = formData.get("imageOrder") as string | null;
    const order: ("url" | "file")[] = orderRaw ? JSON.parse(orderRaw) : [];

    // TODO: Upload réel de chaque fichier vers Cloudinary / UploadThing / Vercel Blob / etc.
    // Remplace le contenu de la boucle par ta vraie fonction d'upload,
    // qui doit retourner l'URL publique finale du fichier stocké.
    const uploadedFileUrls: string[] = [];
    for (const file of imageFiles) {
      // const url = await uploadFile(file); // ← branche ici ton vrai upload
      // uploadedFileUrls.push(url);
      uploadedFileUrls.push("/uploads/placeholder.jpg"); // simulation temporaire
    }

    // Reconstruction du tableau final dans l'ordre exact choisi côté admin
    let fileIdx = 0;
    let urlIdx = 0;
    const finalImages: string[] = order.length
      ? order.map(kind => (kind === "file" ? uploadedFileUrls[fileIdx++] : imageUrls[urlIdx++]))
      : [...imageUrls, ...uploadedFileUrls]; // fallback si "imageOrder" absent

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category: category as any,
        gender: gender as any,
        color,
        colorHex: colorHex || "#888888",
        stock,
        images: finalImages,
        sizes: sizes || [],
        material,
        fit,
        isNew,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("POST /api/admin/product error:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la création" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const formData = await req.formData();
    const id = parseInt(formData.get("id") as string);

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const gender = formData.get("gender") as string;
    const color = formData.get("color") as string;
    const colorHex = formData.get("colorHex") as string;
    const stock = parseInt(formData.get("stock") as string);
    const sizes = (formData.get("sizes") as string)?.split(",").map(s => s.trim());
    const material = formData.get("material") as string;
    const fit = formData.get("fit") as string;
    const isNew = formData.get("isNew") === "true";

    /* ── Images : mêmes règles que dans POST ──────────────── */
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls = formData.getAll("imageUrls") as string[];
    const orderRaw = formData.get("imageOrder") as string | null;
    const order: ("url" | "file")[] = orderRaw ? JSON.parse(orderRaw) : [];

    const uploadedFileUrls: string[] = [];
    for (const file of imageFiles) {
      // const url = await uploadFile(file); // ← branche ici ton vrai upload
      // uploadedFileUrls.push(url);
      uploadedFileUrls.push("/uploads/placeholder.jpg"); // simulation temporaire
    }

    let fileIdx = 0;
    let urlIdx = 0;
    const finalImages: string[] = order.length
      ? order.map(kind => (kind === "file" ? uploadedFileUrls[fileIdx++] : imageUrls[urlIdx++]))
      : [...imageUrls, ...uploadedFileUrls];

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category: category as any,
        gender: gender as any,
        color,
        colorHex,
        stock,
        // En édition, on remplace toujours entièrement la galerie par ce que
        // le front a envoyé (il envoie déjà les anciennes images conservées +
        // les nouvelles, dans l'ordre voulu) — pas de merge implicite ici.
        images: finalImages.length > 0 ? finalImages : undefined,
        sizes: sizes || undefined,
        material,
        fit,
        isNew,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error("PUT /api/admin/product error:", error);
    return NextResponse.json({ error: error.message || "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Produit supprimé" });
  } catch (error: any) {
    console.error("DELETE /api/admin/product error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}