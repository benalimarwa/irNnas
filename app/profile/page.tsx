// app/profile/page.tsx
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./_ProfileClient";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const email = clerkUser.emailAddresses.find(
    (addr) => addr.id === clerkUser.primaryEmailAddressId
  )?.emailAddress;

  if (!email) redirect("/sign-in");

  const dbUser = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {},
    create: {
      clerkId: clerkUser.id,
      email,
      name:
        [clerkUser.firstName, clerkUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim() || null,
      role: (clerkUser.publicMetadata?.role as "ADMIN" | "CLIENT") || "CLIENT",
    },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { perfume: { include: { house: true } } },
          },
        },
      },
      quizzes: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <ProfileClient
      clerkUser={{
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
      }}
      dbUser={{
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as string,
        createdAt: dbUser.createdAt.toISOString(),
        orders: dbUser.orders.map((order) => ({
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          deliveryMethod: order.deliveryMethod,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            perfume: {
              name: item.perfume.name,
              house: { name: item.perfume.house.name },
            },
          })),
        })),
        hasCompletedQuiz: dbUser.quizzes.length > 0,
      }}
    />
  );
}
