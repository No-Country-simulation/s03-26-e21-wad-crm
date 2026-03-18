# Diseño Técnico: Auth & RBAC System

## Arquitectura General

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │   API Gateway   │     │  Auth Service   │
│   (Next.js)     │────▶│   (Node.js)     │────▶│   (Node.js)     │
│   NextAuth.js   │     │   Express.js    │     │   JWT Handler   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   - users       │
                                               │   - workspaces  │
                                               │   - sessions    │
                                               └─────────────────┘
```

---

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js 18+ |
| Framework | Express.js o Fastify |
| Auth | NextAuth.js (frontend), jsonwebtoken (backend) |
| OAuth | passport-google-oauth20 |
| Hashing | bcrypt |
| DB | PostgreSQL con node-postgres |
| Validation | Zod |

---

## Estructura de Proyecto

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Variables de entorno
│   ├── database/
│   │   ├── connection.ts       # Pool de conexiones
│   │   └── migrations/         # SQL migrations
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── strategies/
│   │   │   │   ├── local.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── jwt/
│   │   │       ├── token.service.ts
│   │   │       └── decorators.ts
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.routes.ts
│   │   ├── workspace/
│   │   │   ├── workspace.controller.ts
│   │   │   ├── workspace.service.ts
│   │   │   └── workspace.routes.ts
│   │   └── invitations/
│   │       ├── invitation.controller.ts
│   │       ├── invitation.service.ts
│   │       └── invitation.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # Verifica JWT
│   │   ├── workspace.middleware.ts # Añade workspace_id
│   │   └── rbac.middleware.ts    # Verifica permisos
│   ├── utils/
│   │   ├── errors.ts             # Custom errors
│   │   └── validators.ts        # Zod schemas
│   └── app.ts                   # Entry point
├── package.json
└── .env.example
```

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── settings/
│   │   └── api/
│   │       └── auth/[...nextauth]/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       ├── google-button.tsx
│   │       └── user-menu.tsx
│   ├── lib/
│   │   ├── auth.ts              # NextAuth config
│   │   ├── api.ts               # Axios instance
│   │   └── utils.ts
│   └── types/
│       └── auth.ts
```

---

## Flujo de Autenticación

### Login Email/Password

```
1. Frontend: POST /api/auth/login {email, password}
         │
         ▼
2. Auth Service: Buscar usuario por email
         │
         ▼
3. Auth Service: Comparar password con bcrypt.compare()
         │
         ▼
4. Auth Service: Generar access + refresh tokens
         │
         ▼
5. Auth Service: Guardar refresh token hash en DB
         │
         ▼
6. Backend: Set httpOnly cookie (access) + return refresh (body)
         │
         ▼
7. Frontend: Guardar tokens, redirect a dashboard
```

### Refresh Token

```
1. Frontend: POST /api/auth/refresh {refreshToken}
         │
         ▼
2. Auth Service: Hash refresh token, buscar en DB
         │
         ▼
3. Auth Service: Verificar no está revoked y no expired
         │
         ▼
4. Auth Service: Revocar old refresh, generar nuevo par
         │
         ▼
5. Auth Service: Guardar nuevo refresh token hash en DB
         │
         ▼
6. Backend: Return nuevos tokens
```

### Google OAuth

```
1. Frontend: Click "Continuar con Google"
         │
         ▼
2. NextAuth: Redirect a Google OAuth consent
         │
         ▼
3. Google: Return authorization code
         │
         ▼
4. NextAuth: Exchange code por tokens
         │
         ▼
5. NextAuth: Callback → POST /api/auth/google
         │
         ▼
6. Auth Service: Buscar/crear usuario, generar JWT
         │
         ▼
7. Frontend: Session establecida, redirect dashboard
```

---

## Middleware de Protección

### auth.middleware.ts

```typescript
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### workspace.middleware.ts

```typescript
export const workspaceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Workspace always comes from authenticated user's token
  req.workspaceId = req.user.workspaceId;
  next();
};
```

### rbac.middleware.ts

```typescript
export const rbacMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## Integración NextAuth + Backend

### next-auth config

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Call backend API
        const response = await fetch(`${process.env.API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        const data = await response.json()
        if (response.ok) {
          return { ...data.user, accessToken: data.accessToken }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.workspaceId = user.workspaceId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.workspaceId = token.workspaceId
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
}
```

---

## Variables de Entorno

```env
# Backend
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/crm

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## Consideraciones de Seguridad

1. **Token Storage**: Access token en httpOnly cookie (XSS safe). Refresh token en memoria o sessionStorage.

2. **Password Hashing**: bcrypt con salt rounds 10. Nunca guardar password plain.

3. **CSRF**: Tokens en cookies con `httpOnly` y `secure`. CSRF tokens para actions state-changing.

4. **Rate Limiting**: 
   - Login: 5 intentos por IP por minuto
   - Refresh: 10 por minuto
   - Registro: 3 por IP por hora

5. **Audit Logging**: Loguear todos los intentos de login (éxito y fail).

---

## Testing

### Unit Tests
- auth.service.ts - login, register, refresh, logout
- token.service.ts - generate, verify, rotate
- bcrypt functions

### Integration Tests
- POST /api/auth/login - credenciales válidas/inválidas
- POST /api/auth/refresh - token válido/inválido/expirado
- Google OAuth flow (con mock)

### E2E Tests
- Flujo completo registro → login → logout
- Flujo completo Google OAuth
- Verificación de permisos por rol
