/*
  Warnings:

  - Changed the type of `category` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('NORMAL', 'LOW', 'CRITICAL', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockStatus" "StockStatus" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL;
