/*
  Warnings:

  - You are about to drop the column `grupo` on the `zonas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[remito_numero]` on the table `envios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "envios" ADD COLUMN     "remito_numero" TEXT;

-- AlterTable
ALTER TABLE "zonas" DROP COLUMN "grupo",
ADD COLUMN     "sla_horas" INTEGER NOT NULL DEFAULT 24;

-- CreateTable
CREATE TABLE "zona_transportista" (
    "id" TEXT NOT NULL,
    "zona_id" TEXT NOT NULL,
    "transportista_id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zona_transportista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zona_transportista_zona_id_transportista_id_key" ON "zona_transportista"("zona_id", "transportista_id");

-- CreateIndex
CREATE UNIQUE INDEX "envios_remito_numero_key" ON "envios"("remito_numero");

-- AddForeignKey
ALTER TABLE "zona_transportista" ADD CONSTRAINT "zona_transportista_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zonas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_transportista" ADD CONSTRAINT "zona_transportista_transportista_id_fkey" FOREIGN KEY ("transportista_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
