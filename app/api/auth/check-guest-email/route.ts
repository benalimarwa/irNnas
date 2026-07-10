import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────
   POST /api/auth/check-guest-email
   Vérifie si un utilisateur existe déjà en base pour cet email.
   Utilisé par le checkout invité pour savoir si l'étape de
   vérification par code (Clerk) doit être déclenchée : elle ne
   l'est que pour un email totalement nouveau (vrai "sign-up").
───────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const clean = email?.trim().toLowerCase();

    if (!clean) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: clean } });
    return NextResponse.json({ exists: !!existing });
  } catch (err) {
    console.error("[POST /api/auth/check-guest-email]", err);
    // En cas de doute (erreur serveur), on ne bloque pas le checkout :
    // on considère l'email comme "existant" pour éviter une vérification inutile.
    return NextResponse.json({ exists: true });
  }
}