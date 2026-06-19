import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

const familles: Record<string, string[]> = {
  Floraux: ['floral', 'fleuri', 'fleur', 'rose', 'jasmin', 'pivoine', 'lilas', 'tubéreuse', 'ylang'],
  Orientaux: ['oriental', 'ambré', 'ambre', 'vanille', 'gourmand', 'épicé', 'épice', 'safran', 'oud', 'patchouli'],
  Frais: ['frais', 'aquatique', 'agrumes', 'citrus', 'héspéridé', 'bergamote', 'marine', 'vert', 'thé'],
  Boisés: ['boisé', 'bois', 'santal', 'cèdre', 'vétiver', 'oud', 'encens', 'pin', 'minéral'],
};

export async function getAllPerfumesGrouped(): Promise<Record<string, Product[]>> {
  const perfumes = await prisma.product.findMany({
    where: { category: "parfum" },
    orderBy: { price: "desc" },
  });

  const grouped: Record<string, Product[]> = {
    Floraux: [],
    Orientaux: [],
    Frais: [],
    Boisés: [],
    Autres: [],
  };

  for (const perfume of perfumes) {
    const text = `${perfume.name} ${perfume.description ?? ""}`.toLowerCase();
    let matched = false;

    for (const [familyName, keywords] of Object.entries(familles)) {
      if (keywords.some((k) => text.includes(k))) {
        grouped[familyName].push(perfume);
        matched = true;
        break; // un parfum va dans la première famille qui matche
      }
    }

    if (!matched) {
      grouped["Autres"].push(perfume);
    }
  }

  // Retirer les groupes vides pour ne pas afficher de section vide
  for (const key of Object.keys(grouped)) {
    if (grouped[key].length === 0) delete grouped[key];
  }

  return grouped;
}