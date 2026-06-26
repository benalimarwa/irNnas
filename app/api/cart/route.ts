// app/api/cart/route.ts
// (Complet - GET, POST, PATCH, DELETE)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer le panier
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    console.error("[GET /api/cart]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter un article
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity = 1, size = null } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId requis" }, { status: 400 });
    }

    // Vérifier le produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    if (product.stock === 0 || product.stockStatus === "OUT_OF_STOCK") {
      return NextResponse.json({ error: "Produit épuisé" }, { status: 400 });
    }

    // Créer le panier si inexistant
    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      // Vérifier que l'utilisateur existe dans la DB
      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Chercher si l'article existe déjà (même produit + taille)
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId,
          size: size || "",
        },
      },
    });

    if (existingItem) {
      // Mettre à jour la quantité
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return NextResponse.json(
          { error: `Stock insuffisant (max: ${product.stock})` },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      // Créer un nouvel article
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          size: size || "",
        },
      });
    }

    return NextResponse.json({ success: true, message: "Ajouté au panier" });
  } catch (error) {
    console.error("[POST /api/cart]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Modifier la quantité
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, quantity, size = "" } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "productId et quantity requis" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Stock insuffisant (max: ${product.stock})` },
        { status: 400 }
      );
    }

    await prisma.cartItem.update({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId,
          size: size || "",
        },
      },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("[PATCH /api/cart]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un article
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = parseInt(searchParams.get("productId") || "0");
    const size = searchParams.get("size") || "";

    if (!productId) {
      return NextResponse.json({ error: "productId requis" }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId,
          size: size || "",
        },
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                stock: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    console.error("[DELETE /api/cart]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}