# Documento de Requisitos: CRM Backend

## Introducción

Backend del CRM inteligente para startups construido con Java 17 + Spring Boot 3.3 + PostgreSQL.
Expone una API REST con autenticación JWT, WebSockets STOMP para tiempo real, integración con
WhatsApp Cloud API (Meta) y email (SMTP/Brevo), y soporte multi-workspace con aislamiento completo
por `workspace_id`. Este documento cubre los requisitos MVP priorizados.

---

## Glosario

- **System**: El backend Spring Boot del CRM (startup-crm)
- **AuthService**: Componente responsable de autenticación y emisión de tokens
- **JwtService**: Componente responsable de generar y validar tokens JWT
- **WorkspaceFilter**: Filtro que inyecta el `workspace_id` en el contexto de cada request
- **ContactService**: Componente responsable de la gestión de contactos
- **DealService**: Componente responsable de la gestión de oportunidades de venta
- **ConversationService**: Componente responsable de conversaciones y mensajes
- **WhatsAppProvider**: Interfaz de integración con Meta Cloud API
- **EmailService**: Componente responsable del envío y recepción de emails
- **TaskService**: Componente responsable de la gestión de tareas
- **AnalyticsService**: Componente responsable de cálculo de métricas y KPIs
- **SettingsService**: Componente responsable de configuración del workspace
- **Workspace**: Unidad de aislamiento de datos; cada empresa tiene su propio workspace
- **Usuario**: Persona autenticada con rol ADMIN, MANAGER o SALES
- **Contacto**: Registro de lead o cliente dentro de un workspace
- **Deal**: Oportunidad de venta asociada a un contacto
- **Pipeline**: Conjunto ordenado de etapas por las que avanza un Deal
- **Conversación**: Hilo de mensajes entre el CRM y un contacto por un canal específico
- **Tarea**: Actividad pendiente asociada a un contacto o deal
- **Tag**: Etiqueta de clasificación asignada a contactos
- **Access_Token**: JWT de corta duración (15 min) para autenticar requests
- **Refresh_Token**: Token de larga duración (7 días) para renovar el Access_Token

---

## Requisitos


### Requisito 1: Registro de Usuario (HU-001)

**Historia de Usuario:** Como usuario nuevo del CRM, quiero crear una cuenta con mi email y contraseña, para acceder al sistema y gestionar mis clientes.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/auth/register` es recibido con email y contraseña válidos, THE AuthService SHALL crear un nuevo usuario con rol ADMIN, crear un Workspace personal asociado, y retornar HTTP 201 con los tokens de acceso.
2. WHEN el email proporcionado ya existe en la base de datos, THE AuthService SHALL retornar HTTP 409 con un mensaje de error indicando que el email ya está en uso.
3. IF la contraseña tiene menos de 8 caracteres, THEN THE AuthService SHALL retornar HTTP 400 con un mensaje de validación descriptivo.
4. IF el formato del email es inválido, THEN THE AuthService SHALL retornar HTTP 400 con un mensaje de validación descriptivo.
5. THE AuthService SHALL almacenar la contraseña como hash bcrypt, nunca en texto plano.
6. WHEN un usuario es creado exitosamente, THE System SHALL asignar automáticamente el rol ADMIN al primer usuario del Workspace.

---

### Requisito 2: Inicio de Sesión (HU-002)

**Historia de Usuario:** Como usuario registrado, quiero iniciar sesión con mi email y contraseña, para acceder al dashboard del CRM.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/auth/login` es recibido con credenciales válidas, THE AuthService SHALL retornar HTTP 200 con un Access_Token (expiración 15 min) y un Refresh_Token (expiración 7 días).
2. WHEN las credenciales son inválidas, THE AuthService SHALL retornar HTTP 401 con un mensaje de error genérico sin revelar si el email o la contraseña son incorrectos.
3. THE JwtService SHALL incluir en el Access_Token los claims: `sub` (userId), `workspaceId`, `role`, `iat`, `exp`.
4. THE AuthService SHALL almacenar el hash del Refresh_Token en la base de datos vinculado al usuario.
5. FOR ALL pares de tokens emitidos, el Access_Token SHALL expirar antes que el Refresh_Token.

---

### Requisito 3: Inicio de Sesión con Google OAuth (HU-003)

