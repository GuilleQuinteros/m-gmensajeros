# M&G Mensajeros — API de Integración v1

Base URL: `https://www.mgmensajeros.com.ar`

## Autenticación

Todas las requests requieren el header:
```
Authorization: Bearer mgm_TU_API_KEY
```

Para obtener una API key contactar a M&G Mensajeros.

## Endpoints

### GET /api/v1/zonas
Obtiene las zonas de envío disponibles con sus costos y tiempos.

**Request:**
```
GET https://www.mgmensajeros.com.ar/api/v1/zonas
Authorization: Bearer mgm_TU_API_KEY
```

**Respuesta 200:**
```json
{
  "zonas": [
    {
      "id": "uuid-de-la-zona",
      "nombre": "CABA 24hs",
      "slaHoras": 24,
      "costo": 3500,
      "descripcion": "Entrega en 24hs"
    },
    {
      "id": "uuid-de-la-zona",
      "nombre": "CABA 96hs",
      "slaHoras": 96,
      "costo": 3000,
      "descripcion": "Entrega en 96hs"
    },
    {
      "id": "uuid-de-la-zona",
      "nombre": "Provincia",
      "slaHoras": 24,
      "costo": 4500,
      "descripcion": "Entrega en 24hs"
    }
  ]
}
```

---

### POST /api/v1/envios
Registra un nuevo envío. El comprador recibirá un email con el número de seguimiento.

**Request:**
```
POST https://www.mgmensajeros.com.ar/api/v1/envios
Authorization: Bearer mgm_TU_API_KEY
Content-Type: application/json
```

**Body — campos requeridos:**
```json
{
  "nombre": "Romina",
  "apellido": "Ventura",
  "dni": "29044192",
  "telefono": "1136305740",
  "email": "rorrina@hotmail.com",
  "direccion": "Velez Sarsfield 2520",
  "localidad": "Lanus",
  "zonaId": "uuid-obtenido-de-GET-zonas"
}
```

**Body — campos opcionales:**
```json
{
  "piso": "3 B",
  "partido": "Lanus",
  "provincia": "Buenos Aires",
  "codigoPostal": "1824",
  "entreCalles": "Rico y Ramos",
  "observaciones": "Autorizar retiro: Ezequiel Bovetti DNI 26894397",
  "pedidoExterno": "392522"
}
```

**Respuesta 201:**
```json
{
  "ok": true,
  "numeroEnvio": "ENV-0042",
  "trackingUrl": "https://www.mgmensajeros.com.ar/t/uuid-token",
  "seguimientoUrl": "https://www.mgmensajeros.com.ar/seguimiento",
  "zona": {
    "id": "uuid-zona",
    "nombre": "CABA 24hs",
    "slaHoras": 24
  },
  "costoEnvio": 3500,
  "pdv": "Racing Club Avellaneda"
}
```

---

### GET /api/v1/envios/{numeroEnvio}
Consulta el estado actual de un envío.

**Request:**
```
GET https://www.mgmensajeros.com.ar/api/v1/envios/ENV-0042
Authorization: Bearer mgm_TU_API_KEY
```

**Respuesta 200:**
```json
{
  "numeroEnvio": "ENV-0042",
  "estado": "en_camino",
  "estadoDescripcion": "En camino",
  "trackingUrl": "https://www.mgmensajeros.com.ar/t/uuid-token",
  "zona": "CABA 24hs",
  "entregadoAt": null,
  "createdAt": "2026-05-09T18:04:26Z"
}
```

---

## Estados posibles

| Estado | Descripción |
|--------|-------------|
| `a_retirar` | Pendiente de retiro en el PDV |
| `en_deposito` | Recibido en depósito de M&G |
| `en_camino` | En camino al domicilio |
| `entregado` | Entregado con DNI verificado |
| `observacion` | Sin respuesta / ausente |
| `cancelado` | Cancelado |

---

## Errores

| Código | Descripción |
|--------|-------------|
| 401 | API key faltante o inválida |
| 400 | Datos del body incorrectos — ver campo `detalle` |
| 404 | Zona o envío no encontrado |
| 429 | Demasiadas requests — esperar e intentar de nuevo |
| 500 | Error interno |

---

## Notificaciones automáticas al comprador

El sistema envía emails automáticos al comprador en dos momentos:

- Cuando el pedido **llega al depósito** — incluye número de envío y link de tracking
- Cuando el pedido **sale a domicilio** — incluye dirección y link de seguimiento en tiempo real

Para recibir las notificaciones el campo `email` debe estar presente en el POST.

---

## Seguimiento público

El comprador puede consultar el estado de su envío sin login en:

```
https://www.mgmensajeros.com.ar/seguimiento
```

Ingresando el número de envío formato `ENV-0042`.

---

## Ejemplo de integración en JavaScript

```javascript
const API_BASE = "https://www.mgmensajeros.com.ar";
const API_KEY = "mgm_TU_API_KEY";

// 1. Obtener zonas para mostrar selector en el checkout
async function obtenerZonas() {
  const res = await fetch(`${API_BASE}/api/v1/zonas`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  const { zonas } = await res.json();
  return zonas;
}

// 2. Registrar envío al confirmar la compra
async function registrarEnvio(pedido, zonaId) {
  const res = await fetch(`${API_BASE}/api/v1/envios`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre: pedido.comprador.nombre,
      apellido: pedido.comprador.apellido,
      dni: pedido.comprador.dni,
      telefono: pedido.comprador.telefono,
      email: pedido.comprador.email,
      direccion: pedido.envio.calle + " " + pedido.envio.numero,
      piso: pedido.envio.piso,
      localidad: pedido.envio.localidad,
      partido: pedido.envio.partido,
      provincia: pedido.envio.provincia,
      codigoPostal: pedido.envio.cp,
      observaciones: pedido.obs,
      zonaId: zonaId,
      pedidoExterno: String(pedido.operacionId)
    })
  });
  return await res.json();
  // Guardar envio.numeroEnvio y envio.trackingUrl para mostrar al comprador
}

// 3. Consultar estado (opcional)
async function consultarEstado(numeroEnvio) {
  const res = await fetch(`${API_BASE}/api/v1/envios/${numeroEnvio}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` }
  });
  return await res.json();
}
```

---

## Contacto técnico

Para soporte de integración o solicitar una API key:
**M&G Mensajeros** — Buenos Aires, Argentina