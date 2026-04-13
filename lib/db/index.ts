// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Connexion PostgreSQL
const client = postgres(connectionString);

// Instance Drizzle
export const db = drizzle(client, { schema });