# HU-001: Registro de Usuario

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario nuevo del CRM  
**Quiero**: crear una cuenta con mi email y contraseña  
**Para**: acceder al sistema y gestionar mis clientes

## Criterios de Aceptación

- [ ] El usuario debe poder registrarse con email válido
- [ ] La contraseña debe tener mínimo 8 caracteres
- [ ] El sistema debe validar que el email no esté en uso
- [ ] Al registrarse, se debe crear automáticamente un Workspace personal
- [ ] El usuario registrado tiene rol "Admin" por defecto
- [ ] Se debe enviar email de verificación (opcional para MVP)

## Criterios de Negocio

- Un email solo puede pertenecer a un workspace
- El primer usuario de un workspace es Admin por defecto

---

# HU-002: Inicio de Sesión

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario registrado  
**Quiero**: iniciar sesión con mi email y contraseña  
**Para**: acceder al dashboard del CRM

## Criterios de Aceptación

- [ ] El usuario puede iniciar sesión con email y contraseña
- [ ] Credenciales inválidas muestran mensaje de error genérico
- [ ] Login exitoso redirige al dashboard
- [ ] Se generan access token (15 min) y refresh token (7 días)
- [ ] Tokens se almacenan de forma segura (httpOnly cookie)

---

# HU-003: Inicio de Sesión con Google

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario con cuenta Google  
**Quiero**: iniciar sesión con mi cuenta de Google  
**Para**: acceder rápidamente sin recordar otra contraseña

## Criterios de Aceptación

- [ ] Botón "Continuar con Google" visible en página de login
- [ ] Redirect a Google OAuth consent screen
- [ ] Si el email Google existe, se logsuea directamente
- [ ] Si el email no existe, se crea usuario automáticamente
- [ ] Se crea Workspace si es usuario nuevo
- [ ] Se asocian tokens JWT tras OAuth exitoso

---

# HU-004: Renovación de Token (Refresh)

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario con sesión activa  
**Quiero**: que mi sesión no se cierre frecuentemente  
**Para**: trabajar sin interrupciones

## Criterios de Aceptación

- [ ] Cuando access token expira, se usa refresh token automáticamente
- [ ] Refresh genera nuevo par de tokens
- [ ] Refresh token se rota (old invalidated, new issued)
- [ ] Si refresh token es inválido/expirado, redirige a login
- [ ] El proceso es transparente para el usuario

---

# HU-005: Logout

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario logueado  
**Quiero**: cerrar mi sesión  
**Para**: dejar el equipo seguro

## Criterios de Aceptación

- [ ] Botón "Cerrar Sesión" visible en header
- [ ] Click invalida refresh token en DB
- [ ] Limpia tokens del cliente
- [ ] Redirige a página de login
- [ ] No permite usar tokens antiguos tras logout

---

# HU-006: Gestión de Usuarios (Admin)

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: administrador del workspace  
**Quiero**: invitar y gestionar usuarios de mi equipo  
**Para**: permitir acceso controlado a otros miembros

## Criterios de Aceptación

- [ ] Admin puede ver lista de usuarios del workspace
- [ ] Admin puede invitar usuario por email
- [ ] Admin puede cambiar rol de usuario
- [ ] Admin puede desactivar usuario (soft delete)
- [ ] Usuario invitado recibe email con link de registro

---

# HU-007: Control de Acceso por Roles

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario del sistema  
**Quiero**: que el sistema respete mi rol  
**Para**: tener la experiencia adecuada a mi función

## Criterios de Aceptación

- [ ] Rutas protegidas verifican rol del usuario
- [ ] UI muestra/oculta opciones según rol
- [ ] Endpoints API rechazan requests sin permiso
- [ ] Mensaje claro al intentar acceso no autorizado
- [ ] Permisos por módulo: Contacts, Deals, Conversations, Tasks, Analytics

---

# HU-008: Aislamiento por Workspace

**Módulo**: Auth  
**Prioridad**: Alta  
**Como**: usuario de un workspace  
**Quiero**: que mis datos no sean visibles para otros workspaces  
**Para**: mantener privacidad y seguridad

## Criterios de Aceptación

- [ ] Cada usuario pertenece a un workspace
- [ ] Queries de DB filtran por workspace_id
- [ ] JWT incluye workspace_id del usuario
- [ ] No hay forma de acceder a datos de otro workspace
- [ ] Admin puede cambiar workspace de un usuario
