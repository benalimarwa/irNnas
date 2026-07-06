/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Étape 1 : créer une catégorie par défaut
INSERT INTO "Category" (name, "createdAt")
VALUES ('non-classe', NOW())
ON CONFLICT (name) DO NOTHING;

-- Étape 2 : ajouter la colonne categoryId en NULLABLE d'abord
ALTER TABLE "Product" ADD COLUMN "categoryId" INTEGER;

-- Étape 3 : remplir les produits existants avec cette catégorie par défaut
UPDATE "Product"
SET "categoryId" = (SELECT id FROM "Category" WHERE name = 'non-classe')
WHERE "categoryId" IS NULL;

-- Étape 4 : rendre la colonne obligatoire
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;