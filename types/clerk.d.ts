// types/clerk.d.ts
// Ce fichier type les métadonnées Clerk pour éviter les cast manuels dans le code

import "@clerk/nextjs/server";

declare module "@clerk/nextjs/server" {
  interface CustomPublicMetadata {
    role?: "ADMIN" | "CLIENT";
    dbUserId?: string;
  }
}