**Historia de Usuario:** Como usuario con cuenta Google, quiero iniciar sesión con mi cuenta de Google, para acceder rápidamente sin recordar otra contraseña.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/auth/google` es recibido con un token de Google válido, THE AuthService SHALL verificar el token con Google, obtener el email del usuario, y retornar HTTP 200 con Access_Token y Refresh_Token.
2. WHEN el email de Google no existe en el sistema, THE AuthService SHALL crear automáticamente un nuevo usuario y un Workspace personal, luego retornar HTTP 201 con los tokens.
3. WHEN el email de Google ya existe en el sistema, THE AuthService SHALL autenticar al usuario existente y retornar HTTP 200 con nuevos tokens.
4. IF el token de Google es inválido o expirado, THEN THE AuthService SHALL retornar HTTP 401 con mensaje de error descriptivo.

---

### Requisito 4: Renovación de Token (HU-004)

**Historia de Usuario:** Como usuario con sesión activa, quiero que mi sesión no se cierre frecuentemente, para trabajar sin interrupciones.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/auth/refresh` es recibido con un Refresh_Token válido, THE AuthService SHALL emitir un nuevo Access_Token y un nuevo Refresh_Token, e invalidar el Refresh_Token anterior.
2. IF el Refresh_Token es inválido, expirado o fue revocado, THEN THE AuthService SHALL retornar HTTP 401.
3. THE AuthService SHALL rotar el Refresh_Token en cada renovación (el token anterior queda inválido).
4. FOR ALL renovaciones exitosas, el nuevo Access_Token SHALL contener los mismos claims de workspaceId y role que el token anterior.

---

### Requisito 5: Logout (HU-005)

**Historia de Usuario:** Como usuario logueado, quiero cerrar mi sesión, para dejar el equipo seguro.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/auth/logout` es recibido con un Access_Token válido, THE AuthService SHALL revocar el Refresh_Token asociado al usuario en la base de datos y retornar HTTP 204.
2. WHEN un Refresh_Token revocado es usado en `/api/auth/refresh`, THE AuthService SHALL retornar HTTP 401.
3. THE System SHALL rechazar cualquier request autenticado con tokens emitidos antes del logout si el Refresh_Token fue revocado.

---

### Requisito 6: Gestión de Usuarios por Admin (HU-006)

**Historia de Usuario:** Como administrador del workspace, quiero invitar y gestionar usuarios de mi equipo, para permitir acceso controlado a otros miembros.

#### Criterios de Aceptación

1. WHEN un ADMIN hace GET a `/api/users`, THE System SHALL retornar la lista de usuarios activos del mismo Workspace con HTTP 200.
2. WHEN un ADMIN hace POST a `/api/users/invite` con un email válido, THE System SHALL crear una invitación pendiente y retornar HTTP 201.
3. WHEN un ADMIN hace PATCH a `/api/users/{id}` con un nuevo rol, THE System SHALL actualizar el rol del usuario y retornar HTTP 200.
4. WHEN un ADMIN hace DELETE a `/api/users/{id}`, THE System SHALL desactivar el usuario (soft delete) y retornar HTTP 204.
5. IF un usuario no ADMIN intenta acceder a `/api/users`, THEN THE System SHALL retornar HTTP 403.
6. THE System SHALL garantizar que siempre exista al menos un usuario con rol ADMIN por Workspace.

---

### Requisito 7: Control de Acceso por Roles (HU-007)

**Historia de Usuario:** Como usuario del sistema, quiero que el sistema respete mi rol, para tener la experiencia adecuada a mi función.

#### Criterios de Aceptación

1. THE WorkspaceFilter SHALL extraer el `workspaceId` y `role` del Access_Token en cada request autenticado.
2. WHEN un usuario con rol SALES intenta acceder a un endpoint restringido a ADMIN o MANAGER, THE System SHALL retornar HTTP 403.
3. WHEN un request llega sin Access_Token a un endpoint protegido, THE System SHALL retornar HTTP 401.
4. WHEN un Access_Token expirado es usado, THE System SHALL retornar HTTP 401 con mensaje indicando expiración.
5. THE System SHALL aplicar las siguientes restricciones de rol: ADMIN tiene acceso total; MANAGER tiene acceso a analytics, deals y gestión de contactos; SALES tiene acceso a contactos, deals propios, tareas y conversaciones.

---

### Requisito 8: Aislamiento por Workspace (HU-008)

**Historia de Usuario:** Como usuario de un workspace, quiero que mis datos no sean visibles para otros workspaces, para mantener privacidad y seguridad.

#### Criterios de Aceptación

1. THE WorkspaceFilter SHALL inyectar el `workspace_id` del token JWT en el contexto de cada request antes de llegar al controlador.
2. WHILE un usuario está autenticado, THE System SHALL filtrar todas las queries de base de datos por el `workspace_id` del usuario autenticado.
3. IF un usuario intenta acceder a un recurso de otro Workspace por ID, THEN THE System SHALL retornar HTTP 404 (no revelar existencia del recurso).
4. FOR ALL entidades del sistema (Contacto, Deal, Tarea, Conversación), cada entidad SHALL pertenecer a exactamente un Workspace.
5. THE System SHALL garantizar que ningún endpoint retorne datos de un Workspace diferente al del usuario autenticado.


---

### Requisito 9: Crear Contacto (HU-010)

**Historia de Usuario:** Como vendedor, quiero agregar un nuevo contacto manualmente, para registrar un lead o cliente potencial.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/contacts` es recibido con nombre y email válidos, THE ContactService SHALL crear el contacto con estado inicial `NEW`, registrar el usuario creador y la fecha, y retornar HTTP 201 con el contacto creado.
2. WHEN el email del contacto ya existe dentro del mismo Workspace, THE ContactService SHALL retornar HTTP 409.
3. IF el campo nombre está vacío, THEN THE ContactService SHALL retornar HTTP 400 con mensaje de validación.
4. THE ContactService SHALL aceptar los campos opcionales: teléfono, empresa, cargo (jobTitle).
5. FOR ALL contactos creados, el campo `workspaceId` SHALL coincidir con el Workspace del usuario autenticado.

