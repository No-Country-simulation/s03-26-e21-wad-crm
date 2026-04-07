# Nexo CRM — Landing (Astro)

Marketing / landing estática. El botón **Login** enlaza al CRM (`PUBLIC_CRM_APP_URL` + `/login`).

## Requisitos

- Node.js **22.12+** (ver `package.json` → `engines`)
- [pnpm](https://pnpm.io/) (hay `pnpm-lock.yaml`)

## Desarrollo local

Copia variables (opcional; por defecto Login apunta a `http://localhost:5173/login`):

```bash
cp .env.example .env
```

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

Salida en `dist/`.

## Integración monorepo

- Carpeta: `landing/` en la raíz del repo.
- En producción, define `PUBLIC_SITE_URL` (esta web) y `PUBLIC_CRM_APP_URL` (app React) en el proveedor de hosting (p. ej. Render Static Site).
