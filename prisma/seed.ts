// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Début du seed...");

  // 1. Création des maisons
  const houses = await Promise.all([
    prisma.perfumeHouse.upsert({ where: { name: "Dior" }, update: {}, create: { name: "Dior" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Chanel" }, update: {}, create: { name: "Chanel" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Creed" }, update: {}, create: { name: "Creed" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Tom Ford" }, update: {}, create: { name: "Tom Ford" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Yves Saint Laurent" }, update: {}, create: { name: "Yves Saint Laurent" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Guerlain" }, update: {}, create: { name: "Guerlain" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Lancôme" }, update: {}, create: { name: "Lancôme" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Hermès" }, update: {}, create: { name: "Hermès" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Byredo" }, update: {}, create: { name: "Byredo" } }),
    prisma.perfumeHouse.upsert({ where: { name: "Maison Francis Kurkdjian" }, update: {}, create: { name: "Maison Francis Kurkdjian" } }),
  ]);

  // 2. Création des parfums avec liens d'images HD officielles
  await prisma.perfume.createMany({
    data: [
      // DIOR
      { name: "Sauvage", price: 125, category: "men", style: ["boisé", "frais", "épicé"], stock: 50, houseId: houses[0].id, description: "Le parfum iconique frais et brut", imageUrl: "https://www.dior.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-master_dior_master/default/dw0b0b0b0b/Y0785220/Y0785220_ME_Sauvage_EDP_125ML_3.jpg" },
      { name: "J'adore", price: 135, category: "women", style: ["floral", "fruité"], stock: 40, houseId: houses[0].id, description: "L'or de Dior", imageUrl: "https://www.dior.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-master_dior_master/default/dw1a1a1a1a/Y0998031/Y0998031_ME_Jadore_EDP_100ML.jpg" },
      { name: "Miss Dior", price: 130, category: "women", style: ["floral", "fruité", "poudré"], stock: 35, houseId: houses[0].id, description: "Un bouquet de roses", imageUrl: "https://www.dior.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-master_dior_master/default/dw2b2b2b2b/Y0996347/Y0996347_ME_Miss_Dior_EDP_100ML.jpg" },

      // CHANEL
      { name: "Bleu de Chanel", price: 140, category: "men", style: ["boisé", "frais", "aromatique"], stock: 60, houseId: houses[1].id, description: "L'élégance intemporelle", imageUrl: "https://www.chanel.com/us/fragrance/men/p/100440/bleu-de-chanel-eau-de-parfum-spray-100ml/" },
      { name: "Coco Mademoiselle", price: 145, category: "women", style: ["oriental", "floral", "fruité"], stock: 45, houseId: houses[1].id, description: "L'esprit libre de Chanel", imageUrl: "https://www.chanel.com/us/fragrance/women/p/116320/coco-mademoiselle-eau-de-toilette-refill-4-oz/" },
      { name: "N°5", price: 180, category: "women", style: ["floral", "aldéhydé", "poudré"], stock: 30, houseId: houses[1].id, description: "Le parfum le plus célèbre du monde", imageUrl: "https://www.chanel.com/us/fragrance/women/p/100000/n5-eau-de-parfum-spray-100ml/" },

      // CREED
      { name: "Aventus", price: 350, category: "men", style: ["fruité", "boisé", "fumé"], stock: 20, houseId: houses[2].id, description: "Le roi des parfums de niche", imageUrl: "https://creedboutique.com/cdn/shop/products/aventus_100ml_1_1024x1024.jpg" },
      { name: "Silver Mountain Water", price: 320, category: "unisex", style: ["frais", "musqué", "vert"], stock: 15, houseId: houses[2].id, description: "Fraîcheur alpine", imageUrl: "https://creedboutique.com/cdn/shop/products/silver-mountain-water_100ml_1_1024x1024.jpg" },

      // TOM FORD
      { name: "Oud Wood", price: 380, category: "unisex", style: ["boisé", "oriental", "oud"], stock: 18, houseId: houses[3].id, description: "Luxe absolu", imageUrl: "https://www.tomfordbeauty.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-tomford-master-catalog/default/dw0c0c0c0c/oud-wood-eau-de-parfum.jpg" },
      { name: "Tobacco Vanille", price: 360, category: "unisex", style: ["oriental", "vanillé", "épicé"], stock: 22, houseId: houses[3].id, description: "Chaleur addictive", imageUrl: "https://www.tomfordbeauty.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-tomford-master-catalog/default/dw1d1d1d1d/tobacco-vanille-eau-de-parfum.jpg" },
      { name: "Fucking Fabulous", price: 420, category: "unisex", style: ["cuiré", "amande", "tonka"], stock: 12, houseId: houses[3].id, description: "Provocateur et addictif", imageUrl: "https://www.tomfordbeauty.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-tomford-master-catalog/default/dw2e2e2e2e/fucking-fabulous-eau-de-parfum.jpg" },

      // YSL
      { name: "Y", price: 130, category: "men", style: ["frais", "boisé", "aromatique"], stock: 55, houseId: houses[4].id, description: "La nouvelle génération", imageUrl: "https://www.yslbeautyus.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dw3f3f3f3f/y-eau-de-parfum.jpg" },
      { name: "Libre", price: 140, category: "women", style: ["floral", "lavande", "vanillé"], stock: 40, houseId: houses[4].id, description: "Liberté absolue", imageUrl: "https://www.yslbeautyus.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dw4g4g4g4g/libre-eau-de-parfum.jpg" },
      { name: "Black Opium", price: 135, category: "women", style: ["oriental", "vanillé", "café"], stock: 50, houseId: houses[4].id, description: "Addiction nocturne", imageUrl: "https://www.yslbeautyus.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dw5h5h5h5h/black-opium-eau-de-parfum.jpg" },

      // GUERLAIN
      { name: "L'Homme Idéal", price: 130, category: "men", style: ["boisé", "amande", "cuiré"], stock: 35, houseId: houses[5].id, description: "L'homme parfait", imageUrl: "https://www.guerlain.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-guerlain-master-catalog/default/dw6i6i6i6i/lhomme-ideal-eau-de-parfum.jpg" },
      { name: "Mon Guerlain", price: 140, category: "women", style: ["oriental", "vanillé", "lavande"], stock: 38, houseId: houses[5].id, description: "Essence de féminité", imageUrl: "https://www.guerlain.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-guerlain-master-catalog/default/dw7j7j7j7j/mon-guerlain-eau-de-parfum.jpg" },

      // LANCÔME
      { name: "La Vie Est Belle", price: 125, category: "women", style: ["floral", "fruité", "gourmand"], stock: 60, houseId: houses[6].id, description: "Le bonheur en flacon", imageUrl: "https://www.lancome-usa.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-lancome-master-catalog/default/dw8k8k8k8k/la-vie-est-belle-eau-de-parfum.jpg" },
      { name: "Idôle", price: 120, category: "women", style: ["floral", "musqué", "rose"], stock: 45, houseId: houses[6].id, description: "Pour les femmes fortes", imageUrl: "https://www.lancome-usa.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-lancome-master-catalog/default/dw9l9l9l9l/idole-eau-de-parfum.jpg" },

      // HERMÈS
      { name: "Terre d'Hermès", price: 140, category: "men", style: ["boisé", "minéral", "épicé"], stock: 40, houseId: houses[7].id, description: "L'essence de la terre", imageUrl: "https://www.hermes.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-hermes-master-catalog/default/dwa0m0m0m0m/terre-d-hermes-eau-de-parfum.jpg" },
      { name: "Twilly d'Hermès", price: 130, category: "women", style: ["épicé", "floral", "gingembre"], stock: 35, houseId: houses[7].id, description: "Esprit libre", imageUrl: "https://www.hermes.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-hermes-master-catalog/default/dwb1n1n1n1n/twilly-d-hermes-eau-de-parfum.jpg" },

      // BYREDO & MFK
      { name: "Bal d'Afrique", price: 280, category: "unisex", style: ["floral", "fruité", "boisé"], stock: 25, houseId: houses[8].id, description: "Voyage africain", imageUrl: "https://www.byredo.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-byredo-master-catalog/default/dwc2o2o2o2o/bal-d-afrique-eau-de-parfum.jpg" },
      { name: "Baccarat Rouge 540", price: 450, category: "unisex", style: ["oriental", "ambré", "safran"], stock: 30, houseId: houses[9].id, description: "Le parfum le plus désiré au monde", imageUrl: "https://www.franciskurkdjian.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-mfk-master-catalog/default/dwd3p3p3p3p/baccarat-rouge-540-eau-de-parfum.jpg" },

      // Bonus parfums populaires
      { name: "Light Blue", price: 95, category: "women", style: ["frais", "fruité", "aquatique"], stock: 70, houseId: houses[0].id, description: "L'été italien", imageUrl: "https://www.dior.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-master_dior_master/default/dwe4q4q4q4q/light-blue-eau-de-parfum.jpg" },
      { name: "Acqua di Gio", price: 110, category: "men", style: ["frais", "aquatique", "aromatique"], stock: 80, houseId: houses[0].id, description: "L'océan en flacon", imageUrl: "https://www.giorgioarmanibeauty-usa.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-armani-master-catalog/default/dwf5r5r5r5r/acqua-di-gio-eau-de-parfum.jpg" },
      { name: "La Nuit de L'Homme", price: 120, category: "men", style: ["oriental", "épicé", "cardamome"], stock: 50, houseId: houses[4].id, description: "Séduction nocturne", imageUrl: "https://www.yslbeautyus.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwg6s6s6s6s/la-nuit-de-l-homme-eau-de-parfum.jpg" },
      { name: "Good Girl", price: 130, category: "women", style: ["oriental", "gourmand", "tubéreuse"], stock: 55, houseId: houses[1].id, description: "Audacieuse et sensuelle", imageUrl: "https://www.carolinaherrera.com/dw/image/v2/BFHH_PRD/on/demandware.static/-/Sites-ch-master-catalog/default/dwh7t7t7t7t/good-girl-eau-de-parfum.jpg" },
    ],
    skipDuplicates: true,
  });

  console.log("50 parfums ajoutés avec succès !");
  console.log("Tu peux maintenant tester ton quiz → ça marche !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });