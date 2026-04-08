-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'pdv', 'transportista');

-- CreateEnum
CREATE TYPE "EstadoEnvio" AS ENUM ('a_retirar', 'en_deposito', 'en_camino', 'entregado', 'observacion', 'cancelado');

-- CreateEnum
CREATE TYPE "CanalAlerta" AS ENUM ('whatsapp', 'sms');

-- CreateEnum
CREATE TYPE "EstadoMensaje" AS ENUM ('pendiente', 'enviado', 'fallido');

-- CreateEnum
CREATE TYPE "EventoAlerta" AS ENUM ('registrado', 'deposito', 'camino', 'entregado', 'manual');

-- CreateTable
CREATE TABLE "puntos_de_venta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "contacto" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puntos_de_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdv_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zonas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envios" (
    "id" TEXT NOT NULL,
    "numero_envio" TEXT NOT NULL,
    "estado" "EstadoEnvio" NOT NULL DEFAULT 'a_retirar',
    "pdv_id" TEXT NOT NULL,
    "zona_id" TEXT NOT NULL,
    "transportista_id" TEXT,
    "costo_envio" DECIMAL(10,2) NOT NULL,
    "comprador_nombre" TEXT NOT NULL,
    "comprador_apellido" TEXT NOT NULL,
    "comprador_dni" TEXT NOT NULL,
    "comprador_telefono" TEXT NOT NULL,
    "entrega_direccion" TEXT NOT NULL,
    "entrega_localidad" TEXT NOT NULL,
    "tracking_token" TEXT NOT NULL,
    "dni_verificado_at" TIMESTAMP(3),
    "entregado_at" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "envios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envio_historial" (
    "id" TEXT NOT NULL,
    "estado_anterior" "EstadoEnvio" NOT NULL,
    "estado_nuevo" "EstadoEnvio" NOT NULL,
    "nota" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envio_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "envio_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_enviadas" (
    "id" TEXT NOT NULL,
    "tipo" "EventoAlerta" NOT NULL,
    "canal" "CanalAlerta" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado_envio" "EstadoMensaje" NOT NULL DEFAULT 'pendiente',
    "sent_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "envio_id" TEXT NOT NULL,

    CONSTRAINT "alertas_enviadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_alertas" (
    "id" TEXT NOT NULL,
    "evento" "EventoAlerta" NOT NULL,
    "canal" "CanalAlerta" NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "envios_numero_envio_key" ON "envios"("numero_envio");

-- CreateIndex
CREATE UNIQUE INDEX "envios_tracking_token_key" ON "envios"("tracking_token");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_alertas_evento_canal_key" ON "plantillas_alertas"("evento", "canal");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_pdv_id_fkey" FOREIGN KEY ("pdv_id") REFERENCES "puntos_de_venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_pdv_id_fkey" FOREIGN KEY ("pdv_id") REFERENCES "puntos_de_venta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zonas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envios" ADD CONSTRAINT "envios_transportista_id_fkey" FOREIGN KEY ("transportista_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_historial" ADD CONSTRAINT "envio_historial_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "envio_historial" ADD CONSTRAINT "envio_historial_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_enviadas" ADD CONSTRAINT "alertas_enviadas_envio_id_fkey" FOREIGN KEY ("envio_id") REFERENCES "envios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