---

### Requisito 10: Editar Contacto (HU-012)

**Historia de Usuario:** Como vendedor, quiero editar la información de un contacto, para mantener los datos actualizados.

#### Criterios de Aceptación

1. WHEN un request PATCH a `/api/contacts/{id}` es recibido con datos válidos, THE ContactService SHALL actualizar los campos proporcionados y retornar HTTP 200 con el contacto actualizado.
2. WHEN el nuevo email ya pertenece a otro contacto del mismo Workspace, THE ContactService SHALL retornar HTTP 409.
3. IF el contacto no existe o pertenece a otro Workspace, THEN THE ContactService SHALL retornar HTTP 404.
4. THE ContactService SHALL actualizar el campo `updatedAt` automáticamente en cada modificación.

---

### Requisito 11: Buscar Contactos (HU-014)

**Historia de Usuario:** Como usuario, quiero buscar un contacto por nombre, email o teléfono, para encontrar rápidamente un registro.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/contacts?search={query}` es recibido con al menos 2 caracteres, THE ContactService SHALL retornar los contactos cuyo nombre, email, teléfono o empresa contengan el texto buscado (case-insensitive).
2. WHEN la búsqueda no produce resultados, THE ContactService SHALL retornar HTTP 200 con lista vacía.
3. THE ContactService SHALL soportar paginación mediante parámetros `page` y `size` en todos los listados.
4. FOR ALL búsquedas, los resultados SHALL pertenecer únicamente al Workspace del usuario autenticado.

---

### Requisito 12: Filtrar Contactos (HU-015)

**Historia de Usuario:** Como vendedor, quiero filtrar contactos por su estado en el funnel, para enfocarme en mis leads activos.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/contacts?status={status}` es recibido, THE ContactService SHALL retornar solo los contactos con el estado especificado del Workspace actual.
2. THE ContactService SHALL soportar filtros combinados por: `status` (NEW, CONTACTED, QUALIFIED, LOST, CONVERTED), `tagIds` (múltiples), `assignedTo` (userId).
3. WHEN múltiples filtros son aplicados simultáneamente, THE ContactService SHALL aplicarlos con lógica AND.
4. THE ContactService SHALL soportar ordenamiento por `createdAt`, `name` y `updatedAt` mediante parámetro `sort`.

---

### Requisito 13: Ver Detalle de Contacto (HU-019)

**Historia de Usuario:** Como usuario, quiero ver toda la información de un contacto, para entender el historial y contexto.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/contacts/{id}` es recibido, THE ContactService SHALL retornar el contacto con sus datos básicos, tags, empresa asociada y usuario asignado.
2. WHEN un request GET a `/api/contacts/{id}/notes` es recibido, THE ContactService SHALL retornar las notas del contacto ordenadas por fecha descendente.
3. IF el contacto no existe o pertenece a otro Workspace, THEN THE ContactService SHALL retornar HTTP 404.
4. THE ContactService SHALL incluir en el detalle los campos: id, name, email, phone, jobTitle, status, company, assignedTo, tags, createdAt, updatedAt.


---

### Requisito 14: Crear Deal (HU-030)

**Historia de Usuario:** Como vendedor, quiero crear una oportunidad de venta, para hacer seguimiento de un negocio potencial.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/deals` es recibido con nombre, contacto y etapa válidos, THE DealService SHALL crear el deal, registrar el usuario creador y la fecha, y retornar HTTP 201 con el deal creado.
2. IF el campo nombre está vacío o el contacto no existe en el Workspace, THEN THE DealService SHALL retornar HTTP 400 con mensaje de validación descriptivo.
3. WHEN el campo `value` es proporcionado, THE DealService SHALL validar que sea un número mayor o igual a cero.
4. THE DealService SHALL asignar el deal a la etapa especificada; si no se especifica etapa, SHALL asignar la primera etapa del pipeline del Workspace.
5. FOR ALL deals creados, el campo `workspaceId` SHALL coincidir con el Workspace del usuario autenticado.

---

### Requisito 15: Mover Deal entre Etapas (HU-031)

