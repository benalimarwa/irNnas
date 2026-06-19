// app/api/sync-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    const email     = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const firstName = clerkUser.firstName ?? "";
    const lastName  = clerkUser.lastName  ?? "";

    const rawRole =
      (clerkUser.unsafeMetadata as { role?: string })?.role ??
      (clerkUser.publicMetadata as { role?: string })?.role;
    const role: "ADMIN" | "CLIENT" =
      rawRole?.toUpperCase() === "ADMIN" ? "ADMIN" : "CLIENT";

    // ✅ Chercher par clerkId OU par email (couvre les users déjà en DB)
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId: userId }, { email }],
      },
    });

    if (user) {
      // Mettre à jour en liant le clerkId si manquant
      user = await prisma.user.update({
        where: { id: user.id },
        data: { clerkId: userId, email, firstName, lastName, role },
      });
    } else {
      // Créer uniquement si vraiment inexistant
      user = await prisma.user.create({
        data: { clerkId: userId, email, firstName, lastName, role },
      });
    }

    // Mettre à jour public_metadata pour le middleware
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    console.log("Sync OK:", user.email, "| Role:", user.role);
    return NextResponse.json({ success: true, role: user.role });

  } catch (error: any) {
    console.error("Erreur sync-user:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}