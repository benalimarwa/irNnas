// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────
   POST /api/orders
   Supports:
   - Authenticated Clerk user  → resolves user by clerkId
   - Guest with email          → finds existing user by email
                                 OR creates a new guest user in DB + Clerk
                                 → returns a signInToken for auto-login
───────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deliveryMethod, deliveryFee = 0, customerInfo, items: bodyItems } = body;

    /* ── 1. Resolve user ─────────────────────────────────── */
    let dbUser = null;
    let signInToken: string | null = null;

    const { userId: clerkId } = await auth();

    const client = await clerkClient(); // ← Important: now async in recent Clerk versions

    if (clerkId) {
      // ── Authenticated user ──────────────────────────────
      dbUser = await prisma.user.findUnique({ where: { clerkId } });
      if (!dbUser) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }
    } else {
      // ── Guest user ──────────────────────────────────────
      const email = customerInfo?.email?.trim().toLowerCase();
      if (!email) {
        return NextResponse.json(
          { error: "L'adresse email est obligatoire pour les commandes invité" },
          { status: 400 }
        );
      }

      // Try to find existing user in DB
      dbUser = await prisma.user.findUnique({ where: { email } });

      if (!dbUser) {
        // ── New guest: create in Clerk first, then in DB ──
        let clerkUserId: string | null = null;

        try {
          const clerkUser = await client.users.createUser({
            emailAddress: [email],
            firstName: customerInfo?.firstName?.trim() || undefined,
            lastName: customerInfo?.lastName?.trim() || undefined,
            password: `${crypto.randomUUID()}!Aa1`,
            skipPasswordChecks: true,
          });
          clerkUserId = clerkUser.id;
        } catch (clerkErr: any) {
          // User might already exist in Clerk
          try {
            const existing = await client.users.getUserList({
              emailAddress: [email],
            });
            clerkUserId = existing.data[0]?.id ?? null;
          } catch {
            clerkUserId = null; // degraded mode
          }
        }

        dbUser = await prisma.user.create({
          data: {
            email,
            clerkId: clerkUserId,
            firstName: customerInfo?.firstName?.trim() || null,
            lastName: customerInfo?.lastName?.trim() || null,
            role: "CLIENT",
          },
        });

        // Generate sign-in token
        if (clerkUserId) {
          try {
            const tokenRes = await client.signInTokens.createSignInToken({
              userId: clerkUserId,
              expiresInSeconds: 120,
            });
            signInToken = tokenRes.token;
          } catch {
            signInToken = null;
          }
        }
      } else if (dbUser.clerkId) {
        // Existing user with Clerk account → auto-login token
        try {
          const tokenRes = await client.signInTokens.createSignInToken({
            userId: dbUser.clerkId,
            expiresInSeconds: 120,
          });
          signInToken = tokenRes.token;
        } catch {
          signInToken = null;
        }
      }
    }

    /* ── 2. Resolve cart items ───────────────────────────── */
    let cartItems: Array<{ productId: number; quantity: number; size?: string | null }> = [];

    if (clerkId) {
      const cart = await prisma.cart.findUnique({
        where: { userId: dbUser!.id },
        include: { items: true },
      });
      if (!cart?.items?.length) {
        return NextResponse.json({ error: "Panier vide" }, { status: 400 });
      }
      cartItems = cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        size: i.size,
      }));
    } else {
      if (!bodyItems?.length) {
        return NextResponse.json({ error: "Panier vide" }, { status: 400 });
      }
      cartItems = bodyItems;
    }

    /* ── 3. Fetch product prices & validate stock ─────────── */
    const productIds = cartItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit #${item.productId} introuvable` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour le produit #${item.productId}` },
          { status: 400 }
        );
      }
    }

    /* ── 4. Calculate total ──────────────────────────────── */
    const subtotal = cartItems.reduce((sum, item) => {
      const price = productMap.get(item.productId)?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    const total = subtotal + (deliveryFee ?? 0);

    /* ── 5. Create order in transaction ─────────────────── */
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: dbUser!.id,
          status: "pending",
          total,
          deliveryMethod: deliveryMethod ?? "PICKUP",

          customerPhone: customerInfo?.phone ?? null,
          customerAddress: customerInfo?.address ?? null,
          customerCity: customerInfo?.city ?? null,
          customerGov: customerInfo?.governorate ?? null,
          customerPostal: customerInfo?.postalCode ?? null,
          customerCountry: customerInfo?.country ?? null,
          customerNotes: customerInfo?.notes ?? null,

          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size ?? null,
              price: productMap.get(item.productId)!.price,
            })),
          },
        },
      });

      // Decrement stock
      await Promise.all(
        cartItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        )
      );

      // Clear cart for authenticated users
      if (clerkId) {
        const cart = await tx.cart.findUnique({ where: { userId: dbUser!.id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }

      return created;
    });

    return NextResponse.json({ orderId: order.id, order, signInToken }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

