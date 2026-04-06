# Startup CRM - Frontend

Frontend React para el CRM de startups con integración WhatsApp + Email.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API corriendo en puerto 8080

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

### Variables de Entorno

Crea un archivo `.env`:

```env
VITE_API_URL=http://localhost:8080
```

Si no existe `.env`, el frontend usa `http://localhost:8080` por defecto.

## Features

- **Dashboard** - Métricas y overview
- **Contacts** - Gestión de contactos
- **Tasks** - Gestión de tareas
- **Auth** - Login/Register con JWT

## Deploy

### Vercel

```bash
npm install -g vercel
vercel
```

Configurar variable de entorno `VITE_API_URL` con la URL del backend.
