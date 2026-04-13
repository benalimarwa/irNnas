// lib/recommend.ts → VERSION CORRIGÉE POUR VOTRE SCHÉMA
import { prisma } from "@/lib/prisma";
import { PerfumeWithHouse } from "@/types/perfume";

type QuizAnswers = {
  gender: string;
  styles: string[];
  occasion?: string;
  intensity?: string;
};

const GENDER_MAP: Record<string, string[]> = {
  homme: ["homme", "men", "masculin", "hommes"],
  femme: ["femme", "women", "féminin", "femmes"],
  enfant: ["enfant", "children", "kids", "enfants"],
  mixte: ["mixte", "unisex", "unisexe"],
};

const OCCASION_KEYWORDS: Record<string, string[]> = {
  Quotidien: ["frais", "léger", "aquatique", "fruité", "floral"],
  Soirée: ["oriental", "épicé", "boisé", "vanillé", "gourmand"],
  Travail: ["frais", "boisé", "musqué", "propre"],
  Sport: ["frais", "aquatique", "citrus", "vert"],
  "Rendez-vous": ["séducteur", "oriental", "vanillé", "épicé"],
  Spécial: ["luxueux", "oud", "cuiré", "intense"],
};

export async function recommendPerfumes(answers: QuizAnswers): Promise<PerfumeWithHouse[]> {
  const { gender, styles, occasion, intensity } = answers;

  console.log('🎯 Quiz Answers:', { gender, styles, occasion, intensity });

  // Construction du filtre de genre
  const genderFilter = gender.toLowerCase() in GENDER_MAP
    ? GENDER_MAP[gender.toLowerCase()]
    : ["mixte", "unisex", "unisexe"];

  console.log('🔍 Gender filter:', genderFilter);

  // Filtre de base
  const whereClause: any = {
    AND: [
      {
        OR: genderFilter.map(g => ({
          category: { contains: g, mode: 'insensitive' }
        }))
      },
      { stock: { gt: 0 } }
    ]
  };

  // Ajouter le filtre de styles si présent
  if (styles && styles.length > 0) {
    // Normaliser les styles en minuscules
    const normalizedStyles = styles.map(s => s.toLowerCase());
    
    console.log('🎨 Styles to search:', normalizedStyles);
    
    whereClause.AND.push({
      OR: normalizedStyles.map(style => ({
        style: { has: style }
      }))
    });
  }

  console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2));

  let perfumes = await prisma.perfume.findMany({
    where: whereClause,
    include: {
      house: {
        select: { id: true, name: true },
      },
    },
    orderBy: { price: "desc" },
    take: 20,
  });

  console.log('✅ Perfumes found (first pass):', perfumes.length);

  // Fallback 1: Si peu de résultats, chercher uniquement par genre
  if (perfumes.length < 3) {
    console.log('⚠️ Not enough results, trying fallback (genre only)...');
    
    perfumes = await prisma.perfume.findMany({
      where: {
        AND: [
          {
            OR: genderFilter.map(g => ({
              category: { contains: g, mode: 'insensitive' }
            }))
          },
          { stock: { gt: 0 } }
        ]
      },
      include: {
        house: { select: { id: true, name: true } },
      },
      take: 20,
    });
    
    console.log('✅ Perfumes found (fallback genre):', perfumes.length);
  }

  // Fallback 2: Si toujours aucun résultat, retourner des parfums avec les styles demandés
  if (perfumes.length === 0 && styles && styles.length > 0) {
    console.log('⚠️ Still no results, trying styles only...');
    
    const normalizedStyles = styles.map(s => s.toLowerCase());
    
    perfumes = await prisma.perfume.findMany({
      where: {
        AND: [
          {
            OR: normalizedStyles.map(style => ({
              style: { has: style }
            }))
          },
          { stock: { gt: 0 } }
        ]
      },
      include: {
        house: { select: { id: true, name: true } },
      },
      take: 20,
    });
    
    console.log('✅ Perfumes found (styles only):', perfumes.length);
  }

  // Fallback 3: Si toujours rien, retourner des parfums aléatoires
  if (perfumes.length === 0) {
    console.log('⚠️ Still no results, returning random perfumes...');
    
    perfumes = await prisma.perfume.findMany({
      where: { stock: { gt: 0 } },
      include: {
        house: { select: { id: true, name: true } },
      },
      take: 12,
    });
  }

  console.log('📊 Total perfumes to score:', perfumes.length);

  // Scoring IA (amélioré)
  const scored = perfumes.map((perfume) => {
    let score = 0;

    // Normaliser les styles du parfum
    const perfumeStyles = perfume.style.map(s => s.toLowerCase());

    // Styles sélectionnés (correspondance exacte)
    const styleMatches = styles.filter(s => 
      perfumeStyles.includes(s.toLowerCase())
    ).length;
    score += styleMatches * 15;

    // Correspondance partielle pour les styles
    styles.forEach(selectedStyle => {
      perfumeStyles.forEach(perfumeStyle => {
        if (perfumeStyle.includes(selectedStyle.toLowerCase()) || 
            selectedStyle.toLowerCase().includes(perfumeStyle)) {
          score += 5;
        }
      });
    });

    // Occasion
    if (occasion && OCCASION_KEYWORDS[occasion]) {
      const occasionMatch = perfumeStyles.some(s =>
        OCCASION_KEYWORDS[occasion].some(k => 
          s.includes(k.toLowerCase()) || k.toLowerCase().includes(s)
        )
      );
      if (occasionMatch) score += 20;
    }

    // Intensité
    if (intensity) {
      const intensityLevel = intensity.toLowerCase();
      const isStrong = perfumeStyles.some(s =>
        ["oud", "cuir", "cuiré", "épicé", "épice", "boisé", "oriental", "gourmand", "vanillé", "vanille"].includes(s)
      );
      
      if ((intensityLevel.includes("puissant") || intensityLevel.includes("intense")) && isStrong) {
        score += 12;
      } else if ((intensityLevel.includes("léger") || intensityLevel.includes("modéré")) && !isStrong) {
        score += 12;
      }
    }

    // Bonus pour les maisons de luxe
    const luxury = ["Creed", "Tom Ford", "Maison Francis Kurkdjian", "Byredo", "Amouage", "Dior", "Chanel"];
    if (luxury.some(l => perfume.house.name.includes(l))) {
      score += 8;
    }

    console.log(`📊 ${perfume.name} - Score: ${score}`);

    return { perfume, score };
  });

  const finalResults = scored
    .sort((a, b) => b.score - a.score)
    .map(({ perfume }) => perfume)
    .slice(0, 12);

  console.log('🎉 Final recommendations:', finalResults.length);
  if (finalResults.length > 0) {
    console.log('Top 3:', finalResults.slice(0, 3).map(p => p.name));
  }

  return finalResults;
}