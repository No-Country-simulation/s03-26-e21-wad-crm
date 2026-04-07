# s03-26-e21-wad-crm

CRM academico para gestion de clientes, contactos, tareas y pipeline comercial con integracion de canales (email/WhatsApp).

## Modo demo (5 minutos)

### 1) Requisitos

- Docker Desktop (para PostgreSQL y Redis)
- Java 17
- Node.js 18+

### 2) Levantar infraestructura

Desde la raiz del proyecto:

```bash
docker compose up -d postgres redis
```

### 3) Levantar backend

En la carpeta `server`:

```bash
./mvnw spring-boot:run
```

Backend disponible en:
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

### 4) Levantar frontend

En la carpeta `frontend`:

```bash
npm install
npm run dev
```

Frontend disponible en:
- App: `http://localhost:5173`

### 5) Landing (marketing, Astro)

En la carpeta `landing` (Node 22+ y [pnpm](https://pnpm.io/)):

```bash
cd landing
pnpm install
pnpm dev
```

Por defecto el botón **Login** apunta a `http://localhost:5173/login`. Opcional: copia `landing/.env.example` a `landing/.env` y ajusta `PUBLIC_CRM_APP_URL` / `PUBLIC_SITE_URL`.

## Variables de entorno para demo

En `frontend/.env` (opcional):

```env
VITE_API_URL=http://localhost:8080
```

Si no se define, el frontend ya usa `http://localhost:8080` por defecto.

## Flujo sugerido para presentacion (10 min)

1. Login y vista general de dashboard.
2. Alta/edicion de contacto.
3. Creacion de tarea vinculada a contacto.
4. Actualizacion de estado en pipeline/deals.
5. Cierre con reportes/analytics y configuraciones.

## Checklist rapido antes de exponer

- Docker arriba (`postgres` y `redis` healthy).
- Backend en `http://localhost:8080`.
- Frontend en `http://localhost:5173`.
- Swagger responde correctamente.
- Datos de prueba cargados para evitar tiempos muertos.
