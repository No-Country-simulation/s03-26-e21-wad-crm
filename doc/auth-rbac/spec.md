# Especificación: Auth & RBAC System

## Historias de Usuario

### HU-001: Registro de Usuario

**Como** usuario nuevo del CRM
**Quiero** crear una cuenta con mi email y contraseña
**Para** acceder al sistema y gestionar mis clientes

**Criterios de Aceptación:**
- [ ] El usuario debe poder registrarse con email válido
- [ ] La contraseña debe tener mínimo 8 caracteres
- [ ] El sistema debe validar que el email no esté en uso
- [ ] Al registrarse, se debe crear automáticamente un Workspace personal
- [ ] El usuario registrado tiene rol "Admin" por defecto
- [ ] Se debe enviar email de verificación (opcional para MVP)

---

### HU-002: Inicio de Sesión

**Como** usuario registrado
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder al dashboard del CRM

**Criterios de Aceptación:**
- [ ] El usuario puede iniciar sesión con email y contraseña
- [ ] Credenciales inválidas muestran mensaje de error genérico
- [ ] Login exitoso redirige al dashboard
- [ ] Se generan access token (15 min) y refresh token (7 días)
- [ ] Tokens se almacenan de forma segura (httpOnly cookie)

---

### HU-003: Inicio de Sesión con Google

**Como** usuario con cuenta Google
**Quiero** iniciar sesión con mi cuenta de Google
**Para** acceder rápidamente sin recordar otra contraseña

**Criterios de Aceptación:**
- [ ] Botón "Continuar con Google" visible en página de login
- [ ] Redirect a Google OAuth consent screen
- [ ] Si el email Google existe, se logsuea directamente
- [ ] Si el email no existe, se crea usuario automáticamente
- [ ] Se crea Workspace si es usuario nuevo
- [ ] Se asocian tokens JWT tras OAuth exitoso

---

### HU-004: Renovación de Token (Refresh)

**Como** usuario con sesión activa
**Quiero** que mi sesión no se cierre frecuentemente
**Para** trabajar sin interrupciones

**Criterios de Aceptación:**
- [ ] Cuando access token expira, se usa refresh token automáticamente
- [ ] Refresh genera nuevo par de tokens
- [ ] Refresh token se rota (old invalidated, new issued)
- [ ] Si refresh token es inválido/expirado, redirige a login
- [ ] El proceso es transparente para el usuario

---

### HU-005: Logout

**Como** usuario logueado
**Quiero** cerrar mi sesión
**Para** dejar el equipo seguro

**Criterios de Aceptación:**
- [ ] Botón "Cerrar Sesión" visible en header
- [ ] Click invalida refresh token en DB
- [ ] Limpia tokens del cliente
- [ ] Redirige a página de login
- [ ] No permite usar tokens antiguos tras logout

---

### HU-006: Gestión de Usuarios (Admin)

**Como** administrador del workspace
**Quiero** invitar y gestionar usuarios de mi equipo
**Para** permitir acceso controlado a otros miembros

**Criterios de Aceptación:**
- [ ] Admin puede ver lista de usuarios del workspace
- [ ] Admin puede invitar usuario por email
- [ ] Admin puede cambiar rol de usuario
- [ ] Admin puede desactivar usuario (soft delete)
- [ ] Usuario invitado recibe email con link de registro

---

### HU-007: Control de Acceso por Roles

**Como** usuario del sistema
**Quiero** que el sistema respete mi rol
**Para** tener la experiencia adecuada a mi función

**Criterios de Aceptación:**
- [ ] Rutas protegidas verifican rol del usuario
- [ ] UI muestra/oculta opciones según rol
- [ ] Endpoints API rechazan requests sin permiso
- [ ] Mensaje claro al intentar acceso no autorizado
- [ ] Permisos por módulo: Contacts, Deals, Conversations, Tasks, Analytics

---

### HU-008: Aislamiento por Workspace

**Como** usuario de un workspace
**Quiero** que mis datos no sean visibles para otros workspaces
**Para** mantener privacidad y seguridad

**Criterios de Aceptación:**
- [ ] Cada usuario pertenece a un workspace
- [ ] Queries de DB filtran por workspace_id
- [ ] JWT incluye workspace_id del usuario
- [ ] No hay forma de acceder a datos de otro workspace
- [ ] Admin puede cambiar workspace de un usuario

---

## Modelo de Datos

### Tabla: workspaces
```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  google_id VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: sessions (refresh tokens)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  refresh_token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);
```

### Tabla: user_invitations
```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'sales',
  invited_by UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Registro con email/password
- `POST /api/auth/login` - Login con credenciales
- `POST /api/auth/google` - Login/registro con Google
- `POST /api/auth/refresh` - Renovar tokens
- `POST /api/auth/logout` - Cerrar sesión

### Users (Admin)
- `GET /api/users` - Listar usuarios del workspace
- `POST /api/users/invite` - Invitar usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Desactivar usuario
- `POST /api/users/invitations/:token/accept` - Aceptar invitación

---

## Requisitos No Funcionales

### Seguridad
- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con algoritmo HS256
- HTTPS obligatorio en producción
- Rate limiting en endpoints de auth
- Input sanitization para inyección SQL

### Rendimiento
- Login < 500ms
- Refresh token < 200ms
- Queries de auth indexadas por email, google_id

### Disponibilidad
- Graceful degradation si auth service cae
- Sesiones survive a restart de servidor (stateless JWT)

---

## Consideraciones de Diseño

1. **JWT Strategy**: Access tokens cortos (15 min) para minimizar window de ataque. Refresh tokens largos pero con rotation.

2. **Google OAuth**: Usar flujo "Authorization Code" no "Implicit" para mayor seguridad.

3. **Workspace First**: Todo dato en el CRM está asociado a un workspace. No existe "dato global".

4. **Soft Delete**: Usuarios nunca se borran realmente, se marcan is_active=false.

5. **Passwordless Future**: Considerar eventualmente passwordless con magic links.
