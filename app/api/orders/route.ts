// app/api/orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────
   POST /api/orders

   Supports:
   - Authenticated Clerk user  → resolves user by clerkId
   - Guest with email          → finds existing user by email
                                 OR, si `afterVerification` est vrai,
                                 crée un nouveau user en DB (le compte
                                 Clerk a déjà été créé côté client via
                                 le flux de vérification par code)
                                 → returns a signInToken for auto-login

   Résolution des items de commande :
   - Si `items` est fourni dans le corps de la requête (ex: "Acheter
     maintenant" depuis la fiche produit / le catalogue), ils sont
     TOUJOURS prioritaires, connecté ou non.
   - Sinon, pour un utilisateur connecté, on retombe sur son panier
     en base de données.
   - Sinon (invité sans items fournis), 400 "Panier vide".

   IMPORTANT : un email invité totalement inconnu (ni en DB) ne peut
   PAS créer de commande directement ici. Le client doit d'abord
   passer par le flux de vérification Clerk (code par email) et
   appeler /api/sync-user, puis renvoyer la requête avec
   `afterVerification: true` une fois connecté. Ceci empêche de
   contourner la vérification obligatoire par email.
───────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      deliveryMethod,
      deliveryFee = 0,
      customerInfo,
      items: bodyItems,
      afterVerification = false,
    } = body;

    /* ── 1. Resolve user ─────────────────────────────────── */
    let dbUser = null;
    let signInToken: string | null = null;

    const { userId: clerkId } = await auth();
    const client = await clerkClient(); // ← Important: now async in recent Clerk versions

    if (clerkId) {
      // ── Authenticated user (couvre aussi "juste après vérification") ──
      dbUser = await prisma.user.findUnique({ where: { clerkId } });

      if (!dbUser) {
        // Peut arriver juste après la vérification par code, si
        // /api/sync-user n'a pas encore terminé de créer le user.
        // On tente une résolution de secours par email avant d'échouer.
        const email = customerInfo?.email?.trim().toLowerCase();
        if (email) {
          dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser && !dbUser.clerkId) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { clerkId },
            });
          }
        }
      }

      if (!dbUser) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }
    } else {
      // ── Guest user (pas de session Clerk active) ────────
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
        // ── Email totalement inconnu, pas de session Clerk ──
        // Ce cas ne doit normalement jamais arriver depuis le
        // checkout : /api/auth/check-guest-email doit avoir déjà
        // redirigé le client vers le flux de vérification par code
        // (voir startEmailVerification côté front). On refuse donc
        // explicitement de créer un compte ici, pour ne pas
        // contourner la vérification obligatoire.
        if (!afterVerification) {
          return NextResponse.json(
            {
              error:
                "Cet email n'est associé à aucun compte. Une vérification par code est requise.",
              code: "EMAIL_VERIFICATION_REQUIRED",
            },
            { status: 400 }
          );
        }

        // afterVerification=true mais pas de session Clerk active :
        // situation anormale (setActive a peut-être échoué côté client).
        // On crée quand même le user en DB en dernier recours, sans
        // compte Clerk lié, pour ne pas perdre la commande.
        dbUser = await prisma.user.create({
          data: {
            email,
            clerkId: null,
            firstName: customerInfo?.firstName?.trim() || null,
            lastName: customerInfo?.lastName?.trim() || null,
            role: "CLIENT",
          },
        });
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
    let usedProvidedItems = false;

    if (bodyItems?.length) {
      // "Acheter maintenant" (ou tout appel précisant explicitement les items)
      // → toujours prioritaire, que l'utilisateur soit connecté ou non.
      cartItems = bodyItems;
      usedProvidedItems = true;
    } else if (clerkId) {
      // Pas d'items fournis explicitement → on retombe sur le panier DB
      // de l'utilisateur connecté.
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
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
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

      // Clear cart for authenticated users — uniquement si la commande
      // provient réellement du panier (pas d'un "Acheter maintenant"
      // qui a fourni ses propres items).
      if (clerkId && !usedProvidedItems) {
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