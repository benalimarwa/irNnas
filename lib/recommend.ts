// lib/recommend.ts
import { prisma } from "@/lib/prisma";
import { Product } from "@prisma/client";

type QuizAnswers = {
  gender: string;
  styles: string[];
  occasion?: string;
  intensity?: string;
};

const GENDER_MAP: Record<string, string[]> = {
  homme: ["men"],
  femme: ["women"],
  mixte: ["unisex"],
  enfant: ["unisex"],
};

// Mots-clés mappés sur description/name car pas de champ style
const OCCASION_KEYWORDS: Record<string, string[]> = {
  Quotidien: ["frais", "léger", "aquatique", "fruité", "floral"],
  Soirée: ["oriental", "épicé", "boisé", "vanillé", "gourmand"],
  Travail: ["frais", "boisé", "musqué", "propre"],
  Sport: ["frais", "aquatique", "citrus", "vert"],
  "Rendez-vous": ["séducteur", "oriental", "vanillé", "épicé"],
  Spécial: ["luxueux", "oud", "cuiré", "intense"],
};

const INTENSITY_STRONG = ["oud", "cuir", "cuiré", "épicé", "épice", "boisé", "oriental", "gourmand", "vanillé", "vanille"];

function textMatches(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

export async function recommendPerfumes(answers: QuizAnswers): Promise<Product[]> {
  const { gender, styles, occasion, intensity } = answers;

  // Gender → enum Gender (men | women | unisex)
  const genderValues = GENDER_MAP[gender.toLowerCase()] ?? ["unisex"];
  const genderEnums = genderValues as ("men" | "women" | "unisex")[];

  // On cherche uniquement les parfums (category.name = 'parfum') en stock
  let products = await prisma.product.findMany({
    where: {
      category: { name: "parfum" },
      stock: { gt: 0 },
      gender: { in: genderEnums },
    },
    orderBy: { price: "desc" },
    take: 50,
  });

  // Fallback 1 : genre + unisex
  if (products.length < 3) {
    products = await prisma.product.findMany({
      where: {
        category: { name: "parfum" },
        stock: { gt: 0 },
        gender: { in: [...genderEnums, "unisex"] },
      },
      orderBy: { price: "desc" },
      take: 50,
    });
  }

  // Fallback 2 : tous les parfums en stock
  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { category: { name: "parfum" }, stock: { gt: 0 } },
      orderBy: { price: "desc" },
      take: 50,
    });
  }

  // Fallback 3 : tous les produits en stock
  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      take: 20,
    });
  }

  // Scoring basé sur name + description (pas de champ style dans le schéma)
  const scored = products.map((product) => {
    let score = 0;
    const searchText = `${product.name} ${product.description ?? ""}`;

    // Styles sélectionnés par l'utilisateur
    styles.forEach((style) => {
      if (textMatches(searchText, [style])) score += 15;
    });

    // Occasion
    if (occasion && OCCASION_KEYWORDS[occasion]) {
      if (textMatches(searchText, OCCASION_KEYWORDS[occasion])) score += 20;
    }

    // Intensité
    if (intensity) {
      const isStrong = textMatches(searchText, INTENSITY_STRONG);
      const wantsStrong =
        intensity.toLowerCase().includes("puissant") ||
        intensity.toLowerCase().includes("intense");
      const wantsLight =
        intensity.toLowerCase().includes("léger") ||
        intensity.toLowerCase().includes("modéré");

      if (wantsStrong && isStrong) score += 12;
      if (wantsLight && !isStrong) score += 12;
    }

    // Bonus stock élevé (produit populaire)
    if (product.stock > 10) score += 3;

    // Bonus nouveau
    if (product.isNew) score += 5;

    return { product, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
    .slice(0, 12);
}