# M&G Mensajeros — Sistema de Gestión Logística

Portal web de gestión logística para M&G Mensajeros y Racing Club.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js (JWT)
- Twilio WhatsApp API
- Vercel + Supabase (hosting recomendado)

## Portales
| Portal | Ruta | Rol |
|--------|------|-----|
| Admin | `/admin/dashboard` | admin |
| Punto de venta | `/pdv/mis-envios` | pdv |
| Transportista (PWA) | `/trans/envios` | transportista |
| Tracking público | `/t/[token]` | público |

## Setup rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus datos reales
```

### 3. Base de datos
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Correr en desarrollo
```bash
npm run dev
```

## Usuarios de prueba (seed)
| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@mgmensajeros.com | admin1234 | Admin |
| ventas@racingclub.com | ventas1234 | PDV |
| rmolina@mgmensajeros.com | trans1234 | Transportista |

## Comandos útiles
```bash
npm run db:migrate    # Aplicar migraciones
npm run db:seed       # Cargar datos iniciales
npm run db:studio     # Panel visual de la BD
npm run db:generate   # Regenerar cliente Prisma
```

## Deploy en Vercel + Supabase
1. Crear proyecto en [supabase.com](https://supabase.com) y copiar la `DATABASE_URL`
2. Correr `npx prisma migrate deploy` apuntando a Supabase
3. Correr `npx prisma db seed`
4. Importar el repo en [vercel.com](https://vercel.com) y agregar las variables de entorno
5. Deploy automático en cada push a `main`

## Estructura
```
src/
  app/
    (admin)/        Portal admin
    (pdv)/          Portal punto de venta
    (trans)/        Portal transportista PWA
    t/[token]/      Tracking público
    api/            REST API routes
  lib/
    prisma.ts       Cliente singleton
    auth.ts         Helper requireAuth
    whatsapp.ts     Integración Twilio
    numeroEnvio.ts  Generador ENV-XXXX
prisma/
  schema.prisma     Schema completo
  seed.ts           Datos iniciales
middleware.ts       Protección de rutas por rol
```
