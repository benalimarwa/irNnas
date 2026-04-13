// lib/perfumes.ts
import { prisma } from "@/lib/prisma";

export async function getAllPerfumesGrouped() {
  const perfumes = await prisma.perfume.findMany({
    include: {
      house: {
        select: { name: true },
      },
    },
    orderBy: [
      { house: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return perfumes.reduce((acc, perfume) => {
    const houseName = perfume.house.name;
    acc[houseName] ??= [];
    acc[houseName].push(perfume);
    return acc;
  }, {} as Record<string, typeof perfumes>);
}