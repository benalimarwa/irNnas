// app/api/cart/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// ✅ S'assure que l'utilisateur existe en DB (clerkId = référence dans Cart)
async function ensureUserExists(clerkId: string) {
  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}@temp.com`,
      },
    });
  }
  return user;
}

const normalizeSize = (size: string | undefined | null): string => size ?? "";

// ──────────────────────────────────────────────────────────────
// GET /api/cart
// ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    await ensureUserExists(clerkId);

    // ✅ Cart.userId référence clerkId directement
    const cart = await prisma.cart.findUnique({
      where: { userId: clerkId },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(cart || { items: [] });
  } catch (error: any) {
    console.error("❌ GET /api/cart:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────
// POST /api/cart  — Ajouter un article
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { productId, quantity = 1, size } = await req.json();

    if (!productId) return NextResponse.json({ error: "productId requis" }, { status: 400 });

    await ensureUserExists(clerkId);

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    if (product.stock < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
    }

    // ✅ Cart.userId = clerkId
    let cart = await prisma.cart.findUnique({ where: { userId: clerkId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: clerkId } });
    }

    const normalizedSize = normalizeSize(size);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: Number(productId),
          size: normalizedSize,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity,
          size: normalizedSize,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Produit ajouté au panier",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("❌ POST /api/cart error:", error);
    return NextResponse.json({
      error: "Erreur lors de l'ajout",
      details: error.message,
    }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────
// DELETE /api/cart?productId=X&size=Y  — Retirer un article
// ──────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const size = searchParams.get("size");

    if (!productId) return NextResponse.json({ error: "productId manquant" }, { status: 400 });

    // ✅ Cart.userId = clerkId
    const cart = await prisma.cart.findUnique({ where: { userId: clerkId } });
    if (!cart) return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });

    const normalizedSize = normalizeSize(size);

    const itemToDelete = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: Number(productId),
          size: normalizedSize,
        },
      },
    });

    if (!itemToDelete) {
      return NextResponse.json({ error: "Article non trouvé dans le panier" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: itemToDelete.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Article retiré du panier",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("❌ DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}

// ──────────────────────────────────────────────────────────────
// PATCH /api/cart  — Mettre à jour la quantité
// ──────────────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { productId, quantity, size } = await req.json();

    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // ✅ Cart.userId = clerkId
    const cart = await prisma.cart.findUnique({ where: { userId: clerkId } });
    if (!cart) return NextResponse.json({ error: "Panier introuvable" }, { status: 404 });

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

    if (quantity > product.stock) {
      return NextResponse.json({
        error: `Stock insuffisant. Disponible : ${product.stock}`,
      }, { status: 400 });
    }

    const normalizedSize = normalizeSize(size);

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_size: {
          cartId: cart.id,
          productId: Number(productId),
          size: normalizedSize,
        },
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Article non trouvé dans le panier" }, { status: 404 });
    }

    await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Quantité mise à jour",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("❌ PATCH /api/cart error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}