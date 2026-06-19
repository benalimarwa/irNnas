import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Config manquante" }, { status: 500 });
  }

  const svix_id        = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Headers svix manquants" }, { status: 400 });
  }

  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: any;

  try {
    event = wh.verify(body, {
      "svix-id":        svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Signature webhook invalide:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const { type, data } = event;
  console.log("Webhook recu:", type);

  if (type === "user.created") {
    const clerkId   = data.id;
    const email     = data.email_addresses?.[0]?.email_address ?? "";
    const firstName = data.first_name ?? "";
    const lastName  = data.last_name  ?? "";
    const rawRole   = (data.unsafe_metadata as { role?: string })?.role;
    const role: "ADMIN" | "CLIENT" =
      rawRole?.toUpperCase() === "ADMIN" ? "ADMIN" : "CLIENT";

    try {
      const user = await prisma.user.upsert({
        where:  { clerkId },
        update: { email, firstName, lastName, role },
        create: { clerkId, email, firstName, lastName, role },
      });
      console.log("User cree en DB:", user.email, "| Role:", user.role);

      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkId, {
        publicMetadata: { role },
      });
      console.log("public_metadata mis a jour, role:", role);

    } catch (err) {
      console.error("Erreur creation user:", err);
      return NextResponse.json({ error: "Erreur DB" }, { status: 500 });
    }
  }

  if (type === "user.updated") {
    const clerkId   = data.id;
    const email     = data.email_addresses?.[0]?.email_address ?? "";
    const firstName = data.first_name ?? "";
    const lastName  = data.last_name  ?? "";
    const role      = (data.public_metadata as { role?: string })?.role?.toUpperCase() as
      "ADMIN" | "CLIENT" | undefined;

    try {
      await prisma.user.update({
        where: { clerkId },
        data: { email, firstName, lastName, ...(role ? { role } : {}) },
      });
      console.log("User mis a jour en DB:", email);
    } catch (err) {
      console.error("Erreur mise a jour user:", err);
    }
  }

  if (type === "user.deleted") {
    const clerkId = data.id;
    try {
      await prisma.user.delete({ where: { clerkId } });
      console.log("User supprime:", clerkId);
    } catch (err) {
      console.error("Erreur suppression user:", err);
    }
  }

  return NextResponse.json({ received: true });
}