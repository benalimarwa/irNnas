import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!clerkUserId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ✅ CORRECTION : Clerk v2 stocke les métadonnées sous "public_metadata" et non "metadata"
    const { sessionClaims } = await auth();
    const clerkRoleRaw = (sessionClaims?.public_metadata as { role?: string })?.role;
    const clerkRole = clerkRoleRaw?.toUpperCase();

    console.log(`🔑 Clerk UserId: ${clerkUserId} | Rôle Clerk: ${clerkRole || "non défini"}`);

    // Recherche de l'utilisateur en incluant clerkId
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        clerkId: true,
        role: true,
      },
    });

    if (!user) {
      console.log("➕ Création d'un nouvel utilisateur...");

      const newUser = await prisma.user.create({
        data: {
          email,
          clerkId: clerkUserId,
          role: clerkRole === "ADMIN" ? "ADMIN" : "CLIENT",
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      console.log("✅ Utilisateur créé avec rôle:", newUser.role);
      return NextResponse.json({ role: newUser.role });
    }

    // Mise à jour du rôle si Clerk a un rôle différent de Prisma
    if (clerkRole && clerkRole !== user.role) {
      console.log(`🔄 Mise à jour du rôle : ${user.role} → ${clerkRole}`);

      user = await prisma.user.update({
        where: { email },
        data: { role: clerkRole as "ADMIN" | "CLIENT" },
        select: {
          id: true,
          email: true,
          clerkId: true,
          role: true,
        },
      });
    }

    console.log("✅ Rôle retourné :", user.role);
    return NextResponse.json({ role: user.role });

  } catch (error: any) {
    console.error("💥 Erreur dans /api/get-role :", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}