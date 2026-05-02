# M&G Mensajeros — API de Integración v1

## Autenticación

Todas las requests requieren el header:
```
Authorization: Bearer mgm_TU_API_KEY
```

## Endpoints

### GET /api/v1/zonas
Obtiene las zonas de envío disponibles.

**Respuesta:**
```json
{
  "zonas": [
    { "id": "caba-24", "nombre": "CABA 24hs", "slaHoras": 24, "costo": 3500, "descripcion": "Entrega en 24hs" },
    { "id": "caba-96", "nombre": "CABA 96hs", "slaHoras": 96, "costo": 3000, "descripcion": "Entrega en 96hs" },
    { "id": "provincia", "nombre": "Provincia", "slaHoras": 24, "costo": 4500, "descripcion": "Entrega en 24hs" }
  ]
}
```

### POST /api/v1/envios
Registra un nuevo envío.

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Perez",
  "dni": "28441220",
  "telefono": "1145238812",
  "email": "juan@email.com",
  "direccion": "Av. Rivadavia 1234 P3",
  "localidad": "CABA",
  "zonaId": "caba-24",
  "observaciones": "Dejar con portero",
  "pedidoExterno": "E3-00123"
}
```

**Respuesta 201:**
```json
{
  "ok": true,
  "numeroEnvio": "ENV-0042",
  "trackingUrl": "https://mgmensajeros.com/t/uuid",
  "seguimientoUrl": "https://mgmensajeros.com/seguimiento",
  "zona": { "id": "caba-24", "nombre": "CABA 24hs", "slaHoras": 24 },
  "costoEnvio": 3500,
  "pdv": "Racing Club Avellaneda"
}
```

### GET /api/v1/envios/{numeroEnvio}
Consulta el estado de un envío.

**Ejemplo:** `GET /api/v1/envios/ENV-0042`

**Respuesta:**
```json
{
  "numeroEnvio": "ENV-0042",
  "estado": "en_camino",
  "estadoDescripcion": "En camino",
  "trackingUrl": "https://mgmensajeros.com/t/uuid",
  "zona": "CABA 24hs",
  "entregadoAt": null,
  "createdAt": "2025-05-01T10:00:00Z"
}
```

## Errores comunes

| Código | Descripción |
|--------|-------------|
| 401 | API key faltante o inválida |
| 400 | Datos del body incorrectos |
| 404 | Zona o envío no encontrado |
| 500 | Error interno |

## Ejemplo en JavaScript (para E3)

```javascript
// 1. Obtener zonas al cargar el checkout
const { zonas } = await fetch("https://mgmensajeros.com/api/v1/zonas", {
  headers: { "Authorization": "Bearer mgm_TU_API_KEY" }
}).then(r => r.json());

// 2. Registrar envío al confirmar compra
const envio = await fetch("https://mgmensajeros.com/api/v1/envios", {
  method: "POST",
  headers: {
    "Authorization": "Bearer mgm_TU_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    nombre: order.customer.firstName,
    apellido: order.customer.lastName,
    dni: order.customer.dni,
    telefono: order.customer.phone,
    email: order.customer.email,
    direccion: order.shipping.address,
    localidad: order.shipping.city,
    zonaId: selectedZonaId,
    pedidoExterno: order.id
  })
}).then(r => r.json());

// envio.numeroEnvio y envio.trackingUrl para mostrar al comprador
```