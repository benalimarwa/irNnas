// app/admin/profile/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "../../../components/ClientProfileEditForm";

async function getUserWithOrders(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
      },
    },
  });
}

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await getUserWithOrders(clerkUser.id);
  if (!dbUser) redirect("/sign-in");

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
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
        createdAt: dbUser.createdAt.toISOString(),
        orders: dbUser.orders.map((o) => ({
          id: o.id.toString(),
          status: o.status,
          totalAmount: Number(o.total),
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            product: { name: item.product.name },
          })),
        })),
      }}
    />
  );
}