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

  // Nettoyage dans l'ordre (respecter les clés étrangères)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Base nettoyée');

  // ⚠️ Remplace les clerkId ci-dessous par les vrais ID Clerk
  // (visibles dans le dashboard Clerk > Users > cliquer sur l'utilisateur)
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

  for (const user of users) {
    await prisma.user.create({ data: user });
  }
  console.log('✅ Users créés');

  const products = [
    {
      name: "Pantalon Cargo Noir",
      description: "Pantalon cargo large avec poches utilitaires. Style streetwear premium.",
      price: 89.99,
      category: "pantalon",
      gender: "unisex",
      color: "Noir",
      colorHex: "#111111",
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        "https://images.unsplash.com/photo-1585487000160-6eb1fcb4d5a1?w=800"
      ],
      sizes: ["S", "M", "L", "XL"],
      material: "Coton / Polyester",
      fit: "Relaxed",
      isNew: true,
    },
    {
      name: "Pull Oversize Cachemire",
      description: "Pull en maille douce ultra confortable.",
      price: 129.99,
      category: "pull",
      gender: "unisex",
      color: "Beige",
      colorHex: "#D2B48C",
      stock: 32,
      images: ["https://images.unsplash.com/photo-1622445275576-721325763afe?w=800"],
      sizes: ["S", "M", "L"],
      material: "Cachemire / Laine",
      fit: "Oversize",
      isNew: false,
    },
    {
      name: "Veste Denim Vintage",
      description: "Veste en jean brut premium.",
      price: 149.99,
      category: "veste",
      gender: "unisex",
      color: "Bleu Denim",
      colorHex: "#4A6B8A",
      stock: 18,
      images: ["https://images.unsplash.com/photo-1551028719-00167b16b4d0?w=800"],
      sizes: ["M", "L", "XL"],
      material: "100% Coton Denim",
      fit: "Regular",
      isNew: true,
    },
    {
      name: "Chemise Oxford Blanche",
      description: "Chemise classique élégante.",
      price: 69.99,
      category: "chemise",
      gender: "men",
      color: "Blanc",
      colorHex: "#FFFFFF",
      stock: 55,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"],
      sizes: ["S", "M", "L", "XL"],
      material: "Coton Oxford",
      fit: "Slim",
      isNew: false,
    },
    {
      name: "Sac Bandoulière Cuir",
      description: "Sac bandoulière élégant en similicuir.",
      price: 59.99,
      category: "accessoire",
      gender: "unisex",
      color: "Marron",
      colorHex: "#8B4513",
      stock: 22,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
      sizes: [],
      material: "Similicuir",
      fit: "",
      isNew: false,
    },
    {
      name: "Robe Satin Émeraude",
      description: "Robe longue en satin fluide, coupe ajustée et élégante.",
      price: 159.99,
      category: "robe",
      gender: "women",
      color: "Émeraude",
      colorHex: "#046307",
      stock: 15,
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
      sizes: ["XS", "S", "M", "L"],
      material: "Satin",
      fit: "Slim",
      isNew: true,
    },
    {
      name: "Sneakers Blanches Premium",
      description: "Sneakers minimalistes en cuir véritable.",
      price: 119.99,
      category: "chaussure",
      gender: "unisex",
      color: "Blanc",
      colorHex: "#FAFAFA",
      stock: 40,
      images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800"],
      sizes: ["39", "40", "41", "42", "43", "44"],
      material: "Cuir",
      fit: "Regular",
      isNew: false,
    },
    {
      name: "Trench Coat Camel",
      description: "Trench classique intemporel, coupe droite.",
      price: 219.99,
      category: "manteau",
      gender: "unisex",
      color: "Camel",
      colorHex: "#C19A6B",
      stock: 12,
      images: ["https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800"],
      sizes: ["S", "M", "L", "XL"],
      material: "Coton / Polyester",
      fit: "Regular",
      isNew: true,
    },
    {
      name: "T-shirt Basique Blanc",
      description: "T-shirt essentiel en coton bio.",
      price: 24.99,
      category: "t-shirt",
      gender: "unisex",
      color: "Blanc",
      colorHex: "#FFFFFF",
      stock: 100,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      material: "Coton Bio",
      fit: "Regular",
      isNew: false,
    },
    {
      name: "Jupe Plissée Noire",
      description: "Jupe plissée midi, tombée fluide.",
      price: 79.99,
      category: "jupe",
      gender: "women",
      color: "Noir",
      colorHex: "#111111",
      stock: 28,
      images: ["https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800"],
      sizes: ["XS", "S", "M", "L"],
      material: "Polyester plissé",
      fit: "A-line",
      isNew: false,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const p = await prisma.product.create({ data: product });
    createdProducts.push(p);
  }
  console.log('✅ Produits créés');

  const adminId = users[0].clerkId;
  const clientId = users[1].clerkId;

  const orders = [
    {
      userId: clientId,
      status: "confirmed",
      total: 219.98,
      deliveryMethod: "DELIVERY",
      items: [
        { productId: createdProducts[0].id, quantity: 1, size: "M", price: 89.99 },
        { productId: createdProducts[1].id, quantity: 1, size: "L", price: 129.99 },
      ],
    },
    {
      userId: clientId,
      status: "shipped",
      total: 149.99,
      deliveryMethod: "PICKUP",
      items: [{ productId: createdProducts[2].id, quantity: 1, size: "L", price: 149.99 }],
    },
    {
      userId: clientId,
      status: "delivered",
      total: 279.97,
      deliveryMethod: "DELIVERY",
      items: [
        { productId: createdProducts[3].id, quantity: 1, size: "M", price: 69.99 },
        { productId: createdProducts[4].id, quantity: 1, size: "S", price: 59.99 },
      ],
    },
    {
      userId: clientId,
      status: "pending",
      total: 89.99,
      deliveryMethod: "PICKUP",
      items: [{ productId: createdProducts[0].id, quantity: 1, size: "L", price: 89.99 }],
    },
    {
      userId: clientId,
      status: "delivered",
      total: 159.99,
      deliveryMethod: "DELIVERY",
      items: [{ productId: createdProducts[5].id, quantity: 1, size: "S", price: 159.99 }],
    },
    {
      userId: clientId,
      status: "confirmed",
      total: 244.98,
      deliveryMethod: "DELIVERY",
      items: [
        { productId: createdProducts[6].id, quantity: 1, size: "42", price: 119.99 },
        { productId: createdProducts[8].id, quantity: 5, size: "M", price: 24.99 },
      ],
    },
    {
      userId: adminId,
      status: "pending",
      total: 219.99,
      deliveryMethod: "PICKUP",
      items: [{ productId: createdProducts[7].id, quantity: 1, size: "L", price: 219.99 }],
    },
    {
      userId: adminId,
      status: "shipped",
      total: 79.99,
      deliveryMethod: "DELIVERY",
      items: [{ productId: createdProducts[9].id, quantity: 1, size: "M", price: 79.99 }],
    },
  ];

  for (const orderData of orders) {
    const { items, ...orderInfo } = orderData;
    const order = await prisma.order.create({
      data: {
        ...orderInfo,
        items: { create: items },
      },
    });
    console.log(`✅ Commande #${order.id} (${order.status}) créée`);
  }

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