**Historia de Usuario:** Como vendedor, quiero mover un deal a otra etapa, para actualizar el estado del negocio.

#### Criterios de Aceptación

1. WHEN un request PATCH a `/api/deals/{id}/stage` es recibido con un `stageId` válido, THE DealService SHALL actualizar la etapa del deal, registrar la fecha y el usuario que realizó el cambio, y retornar HTTP 200.
2. IF el `stageId` no pertenece al pipeline del mismo Workspace, THEN THE DealService SHALL retornar HTTP 400.
3. IF el deal no existe o pertenece a otro Workspace, THEN THE DealService SHALL retornar HTTP 404.
4. THE DealService SHALL registrar en el historial del deal cada cambio de etapa con: etapa anterior, etapa nueva, usuario, timestamp.

---

### Requisito 16: Editar Deal (HU-032)

**Historia de Usuario:** Como vendedor, quiero editar los datos de un deal, para actualizar información del negocio.

#### Criterios de Aceptación

1. WHEN un request PATCH a `/api/deals/{id}` es recibido con datos válidos, THE DealService SHALL actualizar los campos proporcionados y retornar HTTP 200 con el deal actualizado.
2. IF el campo `value` es negativo, THEN THE DealService SHALL retornar HTTP 400.
3. IF el deal no existe o pertenece a otro Workspace, THEN THE DealService SHALL retornar HTTP 404.
4. THE DealService SHALL actualizar el campo `updatedAt` automáticamente en cada modificación.

---

### Requisito 17: Ver Pipeline Kanban (HU-035)

**Historia de Usuario:** Como usuario, quiero ver el pipeline de ventas en vista kanban, para visualizar el estado de mis oportunidades.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/deals` es recibido, THE DealService SHALL retornar los deals activos del Workspace agrupables por etapa con paginación.
2. WHEN un request GET a `/api/deals/pipeline/summary` es recibido, THE DealService SHALL retornar para cada etapa: nombre, cantidad de deals, suma total de valores.
3. THE DealService SHALL incluir en cada deal: id, nombre, valor, contacto asociado, etapa, días en etapa actual, usuario asignado.
4. WHILE un deal tiene `is_deleted = true`, THE DealService SHALL excluirlo de todos los listados activos.

---

### Requisito 18: Calcular Valor del Pipeline (HU-036)

**Historia de Usuario:** Como manager, quiero ver el valor total del pipeline, para entender el potencial de ventas.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/deals/pipeline/summary` es recibido por un ADMIN o MANAGER, THE DealService SHALL retornar el valor total de todos los deals activos del Workspace.
2. THE DealService SHALL retornar el valor agregado por etapa del pipeline.
3. THE DealService SHALL retornar el valor total de deals con etapa `is_won = true` y el valor total de deals con etapa `is_lost = true`.
4. FOR ALL cálculos de valor, THE DealService SHALL usar suma aritmética de los campos `value` de los deals incluidos en el filtro.


---

### Requisito 19: Conectar WhatsApp (HU-040)

**Historia de Usuario:** Como administrador, quiero conectar mi número de WhatsApp Business, para comenzar a usar el canal de mensajería.

#### Criterios de Aceptación

1. WHEN un ADMIN hace POST a `/api/settings/integrations/whatsapp` con `phoneNumberId`, `accessToken` y `webhookVerifyToken` válidos, THE SettingsService SHALL guardar las credenciales encriptadas y retornar HTTP 200 con el estado de la integración.
2. WHEN las credenciales de WhatsApp son guardadas, THE System SHALL verificar la conexión con Meta Cloud API antes de confirmar el guardado.
3. IF la verificación con Meta Cloud API falla, THEN THE SettingsService SHALL retornar HTTP 422 con mensaje descriptivo del error de conexión.
4. WHEN un request GET a `/api/settings/integrations` es recibido por un ADMIN, THE SettingsService SHALL retornar el estado actual de cada integración (conectado/desconectado) sin exponer tokens en texto plano.

---

### Requisito 20: Recibir Mensaje de WhatsApp (HU-041)

**Historia de Usuario:** Como usuario, quiero recibir mensajes de WhatsApp en el CRM, para gestionar conversaciones desde un solo lugar.

#### Criterios de Aceptación

1. WHEN un request POST al webhook `/webhooks/whatsapp` es recibido con firma `X-Hub-Signature-256` válida, THE WhatsAppProvider SHALL procesar el mensaje entrante y retornar HTTP 200.
2. WHEN un mensaje entrante es procesado, THE ConversationService SHALL identificar el contacto por número de teléfono dentro del Workspace correspondiente.
3. WHEN el número de teléfono no corresponde a ningún contacto existente, THE ConversationService SHALL crear automáticamente un nuevo contacto con estado `NEW` y el teléfono como identificador.
4. THE ConversationService SHALL registrar el mensaje con: cuerpo, timestamp, dirección `INBOUND`, canal `WHATSAPP`, y `externalId` de Meta.
5. IF la firma del webhook es inválida, THEN THE WhatsAppProvider SHALL retornar HTTP 403 sin procesar el mensaje.
6. WHEN un request GET al webhook `/webhooks/whatsapp` es recibido con `hub.verify_token` correcto, THE System SHALL retornar el `hub.challenge` para completar la verificación de Meta.

