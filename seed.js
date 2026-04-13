require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL manquant dans .env");
  process.exit(1);
}

console.log("🔗 Connexion à PostgreSQL via Docker...");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("✨ Début du seed...\n");

  // 1. Maisons de parfum
  await prisma.perfumeHouse.createMany({
    data: [
      { name: "Dior" },
      { name: "Chanel" },
      { name: "Creed" },
      { name: "Tom Ford" },
      { name: "Maison Francis Kurkdjian" },
      { name: "Yves Saint Laurent" },
      { name: "Lancôme" },
      { name: "Guerlain" },
      { name: "Hermès" },
      { name: "Armani" },
      { name: "Paco Rabanne" },
      { name: "Versace" },
      { name: "Amouage" },
      { name: "Byredo" },
      { name: "Jo Malone" },
      { name: "Louis Vuitton" },
      { name: "Parfums de Marly" },
      { name: "Viktor&Rolf" },
      { name: "Carolina Herrera" },
      { name: "Le Labo" },
      { name: "Initio" },
    ],
    skipDuplicates: true,
  });

  const houses = await prisma.perfumeHouse.findMany();
  const houseByName = Object.fromEntries(houses.map(h => [h.name, h.id]));

  // 2. Catégories
  await prisma.category.createMany({
    data: [
      { name: "Homme", slug: "homme" },
      { name: "Femme", slug: "femme" },
      { name: "Unisexe", slug: "unisexe" },
      { name: "Floral", slug: "floral" },
      { name: "Boisé", slug: "boise" },
      { name: "Oriental", slug: "oriental" },
      { name: "Frais", slug: "frais" },
      { name: "Épicé", slug: "epice" },
      { name: "Aquatique", slug: "aquatique" },
      { name: "Gourmand", slug: "gourmand" },
    ],
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  // 3. Liste complète des 30 parfums avec images locales
  const perfumes = [
    // Homme (10)
    { name: "Sauvage Elixir", description: "Concentration extrême, boisé et épicé.", price: 450, category: "Homme", imageUrl: "/perfumes/sauvage-elixir.jpg", style: ["Boisé", "Épicé", "Frais"], house: "Dior", categories: ["homme", "boise", "epice", "frais"] },
    { name: "Bleu de Chanel Parfum", description: "Élégance boisée intemporelle.", price: 480, category: "Homme", imageUrl: "/perfumes/bleu-chanel.jpg", style: ["Boisé", "Frais"], house: "Chanel", categories: ["homme", "boise", "frais"] },
    { name: "Aventus", description: "Ananas fumé et charismatique.", price: 950, category: "Homme", imageUrl: "/perfumes/aventus.jpg", style: ["Fruité", "Boisé"], house: "Creed", categories: ["homme", "boise"] },
    { name: "Terre d'Hermès Parfum", description: "Minéral et terreux profond.", price: 420, category: "Homme", imageUrl: "/perfumes/terre-hermes.jpg", style: ["Boisé", "Minéral"], house: "Hermès", categories: ["homme", "boise"] },
    { name: "Acqua di Giò Profondo", description: "Aquatique intense.", price: 380, category: "Homme", imageUrl: "/perfumes/acqua-gio.jpg", style: ["Aquatique", "Frais"], house: "Armani", categories: ["homme", "aquatique", "frais"] },
    { name: "Invictus Victory", description: "Frais et victorieux.", price: 350, category: "Homme", imageUrl: "/perfumes/invictus.jpg", style: ["Frais", "Ambré"], house: "Paco Rabanne", categories: ["homme", "frais"] },
    { name: "Layton", description: "Pomme épicée luxueuse.", price: 850, category: "Homme", imageUrl: "/perfumes/layton.jpg", style: ["Épicé", "Fruité"], house: "Parfums de Marly", categories: ["homme", "epice"] },
    { name: "Spicebomb Extreme", description: "Explosion épicée chaude.", price: 370, category: "Homme", imageUrl: "/perfumes/spicebomb.jpg", style: ["Épicé", "Oriental"], house: "Viktor&Rolf", categories: ["homme", "epice", "oriental"] },
    { name: "Dylan Blue", description: "Frais méditerranéen.", price: 340, category: "Homme", imageUrl: "/perfumes/dylan-blue.jpg", style: ["Frais", "Aquatique"], house: "Versace", categories: ["homme", "frais", "aquatique"] },
    { name: "One Million Parfum", description: "Ambre solaire cuiré.", price: 360, category: "Homme", imageUrl: "/perfumes/one-million.jpg", style: ["Ambré", "Cuiré"], house: "Paco Rabanne", categories: ["homme", "oriental"] },

    // Femme (10)
    { name: "J'adore Eau de Parfum", description: "Bouquet floral opulent.", price: 420, category: "Femme", imageUrl: "/perfumes/jadore.jpg", style: ["Floral", "Fruité"], house: "Dior", categories: ["femme", "floral"] },
    { name: "Chanel N°5", description: "L'intemporel absolu.", price: 500, category: "Femme", imageUrl: "/perfumes/chanel-5.jpg", style: ["Aldéhydé", "Floral"], house: "Chanel", categories: ["femme", "floral"] },
    { name: "Black Opium", description: "Gourmand rock addictif.", price: 380, category: "Femme", imageUrl: "/perfumes/black-opium.jpg", style: ["Gourmand", "Vanille"], house: "Yves Saint Laurent", categories: ["femme", "gourmand", "oriental"] },
    { name: "La Vie Est Belle", description: "Iris praliné joyeux.", price: 360, category: "Femme", imageUrl: "/perfumes/la-vie-belle.jpg", style: ["Gourmand", "Floral"], house: "Lancôme", categories: ["femme", "gourmand", "floral"] },
    { name: "Libre Intense", description: "Lavande vanille audacieuse.", price: 400, category: "Femme", imageUrl: "/perfumes/libre.jpg", style: ["Floral", "Oriental"], house: "Yves Saint Laurent", categories: ["femme", "floral", "oriental"] },
    { name: "Good Girl", description: "Talons aiguilles sensuels.", price: 390, category: "Femme", imageUrl: "/perfumes/good-girl.jpg", style: ["Oriental", "Floral"], house: "Carolina Herrera", categories: ["femme", "oriental", "floral"] },
    { name: "Delina", description: "Rose turque fruitée.", price: 900, category: "Femme", imageUrl: "/perfumes/delina.jpg", style: ["Floral", "Fruité"], house: "Parfums de Marly", categories: ["femme", "floral"] },
    { name: "Mon Guerlain", description: "Lavande vanille élégante.", price: 410, category: "Femme", imageUrl: "/perfumes/mon-guerlain.jpg", style: ["Oriental", "Vanille"], house: "Guerlain", categories: ["femme", "oriental"] },
    { name: "Si", description: "Cassis vanille moderne.", price: 370, category: "Femme", imageUrl: "/perfumes/si.jpg", style: ["Fruité", "Gourmand"], house: "Armani", categories: ["femme", "gourmand"] },
    { name: "Olympéa", description: "Vanille salée divine.", price: 350, category: "Femme", imageUrl: "/perfumes/olympea.jpg", style: ["Gourmand", "Vanille"], house: "Paco Rabanne", categories: ["femme", "gourmand"] },

    // Unisexe (10)
    { name: "Baccarat Rouge 540", description: "Safran ambré aérien.", price: 1050, category: "Unisexe", imageUrl: "/perfumes/baccarat-rouge.jpg", style: ["Ambré", "Safran"], house: "Maison Francis Kurkdjian", categories: ["unisexe", "oriental", "boise"] },
    { name: "Oud Wood", description: "Oud doux luxueux.", price: 850, category: "Unisexe", imageUrl: "/perfumes/oud-wood.jpg", style: ["Boisé", "Oud"], house: "Tom Ford", categories: ["unisexe", "boise"] },
    { name: "Gypsy Water", description: "Bohème forestier.", price: 620, category: "Unisexe", imageUrl: "/perfumes/gypsy-water.jpg", style: ["Boisé", "Encens"], house: "Byredo", categories: ["unisexe", "boise"] },
    { name: "Another 13", description: "Musc animalique mystérieux.", price: 700, category: "Unisexe", imageUrl: "/perfumes/another-13.jpg", style: ["Musc", "Boisé"], house: "Le Labo", categories: ["unisexe", "boise"] },
    { name: "English Pear & Freesia", description: "Poire fraîche élégante.", price: 450, category: "Unisexe", imageUrl: "/perfumes/english-pear.jpg", style: ["Fruité", "Floral"], house: "Jo Malone", categories: ["unisexe", "floral"] },
    { name: "Reflection Man", description: "Frais floral musqué.", price: 800, category: "Unisexe", imageUrl: "/perfumes/reflection-man.jpg", style: ["Floral", "Musc"], house: "Amouage", categories: ["unisexe", "floral"] },
    { name: "Neroli Portofino", description: "Agrumes méditerranéens.", price: 750, category: "Unisexe", imageUrl: "/perfumes/neroli-portofino.jpg", style: ["Agrumes", "Frais"], house: "Tom Ford", categories: ["unisexe", "frais"] },
    { name: "Santal 33", description: "Santal crémeux iconique.", price: 680, category: "Unisexe", imageUrl: "/perfumes/santal-33.jpg", style: ["Boisé", "Santal"], house: "Le Labo", categories: ["unisexe", "boise"] },
    { name: "Louis Vuitton Imagination", description: "Agrumes ambrés modernes.", price: 950, category: "Unisexe", imageUrl: "/perfumes/lv-imagination.jpg", style: ["Agrumes", "Ambré"], house: "Louis Vuitton", categories: ["unisexe", "frais"] },
    { name: "Oud for Greatness", description: "Oud safran puissant.", price: 900, category: "Unisexe", imageUrl: "/perfumes/oud-greatness.jpg", style: ["Oud", "Safran"], house: "Initio", categories: ["unisexe", "boise", "oriental"] },
  ];

  // 4. Insertion des parfums avec vérification
  for (const p of perfumes) {
    const houseId = houseByName[p.house];
    if (!houseId) {
      console.warn(`⚠️ Maison inconnue : ${p.house} (ignorée)`);
      continue;
    }

    const existing = await prisma.perfume.findFirst({
      where: { name: p.name },
    });

    if (existing) {
      console.log(`✓ Déjà présent : ${p.name}`);
      continue;
    }

    const perfume = await prisma.perfume.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
        style: p.style,
        houseId: houseId,
        stock: 100,
      },
    });

    const links = p.categories.map(slug => ({
      perfumeId: perfume.id,
      categoryId: catBySlug[slug],
    })).filter(l => l.categoryId);

    if (links.length > 0) {
      await prisma.perfumeCategory.createMany({
        data: links,
        skipDuplicates: true,
      });
    }

    console.log(`✅ Ajouté : ${p.name}`);
  }

  // 5. Utilisateurs
  console.log("\n👤 Création des utilisateurs...");

  const usersData = [
    { clerkId: "admin_001", email: "admin@parfumia.com", name: "Admin ParfumIA", role: "ADMIN" },
    { clerkId: "user_001", email: "marwa.tunis@example.com", name: "Marwa Ben Ali", role: "CLIENT" },
    { clerkId: "user_002", email: "ahmed.tn@gmail.com", name: "Ahmed Khaldi", role: "CLIENT" },
    { clerkId: "user_003", email: "sara.luxe@outlook.com", name: "Sara Mahfoudh", role: "CLIENT" },
    { clerkId: "user_004", email: "karim.paris@free.fr", name: "Karim Zouari", role: "CLIENT" },
  ];

  const createdUsers = [];

  for (const u of usersData) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: u.clerkId,
          email: u.email,
          name: u.name,
          role: u.role,
        },
      });
      console.log(`✅ Créé : ${user.name} (${user.role})`);
    } else {
      console.log(`✓ Existe déjà : ${user.name} (${user.role})`);
    }

    createdUsers.push(user);
  }

  const userByEmail = Object.fromEntries(createdUsers.map(u => [u.email, u]));

  // 6. Commandes + items
  console.log("\n🛒 Création des commandes...");

  const ordersData = [
    {
      userEmail: "marwa.tunis@example.com",
      status: "PENDING",
      delivery: "DELIVERY",
      items: [
        { perfumeName: "Sauvage Elixir", qty: 1 },
        { perfumeName: "Baccarat Rouge 540", qty: 1 },
      ],
    },
    {
      userEmail: "ahmed.tn@gmail.com",
      status: "CONFIRMED",
      delivery: "PICKUP",
      items: [
        { perfumeName: "Aventus", qty: 1 },
        { perfumeName: "Layton", qty: 2 },
      ],
    },
    {
      userEmail: "sara.luxe@outlook.com",
      status: "SHIPPED",
      delivery: "DELIVERY",
      items: [
        { perfumeName: "J'adore Eau de Parfum", qty: 1 },
        { perfumeName: "Delina", qty: 1 },
      ],
    },
    {
      userEmail: "marwa.tunis@example.com",
      status: "DELIVERED",
      delivery: "DELIVERY",
      items: [
        { perfumeName: "Bleu de Chanel Parfum", qty: 1 },
      ],
    },
    {
      userEmail: "karim.paris@free.fr",
      status: "CANCELLED",
      delivery: "PICKUP",
      items: [
        { perfumeName: "Oud Wood", qty: 1 },
        { perfumeName: "Santal 33", qty: 1 },
      ],
    },
  ];

  for (const ord of ordersData) {
    const user = userByEmail[ord.userEmail];
    if (!user) {
      console.warn(`⚠️ Utilisateur non trouvé : ${ord.userEmail}`);
      continue;
    }

    const orderItemsData = [];
    let total = 0;

    for (const item of ord.items) {
      const perfume = await prisma.perfume.findFirst({
        where: { name: item.perfumeName },
      });

      if (!perfume) {
        console.warn(`⚠️ Parfum non trouvé : ${item.perfumeName}`);
        continue;
      }

      orderItemsData.push({
        perfumeId: perfume.id,
        quantity: item.qty,
        price: perfume.price,
      });

      total += perfume.price * item.qty;
    }

    if (orderItemsData.length === 0) continue;

    await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: total,
        status: ord.status,
        deliveryMethod: ord.delivery,
        items: {
          createMany: { data: orderItemsData },
        },
      },
    });

    console.log(`✅ Commande ${ord.status} créée pour ${user.name} (${total} TND)`);
  }

  // 7. Quelques réponses au quiz
  console.log("\n📝 Ajout de réponses au quiz...");

  await prisma.quizResponse.createMany({
    data: [
      {
        userId: userByEmail["marwa.tunis@example.com"]?.id,
        preferences: JSON.stringify({
          gender: "Femme",
          season: "Hiver",
          notes: ["vanille", "rose", "gourmand"],
          intensity: "Fort",
        }),
        suggestedPerfumes: [1, 12, 15], // IDs fictifs - adapte si besoin
      },
      {
        userId: userByEmail["ahmed.tn@gmail.com"]?.id,
        preferences: JSON.stringify({
          gender: "Homme",
          season: "Été",
          notes: ["frais", "aquatique", "agrumes"],
          intensity: "Léger",
        }),
        suggestedPerfumes: [5, 9],
      },
    ],
    skipDuplicates: true,
  });

  console.log("✓ Réponses quiz ajoutées");

  // ────────────────────────────────────────────────
  console.log("\n✅ Seed terminé avec succès !");
  console.log("═══════════════════════════════════════");
  console.log("🎯 BASE DE DONNÉES PRÊTE POUR PARFUMIA");
  console.log("═══════════════════════════════════════");
  console.log("💰 Prix en TND | 👔 Homme | 👗 Femme | 🎭 Unisexe");
  console.log("🚀 npm run dev");
  console.log("💜 Quiz : http://localhost:3000/quiz");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch(e => {
    console.error("❌ Erreur durant le seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });