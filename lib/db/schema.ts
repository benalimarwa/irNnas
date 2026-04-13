// lib/db/schema.ts (Ajouter ce schéma à votre fichier existant)
import { pgTable, text, timestamp, varchar, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  imageUrl: text('image_url'),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'user' ou 'admin'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type TypeScript pour l'utilisateur
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;