---

### Requisito 21: Enviar Mensaje de WhatsApp (HU-042)

**Historia de Usuario:** Como vendedor, quiero enviar un mensaje de WhatsApp a un contacto, para comunicarme con mis leads y clientes.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/whatsapp/send` es recibido con `contactId` y `body` válidos, THE ConversationService SHALL enviar el mensaje vía Meta Cloud API y registrarlo con estado `SENDING`.
2. WHEN Meta Cloud API confirma el envío, THE ConversationService SHALL actualizar el estado del mensaje a `SENT` con el `externalId` retornado por Meta.
3. IF Meta Cloud API retorna error, THEN THE ConversationService SHALL actualizar el estado del mensaje a `FAILED` y retornar HTTP 422 con el mensaje de error de Meta.
4. THE ConversationService SHALL crear una Conversación nueva si no existe una activa con ese contacto por canal `WHATSAPP`.
5. WHEN el mensaje es enviado exitosamente, THE ConversationService SHALL actualizar el campo `lastMessageAt` de la Conversación.

---

### Requisito 22: Ver Historial de Conversación (HU-043)

**Historia de Usuario:** Como usuario, quiero ver el historial completo de mensajes, para entender el contexto de la conversación.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/conversations/{id}/messages` es recibido, THE ConversationService SHALL retornar los mensajes de la conversación ordenados por `sentAt` ascendente con paginación.
2. THE ConversationService SHALL incluir en cada mensaje: id, body, direction (INBOUND/OUTBOUND), channel, status, sentAt, deliveredAt, readAt.
3. IF la conversación no existe o pertenece a otro Workspace, THEN THE ConversationService SHALL retornar HTTP 404.
4. WHEN un request GET a `/api/conversations` es recibido, THE ConversationService SHALL retornar las conversaciones del Workspace ordenadas por `lastMessageAt` descendente.


---

### Requisito 23: Configurar Email SMTP (HU-050)

**Historia de Usuario:** Como administrador, quiero configurar el servidor de email, para poder enviar correos desde el CRM.

#### Criterios de Aceptación

1. WHEN un ADMIN hace POST a `/api/settings/integrations/email` con host, puerto, usuario, contraseña y tipo de encriptación válidos, THE SettingsService SHALL guardar las credenciales SMTP encriptadas y retornar HTTP 200.
2. WHEN las credenciales SMTP son guardadas, THE EmailService SHALL intentar una conexión de prueba al servidor SMTP antes de confirmar el guardado.
3. IF la conexión de prueba SMTP falla, THEN THE SettingsService SHALL retornar HTTP 422 con el mensaje de error de conexión.
4. THE SettingsService SHALL soportar los tipos de encriptación: `NONE`, `SSL`, `TLS`.
5. THE SettingsService SHALL almacenar las credenciales SMTP encriptadas en la base de datos, nunca en texto plano.

---

### Requisito 24: Configurar Email con Gmail API (HU-051)

**Historia de Usuario:** Como administrador, quiero conectar mi cuenta de Gmail, para enviar emails con mi dominio.

#### Criterios de Aceptación

1. WHEN un ADMIN inicia el flujo OAuth de Gmail, THE EmailService SHALL redirigir al consent screen de Google con los scopes necesarios para envío de email.
2. WHEN Google retorna el código de autorización, THE EmailService SHALL intercambiarlo por access token y refresh token, almacenarlos encriptados, y retornar HTTP 200 con el email conectado.
3. WHEN el access token de Gmail expira, THE EmailService SHALL renovarlo automáticamente usando el refresh token sin intervención del usuario.
4. WHEN un ADMIN desconecta Gmail, THE EmailService SHALL revocar los tokens y eliminar las credenciales almacenadas.

---

### Requisito 25: Enviar Email (HU-052)

