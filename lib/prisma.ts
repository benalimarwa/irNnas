// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL n'est pas défini dans .env");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter })
  .$extends({
    name: "perfume-with-house",
    query: {
      perfume: {
        async findMany({ args, query }) {
          args.include = { ...(args.include || {}), house: true };
          return query(args);
        },
        async findUnique({ args, query }) {
          args.include = { ...(args.include || {}), house: true };
          return query(args);
        },
      },
    },
  });