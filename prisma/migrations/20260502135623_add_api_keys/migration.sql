-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "cliente_id" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