**Historia de Usuario:** Como vendedor, quiero enviar un email a un contacto, para comunicarme formalmente con mis leads.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/email/send` es recibido con `contactId`, `subject` y `body` válidos, THE EmailService SHALL enviar el email usando la configuración SMTP o Gmail del Workspace y retornar HTTP 202.
2. THE EmailService SHALL registrar el email enviado como un mensaje en la Conversación del contacto con canal `EMAIL`, dirección `OUTBOUND` y estado `SENT`.
3. IF no hay configuración de email activa en el Workspace, THEN THE EmailService SHALL retornar HTTP 422 con mensaje indicando que se debe configurar una integración de email.
4. THE EmailService SHALL soportar los campos opcionales: `cc`, `bcc`, `templateId`.
5. WHEN un `templateId` es proporcionado, THE EmailService SHALL resolver las variables `{{contact_name}}` y `{{company_name}}` con los datos del contacto antes de enviar.

---

### Requisito 26: Recibir Reply de Email (HU-053)

**Historia de Usuario:** Como usuario, quiero ver las respuestas de mis emails, para continuar la conversación.

#### Criterios de Aceptación

1. WHEN un webhook de reply de email es recibido, THE EmailService SHALL identificar el thread original por el header `In-Reply-To` o `References` del email.
2. WHEN el thread es identificado, THE ConversationService SHALL agregar el mensaje reply a la Conversación existente del contacto con dirección `INBOUND` y canal `EMAIL`.
3. WHEN el remitente del reply no corresponde a ningún contacto del Workspace, THE ConversationService SHALL crear un nuevo contacto con el email del remitente.
4. THE EmailService SHALL preservar el encadenamiento de threads para que los replies aparezcan en la misma Conversación que el email original.


---

### Requisito 27: Crear Tarea (HU-060)

**Historia de Usuario:** Como vendedor, quiero crear una tarea asociada a un contacto, para recordar hacer seguimiento.

#### Criterios de Aceptación

1. WHEN un request POST a `/api/tasks` es recibido con título, `contactId` y `dueAt` válidos, THE TaskService SHALL crear la tarea con estado pendiente, registrar el usuario creador, y retornar HTTP 201.
2. IF el campo título está vacío, THEN THE TaskService SHALL retornar HTTP 400 con mensaje de validación.
3. IF el `contactId` no existe en el Workspace, THEN THE TaskService SHALL retornar HTTP 400.
4. THE TaskService SHALL aceptar los campos opcionales: descripción, prioridad (LOW, MEDIUM, HIGH, URGENT), `dealId`, `assignedTo`.
5. WHEN `assignedTo` no es especificado, THE TaskService SHALL asignar la tarea al usuario creador por defecto.
6. FOR ALL tareas creadas, el campo `workspaceId` SHALL coincidir con el Workspace del usuario autenticado.

---

### Requisito 28: Ver Lista de Tareas (HU-061)

**Historia de Usuario:** Como usuario, quiero ver todas mis tareas pendientes, para organizar mi día.

#### Criterios de Aceptación

1. WHEN un request GET a `/api/tasks` es recibido, THE TaskService SHALL retornar las tareas del Workspace con paginación, ordenadas por `dueAt` ascendente por defecto.
2. THE TaskService SHALL soportar filtros por: `completed` (boolean), `assignedTo` (userId), `priority`, `contactId`, y rango de fechas `dueBefore`/`dueAfter`.
3. WHEN el filtro `assignedTo=me` es aplicado, THE TaskService SHALL retornar solo las tareas asignadas al usuario autenticado.
4. THE TaskService SHALL incluir en cada tarea: id, título, descripción, prioridad, dueAt, isCompleted, contacto asociado, usuario asignado.

---

### Requisito 29: Completar Tarea (HU-062)

**Historia de Usuario:** Como usuario, quiero marcar una tarea como completada, para registrar que hice la actividad.

#### Criterios de Aceptación

1. WHEN un request PATCH a `/api/tasks/{id}/complete` es recibido, THE TaskService SHALL marcar la tarea como completada, registrar `completedAt` con el timestamp actual y el usuario que la completó, y retornar HTTP 200.
2. IF la tarea ya está completada, THE TaskService SHALL retornar HTTP 200 sin modificar los campos `completedAt` ni el usuario que la completó originalmente.
3. IF la tarea no existe o pertenece a otro Workspace, THEN THE TaskService SHALL retornar HTTP 404.
4. THE TaskService SHALL soportar desmarcar una tarea completada mediante PATCH a `/api/tasks/{id}` con `isCompleted: false`, limpiando el campo `completedAt`.

---

### Requisito 30: Recordatorio de Tarea (HU-065)

**Historia de Usuario:** Como usuario, quiero recibir recordatorio de mis tareas, para no olvidar hacerlas.

#### Criterios de Aceptación

1. WHEN el timestamp actual alcanza el `dueAt` de una tarea pendiente, THE TaskService SHALL emitir una notificación in-app al usuario asignado vía WebSocket.
2. THE TaskService SHALL soportar notificación anticipada configurable; por defecto SHALL notificar 15 minutos antes del `dueAt`.
3. WHILE una tarea está completada, THE TaskService SHALL omitir el envío de recordatorios para esa tarea.
4. THE System SHALL ejecutar la verificación de tareas próximas a vencer mediante un scheduler periódico con intervalo no mayor a 1 minuto.


---

### Requisito 31: Dashboard de Métricas (HU-070)

**Historia de Usuario:** Como manager, quiero ver un dashboard con métricas clave, para entender el rendimiento del equipo.

#### Criterios de Aceptación

1. WHEN un ADMIN o MANAGER hace GET a `/api/analytics/dashboard`, THE AnalyticsService SHALL retornar los KPIs: total de contactos activos, total de deals activos, valor total del pipeline, y tasa de conversión del período actual.
2. THE AnalyticsService SHALL calcular la tasa de conversión como: (deals con etapa `is_won = true` / total deals creados en el período) × 100.
3. THE AnalyticsService SHALL soportar el parámetro `period` con valores: `7d`, `30d`, `90d`; por defecto `30d`.
4. IF un usuario con rol SALES intenta acceder a `/api/analytics/dashboard`, THEN THE System SHALL retornar HTTP 403.
5. FOR ALL métricas retornadas, los datos SHALL pertenecer únicamente al Workspace del usuario autenticado.

---

### Requisito 32: Configurar Perfil de Usuario (HU-100)

**Historia de Usuario:** Como usuario, quiero configurar mi perfil, para mantener mis datos actualizados.

#### Criterios de Aceptación

1. WHEN un request PATCH a `/api/users/me` es recibido con datos válidos, THE System SHALL actualizar el nombre, teléfono y zona horaria del usuario autenticado y retornar HTTP 200.
2. WHEN un request PATCH a `/api/users/me/password` es recibido con contraseña actual correcta y nueva contraseña válida, THE System SHALL actualizar el hash de la contraseña y retornar HTTP 204.
3. IF la contraseña actual proporcionada es incorrecta, THEN THE System SHALL retornar HTTP 400.
4. IF la nueva contraseña tiene menos de 8 caracteres, THEN THE System SHALL retornar HTTP 400 con mensaje de validación.

---

### Requisito 33: Configuración del Workspace (HU-101)

**Historia de Usuario:** Como administrador, quiero configurar los datos de mi empresa/workspace, para personalizar el CRM.

#### Criterios de Aceptación

1. WHEN un ADMIN hace GET a `/api/settings/workspace`, THE SettingsService SHALL retornar la configuración actual del Workspace: nombre, timezone, plan.
2. WHEN un ADMIN hace PATCH a `/api/settings/workspace` con datos válidos, THE SettingsService SHALL actualizar el nombre y timezone del Workspace y retornar HTTP 200.
3. IF un usuario no ADMIN intenta acceder a `/api/settings/workspace`, THEN THE System SHALL retornar HTTP 403.

---

### Requisito 34: Gestionar Roles de Usuario (HU-102)

**Historia de Usuario:** Como administrador, quiero gestionar los roles de los usuarios, para mantener la seguridad del sistema.

#### Criterios de Aceptación

1. WHEN un ADMIN hace PATCH a `/api/users/{id}` con un nuevo rol válido (ADMIN, MANAGER, SALES), THE System SHALL actualizar el rol del usuario y retornar HTTP 200.
2. WHEN un ADMIN intenta cambiar el rol del único usuario ADMIN del Workspace, THE System SHALL retornar HTTP 409 con mensaje indicando que debe existir al menos un ADMIN.
3. IF el usuario objetivo no pertenece al mismo Workspace, THEN THE System SHALL retornar HTTP 404.

---

### Requisito 35: Gestionar Integraciones del Workspace (HU-107)

**Historia de Usuario:** Como administrador, quiero gestionar las integraciones conectadas, para administrar los canales.

#### Criterios de Aceptación

1. WHEN un ADMIN hace GET a `/api/settings/integrations`, THE SettingsService SHALL retornar el estado de cada integración disponible: WhatsApp, Email (SMTP/Gmail).
2. THE SettingsService SHALL indicar para cada integración: nombre, estado (CONNECTED/DISCONNECTED), y fecha de última conexión exitosa.
3. WHEN una integración es desconectada, THE SettingsService SHALL revocar y eliminar las credenciales almacenadas para esa integración.
4. IF un usuario no ADMIN intenta gestionar integraciones, THEN THE System SHALL retornar HTTP 403.


---

## Propiedades de Corrección (Property-Based Testing)

### Auth: Propiedades de Tokens JWT

1. **Round-trip de claims**: Para todo usuario autenticado, el Access_Token generado SHALL contener exactamente los mismos valores de `userId`, `workspaceId` y `role` que el usuario en base de datos. Formalmente: `decode(generate(user)).workspaceId == user.workspaceId`.

2. **Invariante de expiración**: Para todo par de tokens emitidos, `accessToken.exp < refreshToken.exp` SHALL ser siempre verdadero.

3. **Idempotencia de logout**: Hacer logout múltiples veces con el mismo Refresh_Token SHALL producir el mismo resultado (HTTP 204 o 401), sin efectos secundarios adicionales.

4. **Aislamiento de workspace**: Para todo par de usuarios `u1` y `u2` con `u1.workspaceId != u2.workspaceId`, ningún recurso retornado por el sistema para `u1` SHALL tener `workspaceId == u2.workspaceId`.

### Contacts: Propiedades de Datos

5. **Unicidad de email por workspace**: Para todo workspace `W`, no SHALL existir dos contactos activos con el mismo email dentro de `W`. Formalmente: `∀ c1, c2 ∈ contacts(W): c1.id != c2.id → c1.email != c2.email`.

6. **Invariante de soft delete**: Un contacto con `is_deleted = true` SHALL nunca aparecer en listados activos, búsquedas ni filtros, pero SHALL ser recuperable por un ADMIN.

7. **Metamórfica de filtros combinados**: El resultado de aplicar filtros `A` y `B` simultáneamente SHALL ser un subconjunto del resultado de aplicar solo `A` y también un subconjunto del resultado de aplicar solo `B`. Formalmente: `filter(A AND B) ⊆ filter(A)` y `filter(A AND B) ⊆ filter(B)`.

### Deals: Propiedades del Pipeline

8. **Invariante de valor del pipeline**: La suma de valores retornada por `/api/deals/pipeline/summary` SHALL ser igual a la suma aritmética de los campos `value` de todos los deals activos del Workspace. Formalmente: `summary.total == Σ deal.value ∀ deal: !deal.isDeleted`.

9. **Consistencia de etapas**: Para todo deal, su `stageId` SHALL referenciar una etapa que pertenezca al mismo Workspace que el deal.

10. **Metamórfica de mover etapas**: Mover un deal de etapa `A` a `B` y luego de `B` a `C` SHALL producir el mismo estado final que mover directamente de `A` a `C`.

### Mensajería: Propiedades de Conversaciones

11. **Invariante de canal**: Para todo mensaje en una conversación, el canal del mensaje (`WHATSAPP` o `EMAIL`) SHALL coincidir con el canal de la conversación padre.

12. **Ordenamiento temporal**: Para toda conversación, los mensajes retornados por `/api/conversations/{id}/messages` SHALL estar ordenados por `sentAt` ascendente sin excepciones.

13. **Idempotencia de webhook**: Procesar el mismo payload de webhook de Meta dos veces (mismo `externalId`) SHALL crear exactamente un mensaje, no duplicados.

### Tasks: Propiedades de Tareas

14. **Invariante de completado**: Una tarea con `isCompleted = true` SHALL tener siempre un valor no nulo en `completedAt`. Formalmente: `task.isCompleted → task.completedAt != null`.

15. **Metamórfica de filtros de fecha**: El conjunto de tareas con `dueAfter=T1` y `dueBefore=T2` SHALL ser un subconjunto de las tareas con solo `dueAfter=T1`, para cualquier `T1 < T2`.

---

## Requisitos No Funcionales

### Rendimiento

1. THE System SHALL responder a requests de listado con paginación (máximo 50 registros por página) en menos de 500ms bajo carga normal.
2. THE System SHALL procesar webhooks entrantes de WhatsApp en menos de 2 segundos end-to-end (recepción → persistencia → notificación WebSocket).
3. THE System SHALL soportar al menos 100 usuarios concurrentes por workspace sin degradación de rendimiento mayor al 20%.

### Seguridad

4. THE System SHALL usar bcrypt con factor de costo mínimo 10 para el hash de contraseñas.
5. THE System SHALL validar la firma HMAC-SHA256 (`X-Hub-Signature-256`) en todos los webhooks de Meta antes de procesar el payload.
6. THE System SHALL almacenar todas las credenciales de integraciones externas (tokens, contraseñas SMTP) encriptadas en la base de datos usando AES-256.
7. THE System SHALL aplicar rate limiting de 10 requests por segundo por IP en endpoints públicos de autenticación.

### Disponibilidad y Consistencia

8. THE System SHALL usar transacciones de base de datos para operaciones que modifiquen múltiples entidades (ej: crear usuario + workspace).
9. THE System SHALL retornar respuestas de error en formato JSON consistente con estructura: `{ "error": string, "message": string, "timestamp": ISO8601 }`.
10. THE System SHALL exponer un endpoint `/actuator/health` que retorne HTTP 200 cuando todos los componentes críticos (DB, Redis) estén operativos.

### Observabilidad

11. THE System SHALL registrar en logs estructurados (JSON) cada request con: método, path, statusCode, duración en ms, userId y workspaceId (cuando aplique).
12. THE System SHALL registrar en logs de nivel ERROR cualquier fallo en integraciones externas (Meta API, SMTP) con el mensaje de error completo.

### Compatibilidad

13. THE System SHALL exponer documentación OpenAPI 3.0 en `/v3/api-docs` y Swagger UI en `/swagger-ui.html` en entornos de desarrollo.
14. THE System SHALL soportar CORS para el origen del frontend configurado en variables de entorno.
