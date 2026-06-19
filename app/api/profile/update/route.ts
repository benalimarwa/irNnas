import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const { userId, name } = await request.json();
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const trimmedName = (name ?? "").trim();
  const [firstName, ...rest] = trimmedName.split(" ").filter(Boolean);
  const lastName = rest.join(" ") || null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: firstName || null,
      lastName,
    },
  });

  return NextResponse.json({ success: true });
}