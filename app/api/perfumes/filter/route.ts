// app/api/perfumes/filter/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const familles: Record<string, string[]> = {
  floraux: ['floral', 'fleuri', 'fleur', 'rose', 'jasmin', 'pivoine', 'lilas', 'tubéreuse', 'ylang'],
  orientaux: ['oriental', 'ambré', 'ambre', 'vanille', 'gourmand', 'épicé', 'épice', 'safran', 'oud', 'patchouli'],
  frais: ['frais', 'aquatique', 'agrumes', 'citrus', 'héspéridé', 'bergamote', 'marine', 'vert', 'thé'],
  boises: ['boisé', 'bois', 'santal', 'cèdre', 'vétiver', 'oud', 'encens', 'pin', 'minéral'],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");
  const search = searchParams.get("search")?.toLowerCase();

  const where: any = {
    category: 'parfum',
    stock: { gt: 0 },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let perfumes = await prisma.product.findMany({
    where,
    orderBy: { price: "desc" },
  });

  // Filtrage par famille olfactive en mémoire (pas de champ dédié en DB)
  if (style && style !== "Tous") {
    const keywords = familles[style.toLowerCase()] ?? [style.toLowerCase()];
    perfumes = perfumes.filter((p) => {
      const text = `${p.name} ${p.description ?? ''}`.toLowerCase();
      return keywords.some((k) => text.includes(k));
    });
  }

  return NextResponse.json(perfumes);
}