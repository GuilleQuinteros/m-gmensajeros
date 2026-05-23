-- CreateTable
CREATE TABLE "partido_zona" (
    "id" TEXT NOT NULL,
    "partido" TEXT NOT NULL,
    "zona_id" TEXT NOT NULL,

    CONSTRAINT "partido_zona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partido_zona_partido_key" ON "partido_zona"("partido");

-- AddForeignKey
ALTER TABLE "partido_zona" ADD CONSTRAINT "partido_zona_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zonas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
