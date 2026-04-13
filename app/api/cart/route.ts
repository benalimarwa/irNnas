// app/api/cart/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Fonction helper pour créer ou récupérer un utilisateur
async function getOrCreateUser(clerkId: string, email?: string) {
  let user = await prisma.user.findUnique({ 
    where: { clerkId } 
  });
  
  if (!user) {
    console.log("📝 Création utilisateur pour clerkId:", clerkId);
    user = await prisma.user.create({
      data: {
        clerkId,
        email: email || `${clerkId}@temp.com`,
      },
    });
  }
  
  return user;
}

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 GET /api/cart - Début");
    
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log("🔑 Auth result:", { userId, hasAuth: !!authResult });
    
    if (!userId) {
      console.log("❌ Non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Créer ou récupérer l'utilisateur
    const user = await getOrCreateUser(userId);
    console.log("✅ User ID DB:", user.id);

    // Récupérer le panier
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            perfume: {
              include: { house: true },
            },
          },
        },
      },
    });

    console.log("📦 Panier:", cart ? `${cart.items.length} articles` : "vide");

    return NextResponse.json(cart || { items: [] });
  } catch (error: any) {
    console.error("❌ Erreur GET cart:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/cart - Début");
    
    const authResult = await auth();
    const userId = authResult?.userId;
    
    console.log("🔑 Auth result:", { userId, hasAuth: !!authResult });
    
    if (!userId) {
      console.log("❌ Non authentifié");
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Parser le body
    let body;
    try {
      body = await req.json();
      console.log("📦 Body reçu:", body);
    } catch (e) {
      console.error("❌ Erreur parsing JSON:", e);
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    const { perfumeId, quantity = 1 } = body;

    // Validation
    if (!perfumeId) {
      console.log("❌ perfumeId manquant");
      return NextResponse.json({ error: "perfumeId requis" }, { status: 400 });
    }

    const perfumeIdNum = Number(perfumeId);
    if (isNaN(perfumeIdNum)) {
      console.log("❌ perfumeId invalide:", perfumeId);
      return NextResponse.json({ error: "perfumeId doit être un nombre" }, { status: 400 });
    }

    if (quantity < 1) {
      console.log("❌ Quantité invalide:", quantity);
      return NextResponse.json({ error: "Quantité doit être >= 1" }, { status: 400 });
    }

    console.log("✅ Validation OK:", { perfumeId: perfumeIdNum, quantity });

    // Créer ou récupérer l'utilisateur
    const user = await getOrCreateUser(userId);
    console.log("✅ User ID DB:", user.id);

    // Vérifier le parfum
    console.log("🔍 Recherche parfum ID:", perfumeIdNum);
    const perfume = await prisma.perfume.findUnique({
      where: { id: perfumeIdNum },
      include: { house: true }
    });

    if (!perfume) {
      console.log("❌ Parfum non trouvé:", perfumeIdNum);
      return NextResponse.json({ error: "Parfum introuvable" }, { status: 404 });
    }

    console.log("✅ Parfum trouvé:", perfume.name, "Stock:", perfume.stock);

    if (perfume.stock < 1) {
      console.log("❌ Rupture de stock");
      return NextResponse.json({ error: "Parfum en rupture de stock" }, { status: 400 });
    }

    // Récupérer ou créer le panier
    let cart = await prisma.cart.findUnique({ 
      where: { userId: user.id } 
    });

    if (!cart) {
      console.log("📝 Création du panier");
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
      console.log("✅ Panier créé:", cart.id);
    } else {
      console.log("✅ Panier existant:", cart.id);
    }

    // Vérifier si l'article existe déjà
    console.log("🔍 Recherche article existant:", { cartId: cart.id, perfumeId: perfumeIdNum });
    const existingItem = await prisma.cartItem.findUnique({
      where: { 
        cartId_perfumeId: { 
          cartId: cart.id, 
          perfumeId: perfumeIdNum 
        } 
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      console.log("📝 Mise à jour quantité:", existingItem.quantity, "→", newQuantity);
      
      if (newQuantity > perfume.stock) {
        console.log("❌ Stock insuffisant");
        return NextResponse.json(
          { error: `Stock insuffisant. Disponible: ${perfume.stock}, dans le panier: ${existingItem.quantity}` },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
      console.log("✅ Quantité mise à jour");
    } else {
      console.log("📝 Création nouvel article");
      
      if (quantity > perfume.stock) {
        console.log("❌ Stock insuffisant");
        return NextResponse.json(
          { error: `Stock insuffisant. Disponible: ${perfume.stock}` },
          { status: 400 }
        );
      }

      await prisma.cartItem.create({
        data: { 
          cartId: cart.id, 
          perfumeId: perfumeIdNum, 
          quantity 
        },
      });
      console.log("✅ Article créé");
    }

    // Récupérer le panier mis à jour
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            perfume: {
              include: { house: true },
            },
          },
        },
      },
    });

    console.log("✅ POST terminé avec succès");

    return NextResponse.json({ 
      success: true, 
      message: "Parfum ajouté au panier",
      cart: updatedCart 
    });
  } catch (error: any) {
    console.error("❌ Erreur POST cart:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    return NextResponse.json({ 
      error: "Erreur lors de l'ajout au panier", 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log("🔍 DELETE /api/cart - Début");
    
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const perfumeId = searchParams.get("perfumeId");

    if (!perfumeId) {
      return NextResponse.json({ error: "perfumeId manquant" }, { status: 400 });
    }

    const user = await getOrCreateUser(userId);
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    
    if (!cart) {
      return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
    }

    const perfumeIdNum = Number(perfumeId);
    const itemToDelete = await prisma.cartItem.findUnique({
      where: { 
        cartId_perfumeId: { 
          cartId: cart.id, 
          perfumeId: perfumeIdNum 
        } 
      },
    });

    if (!itemToDelete) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: itemToDelete.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            perfume: {
              include: { house: true },
            },
          },
        },
      },
    });

    console.log("✅ DELETE terminé avec succès");

    return NextResponse.json({ 
      success: true, 
      message: "Article retiré",
      cart: updatedCart 
    });
  } catch (error: any) {
    console.error("❌ Erreur DELETE cart:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la suppression",
      message: error.message 
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    console.log("🔍 PATCH /api/cart - Début");
    
    const authResult = await auth();
    const userId = authResult?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { perfumeId, quantity } = body;

    if (!perfumeId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const perfumeIdNum = Number(perfumeId);
    const perfume = await prisma.perfume.findUnique({
      where: { id: perfumeIdNum },
    });

    if (!perfume) {
      return NextResponse.json({ error: "Parfum introuvable" }, { status: 404 });
    }

    if (quantity > perfume.stock) {
      return NextResponse.json(
        { error: `Stock insuffisant. Disponible: ${perfume.stock}` },
        { status: 400 }
      );
    }

    const user = await getOrCreateUser(userId);
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    
    if (!cart) {
      return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { 
        cartId_perfumeId: { 
          cartId: cart.id, 
          perfumeId: perfumeIdNum 
        } 
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            perfume: {
              include: { house: true },
            },
          },
        },
      },
    });

    console.log("✅ PATCH terminé avec succès");

    return NextResponse.json({ 
      success: true, 
      message: "Quantité mise à jour",
      cart: updatedCart 
    });
  } catch (error: any) {
    console.error("❌ Erreur PATCH cart:", error);
    return NextResponse.json({ 
      error: "Erreur lors de la mise à jour",
      message: error.message 
    }, { status: 500 });
  }
}