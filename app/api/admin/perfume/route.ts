import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    console.log("🔄 PUT request received");
    const formData = await req.formData();
    
    // Log all FormData entries
    console.log("📦 FormData received:");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const idStr = formData.get("id") as string;
    const id = parseInt(idStr);
    
    console.log("🔑 Perfume ID to update:", id, "Type:", typeof id, "IsNaN:", isNaN(id));

    if (!id || isNaN(id)) {
      console.error("❌ Invalid ID:", idStr);
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      );
    }

    // Vérifier que le parfum existe
    const existingPerfume = await prisma.perfume.findUnique({
      where: { id },
      include: { house: true }
    });

    if (!existingPerfume) {
      console.error("❌ Perfume not found with ID:", id);
      return NextResponse.json(
        { error: `Parfum avec ID ${id} introuvable` },
        { status: 404 }
      );
    }

    console.log("✅ Existing perfume found:", existingPerfume.name);

    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const price = parseFloat(priceStr);
    const category = formData.get("category") as string;
    const houseName = formData.get("house") as string;
    const styleStr = formData.get("style") as string;
    const stockStr = formData.get("stock") as string;
    const stock = parseInt(stockStr);

    // Validation des données
    if (!name || !priceStr || isNaN(price) || !category || !houseName || !stockStr || isNaN(stock)) {
      console.error("❌ Invalid data:", { name, price, category, houseName, stock });
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }

    // Gérer l'image
    let imageUrl: string | null = existingPerfume.imageUrl;
    const imageFile = formData.get("image") as File | null;
    const imageUrlStr = formData.get("imageUrl") as string | null;

    console.log("🖼️ Image handling:", { 
      hasFile: imageFile && imageFile.size > 0,
      hasUrl: !!imageUrlStr,
      currentUrl: existingPerfume.imageUrl
    });

    // Si un fichier est uploadé et contient des données
    if (imageFile && imageFile.size > 0) {
      console.log("📸 Processing uploaded file:", imageFile.name);
      // Pour l'instant, on convertit en base64
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${imageFile.type};base64,${base64}`;
    } 
    // Sinon si une URL est fournie et différente de l'URL actuelle
    else if (imageUrlStr && imageUrlStr !== existingPerfume.imageUrl) {
      console.log("🔗 Using new URL:", imageUrlStr);
      imageUrl = imageUrlStr;
    }

    console.log("📝 Final update data:", { 
      id, name, price, category, houseName, stock, imageUrl: imageUrl?.substring(0, 50) + "..."
    });

    const style = styleStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    // Trouver ou créer la maison
    let house = await prisma.perfumeHouse.findUnique({
      where: { name: houseName },
    });

    if (!house) {
      console.log("🏠 House not found, creating new house:", houseName);
      house = await prisma.perfumeHouse.create({
        data: { name: houseName },
      });
    }

    console.log("🏠 Using house:", house.name, "ID:", house.id);

    // Mettre à jour le parfum
    const perfume = await prisma.perfume.update({
      where: { id },
      data: {
        name,
        price,
        category,
        houseId: house.id,
        style,
        stock,
        imageUrl,
      },
      include: { house: true },
    });

    console.log("✅ Perfume updated successfully:", perfume.name);
    return NextResponse.json(perfume);
    
  } catch (error) {
    console.error("❌ Error updating perfume:", error);
    
    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Erreur Prisma spécifique
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code);
      console.error("Prisma error meta:", (error as any).meta);
    }
    
    return NextResponse.json(
      { 
        error: "Erreur lors de la modification du parfum",
        details: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.name : typeof error
      },
      { status: 500 }
    );
  }
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    console.log("🆕 POST request received");
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const priceStr = formData.get("price") as string;
    const price = parseFloat(priceStr);
    const category = formData.get("category") as string;
    const houseName = formData.get("house") as string;
    const styleStr = formData.get("style") as string;
    const stockStr = formData.get("stock") as string;
    const stock = parseInt(stockStr) || 100;

    // Validation
    if (!name || !priceStr || isNaN(price) || !category || !houseName) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      );
    }
    
    // Gérer l'image
    let imageUrl: string | null = null;
    const imageFile = formData.get("image") as File | null;
    const imageUrlStr = formData.get("imageUrl") as string | null;

    if (imageFile && imageFile.size > 0) {
      console.log("📸 Processing uploaded image file:", imageFile.name);
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      imageUrl = `data:${imageFile.type};base64,${base64}`;
    } else if (imageUrlStr) {
      console.log("🔗 Using image URL:", imageUrlStr);
      imageUrl = imageUrlStr;
    }

    console.log("📝 Creating perfume with data:", { 
      name, price, category, houseName, styleStr, stock
    });

    const style = styleStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    let house = await prisma.perfumeHouse.findUnique({
      where: { name: houseName },
    });

    if (!house) {
      console.log("🏠 Creating new house:", houseName);
      house = await prisma.perfumeHouse.create({
        data: { name: houseName },
      });
    }

    const perfume = await prisma.perfume.create({
      data: {
        name,
        price,
        category,
        houseId: house.id,
        style,
        stock,
        imageUrl,
      },
      include: { house: true },
    });

    console.log("✅ Perfume created successfully:", perfume);
    return NextResponse.json(perfume, { status: 201 });
  } catch (error) {
    console.error("❌ Error creating perfume:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la création du parfum", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    console.log("🗑️ DELETE request received");
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get("id");
    const id = idStr ? parseInt(idStr) : 0;

    console.log("Deleting perfume ID:", id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "ID manquant ou invalide" },
        { status: 400 }
      );
    }

    await prisma.perfume.delete({
      where: { id },
    });

    console.log("✅ Perfume deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting perfume:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du parfum" },
      { status: 500 }
    );
  }
}