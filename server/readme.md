## MVP Status

Estado actual del proyecto: en desarrollo MVP. Las bases del CRM están implementadas y funcionan localmente; hay despliegues en Render para Landing, Frontend y Backend API.

- Módulos cubiertos en el MVP: Auth, Contactos, Deals, Tareas, WhatsApp, Email, Analytics y Settings
- Email soporta SMTP y Gmail OAuth; integración básica de Gmail desde el backend está disponible para el frontend
- Observaciones: migraciones DB duplicadas (V12) identificadas y separadas; se recomienda alinear migraciones en entorno de desarrollo y Render
- Pruebas: falta cobertura de E2E y pruebas unitarias completas; plan de tests en CI

## CI/CD

Objetivo: automatizar builds, tests y despliegues a Render. Propuesta de pipeline con GitHub Actions.

- Flujo: al hacer push a dev o main se ejecutan build de backend (Maven) y frontend (Node), se ejecutan tests, se despliega a Render; PRs ejecutan checks ligeros (lint/compile)
- Variables de entorno deben estar configuradas en Render y/o GitHub Actions (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, Google client ids, etc.)
- Ejemplo de pipeline en .github/workflows/ci-cd.yml (adjunto a la versión real del repo):
```yaml
name: CI/CD
on:
  push:
    branches: [dev, main]
  pull_request:
    branches: [dev, main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build backend
        run: mvn -q -DskipTests package

  build-frontend:
    runs-on: ubuntu-latest
    needs: build-backend
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install frontend deps
        working-directory: frontend
        run: pnpm install
      - name: Build frontend
        working-directory: frontend
        run: pnpm run build
```

Notas:
- Render es la plataforma de deployment; ajusta credenciales y URLs en el panel de Render.
- Mantener este Readme sincronizado con el pipeline real (dev/prod).

---
