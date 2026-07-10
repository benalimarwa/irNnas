import { config } from 'dotenv';
config({ path: '.env' });

if (!process.env.DATABASE_URL) {
  throw new Error('❌ DATABASE_URL manquant dans .env');
}

import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Début du seeding...');

  // ⚠️ Ordre important : Favorite doit être nettoyé AVANT Product
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Base nettoyée');

  const users = [
    {
      clerkId: "user_REMPLACER_ZMORDA",
      email: "zmorda.benali1970@gmail.com",
      firstName: "Zmorda",
      lastName: "Ben Ali",
      role: "ADMIN",
    },
    {
      clerkId: "user_REMPLACER_MARWA",
      email: "mba.marwa25@gmail.com",
      firstName: "Marwa",
      lastName: "Ben Ali",
      role: "CLIENT",
    },
  ];

  // ✅ On récupère les users créés pour avoir leur vrai id (cuid)
  const createdUsers = [];
  for (const user of users) {
    const u = await prisma.user.create({ data: user });
    createdUsers.push(u);
  }
  console.log('✅ Users créés');

  // ✅ Créer les catégories d'abord
  const categoryNames = [
    "pantalon", "pull", "veste", "chemise", "accessoire",
    "robe", "chaussure", "manteau", "t-shirt", "jupe",
  ];

  const categoryMap = {};
  for (const name of categoryNames) {
    const cat = await prisma.category.create({ data: { name } });
    categoryMap[name] = cat.id;
  }
  console.log('✅ Catégories créées');

 

  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });