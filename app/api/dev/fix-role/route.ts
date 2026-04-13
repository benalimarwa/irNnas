// app/api/dev/fix-role/route.ts
// ⚠️ FICHIER TEMPORAIRE — à supprimer après usage

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  try {
    // 1. Mettre à jour publicMetadata dans Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "ADMIN",
      },
    });

    // 2. Mettre à jour ou créer l'utilisateur dans Prisma
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (email) {
      await prisma.user.upsert({
        where: { clerkId: userId },
        update: { role: "ADMIN" },
        create: {
          clerkId: userId,
          email,
          role: "ADMIN",
        },
      });
    }

    console.log(`✅ Rôle ADMIN défini pour ${userId} (email: ${email})`);

    return NextResponse.json({
      success: true,
      message: "Rôle ADMIN défini dans Clerk ET Prisma. Déconnecte-toi et reconnecte-toi.",
      userId,
      email,
    });

  } catch (error: any) {
    console.error("❌ Erreur fix-role:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}