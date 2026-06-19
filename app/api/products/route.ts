// app/api/admin/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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

    const imageFile = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string;

    let finalImageUrl = imageUrl;

    // TODO: Upload image to Cloudinary / UploadThing / etc.
    // Pour l'instant on garde l'URL ou on simule
    if (imageFile) {
      // Simulation - à remplacer par un vrai upload
      finalImageUrl = "/uploads/placeholder.jpg"; 
    }

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
        images: finalImageUrl ? [finalImageUrl] : [],
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

    const imageFile = formData.get("image") as File | null;
    let finalImageUrl = formData.get("imageUrl") as string;

    if (imageFile) {
      finalImageUrl = "/uploads/placeholder.jpg"; // À remplacer par vrai upload
    }

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
        images: finalImageUrl ? [finalImageUrl] : undefined,
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