# Plan de Implementación: CRM Backend

## Visión General

Implementación incremental del backend Spring Boot 3.3 + Java 17 + PostgreSQL + Redis + WebSockets.
Cada tarea construye sobre la anterior; al final todos los módulos quedan integrados y funcionales.

## Tareas

- [ ] 1. Configuración del proyecto base
  - Actualizar `pom.xml`: agregar dependencias faltantes (jjwt 0.12, mapstruct, springdoc-openapi 2.x, jasypt, jte o thymeleaf para templates de email)
  - Renombrar package de `com.crm.startup_crm` a `com.crm` en `StartupCrmApplication.java` y ajustar estructura de carpetas
  - Configurar `application.properties` con perfiles `dev` y `prod`: datasource, redis, jwt secret/expiry, cors origins, actuator endpoints
  - Crear `application-dev.properties` con valores locales y `application-prod.properties` con placeholders de env vars
  - Crear `docker-compose.yml` en raíz del proyecto con servicios: `postgres:16`, `redis:7-alpine`, y el propio `app`
  - _Requisitos: NFR-10, NFR-13, NFR-14_


- [ ] 2. Infraestructura común
  - [x] 2.1 Crear `AuditableEntity` base con campos `createdAt`, `updatedAt`, `createdBy`, `workspaceId` usando `@MappedSuperclass` y `@EntityListeners(AuditingEntityListener.class)`
    - Habilitar JPA Auditing con `@EnableJpaAuditing` en clase de configuración
    - _Requisitos: 8.4, 9.1, 10.4_
  - [ ] 2.2 Implementar `WorkspaceContext` (ThreadLocal) y `WorkspaceFilter` (OncePerRequestFilter)
    - El filtro extrae `workspaceId` y `role` del JWT y los inyecta en el contexto antes de llegar al controlador
    - _Requisitos: 7.1, 8.1, 8.2_
  - [ ] 2.3 Implementar `GlobalExceptionHandler` con `@RestControllerAdvice`
    - Manejar: `MethodArgumentNotValidException` → 400, `EntityNotFoundException` → 404, `DuplicateKeyException` → 409, `AccessDeniedException` → 403, `AuthenticationException` → 401, `Exception` genérica → 500
    - Formato de respuesta: `{ "error": string, "message": string, "timestamp": ISO8601 }`
    - _Requisitos: NFR-9_
  - [ ] 2.4 Configurar `SecurityConfig`: deshabilitar CSRF, stateless session, rutas públicas (`/api/auth/**`, `/webhooks/**`, `/actuator/health`, `/swagger-ui/**`, `/v3/api-docs/**`), agregar `JwtAuthFilter`
    - _Requisitos: 7.3, NFR-7_
  - [ ] 2.5 Implementar `EncryptionService` con AES-256 para cifrar/descifrar credenciales de integraciones externas
    - _Requisitos: NFR-6_
  - [ ] 2.6 Configurar `WebSocketConfig` con STOMP broker relay sobre `/ws`, destination prefix `/app`, broker prefix `/topic` y `/queue`
    - _Requisitos: 30.1_


- [ ] 3. Módulo Auth
  - [ ] 3.1 Crear entidades `User` y `Workspace` con sus repositorios JPA
    - `User`: id (UUID), email, passwordHash, name, phone, timezone, role (enum ADMIN/MANAGER/SALES), isActive, workspaceId, createdAt, updatedAt
    - `Workspace`: id (UUID), name, timezone, plan, createdAt
    - `RefreshToken`: id, tokenHash, userId, expiresAt, revokedAt
    - _Requisitos: 1.1, 1.6_
  - [ ] 3.2 Implementar `JwtService`: generar Access_Token (15 min) y Refresh_Token (7 días), validar tokens, extraer claims
    - Claims del Access_Token: `sub` (userId), `workspaceId`, `role`, `iat`, `exp`
    - _Requisitos: 2.3, 2.5, 4.4_
  - [ ] 3.3 Implementar `AuthService` con métodos: `register`, `login`, `googleOAuth`, `refresh`, `logout`
    - `register`: validar email único, hashear password con bcrypt cost 10, crear User + Workspace en transacción, emitir tokens
    - `login`: verificar credenciales, emitir tokens, guardar hash del refresh token
    - `refresh`: validar refresh token, rotar (invalidar anterior, emitir nuevo par)
    - `logout`: revocar refresh token del usuario
    - _Requisitos: 1.1–1.6, 2.1–2.5, 4.1–4.4, 5.1–5.3_
  - [ ] 3.4 Implementar `GoogleOAuthService`: verificar id_token con Google tokeninfo endpoint, obtener email, delegar a `AuthService`
    - _Requisitos: 3.1–3.4_
  - [ ] 3.5 Crear `AuthController` con endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/refresh`, `POST /api/auth/logout`
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1_
  - [ ]* 3.6 Escribir test de propiedad: round-trip de claims JWT
    - **Propiedad 1: Round-trip de claims** — `decode(generate(user)).workspaceId == user.workspaceId`
    - **Valida: Requisito 2.3**
  - [ ]* 3.7 Escribir test de propiedad: invariante de expiración de tokens
    - **Propiedad 2: `accessToken.exp < refreshToken.exp` siempre verdadero**
    - **Valida: Requisito 2.5**
  - [ ]* 3.8 Escribir tests unitarios para `AuthService` y `JwtService`
    - Casos: registro exitoso, email duplicado, password corta, login inválido, refresh con token revocado, logout idempotente
    - _Requisitos: 1.2, 1.3, 2.2, 4.2, 5.2_

- [ ] 4. Checkpoint — Verificar que el contexto de seguridad funciona end-to-end
  - Asegurar que todos los tests pasan. Consultar al usuario si hay dudas antes de continuar.


- [ ] 5. Módulo User + Workspace
  - [ ] 5.1 Implementar `UserService` con métodos: `listByWorkspace`, `inviteUser`, `updateRole`, `deactivate`, `updateProfile`, `changePassword`
    - `deactivate`: soft delete (isActive = false), garantizar que quede al menos un ADMIN activo
    - `updateRole`: validar que no se elimine el último ADMIN del workspace
    - _Requisitos: 6.1–6.6, 32.1–32.4, 34.1–34.3_
  - [ ] 5.2 Crear `UserController` con endpoints:
    - `GET /api/users` (ADMIN), `POST /api/users/invite` (ADMIN), `PATCH /api/users/{id}` (ADMIN), `DELETE /api/users/{id}` (ADMIN)
    - `PATCH /api/users/me`, `PATCH /api/users/me/password`
    - _Requisitos: 6.1–6.5, 32.1–32.4_
  - [ ] 5.3 Crear `WorkspaceController` con endpoints: `GET /api/settings/workspace`, `PATCH /api/settings/workspace` (ADMIN)
    - _Requisitos: 33.1–33.3_
  - [ ]* 5.4 Escribir test de propiedad: aislamiento de workspace
    - **Propiedad 4: ningún recurso de u1 tiene workspaceId == u2.workspaceId cuando u1.workspaceId != u2.workspaceId**
    - **Valida: Requisito 8.2, 8.5**
  - [ ]* 5.5 Escribir tests unitarios para `UserService`
    - Casos: invitar usuario, cambiar rol, intentar eliminar último ADMIN, cambiar password con contraseña incorrecta
    - _Requisitos: 6.6, 34.2, 32.3_


- [ ] 6. Módulo Contact + Company + Tags
  - [ ] 6.1 Crear entidades `Contact`, `Company`, `Tag`, `ContactTag` con sus repositorios
    - `Contact`: id (UUID), name, email, phone, jobTitle, status (enum NEW/CONTACTED/QUALIFIED/LOST/CONVERTED), assignedTo, companyId, workspaceId, isDeleted, createdAt, updatedAt
    - `Company`: id, name, domain, workspaceId, createdAt, updatedAt
    - `Tag`: id, name, color, workspaceId
    - `ContactTag`: contactId, tagId (tabla de unión)
    - _Requisitos: 9.1, 9.4, 8.4_
  - [ ] 6.2 Implementar `ContactService` con métodos: `create`, `update`, `findById`, `search`, `listWithFilters`, `addNote`, `listNotes`
    - `search`: búsqueda case-insensitive por name, email, phone, company con paginación
    - `listWithFilters`: filtros combinados (AND) por status, tagIds, assignedTo; ordenamiento por createdAt/name/updatedAt
    - _Requisitos: 9.1–9.5, 10.1–10.4, 11.1–11.4, 12.1–12.4, 13.1–13.4_
  - [ ] 6.3 Crear `ContactController` con endpoints:
    - `POST /api/contacts`, `GET /api/contacts`, `GET /api/contacts/{id}`, `PATCH /api/contacts/{id}`
    - `GET /api/contacts/{id}/notes`, `POST /api/contacts/{id}/notes`
    - _Requisitos: 9.1, 10.1, 11.1, 12.1, 13.1, 13.2_
  - [ ] 6.4 Crear `CompanyController`: `POST /api/companies`, `GET /api/companies`, `GET /api/companies/{id}`, `PATCH /api/companies/{id}`
    - _Requisitos: 9.4_
  - [ ] 6.5 Crear `TagController`: `GET /api/tags`, `POST /api/tags`, `DELETE /api/tags/{id}`
    - _Requisitos: 12.2_
  - [ ]* 6.6 Escribir test de propiedad: unicidad de email por workspace
    - **Propiedad 5: ∀ c1, c2 ∈ contacts(W): c1.id != c2.id → c1.email != c2.email**
    - **Valida: Requisito 9.2**
  - [ ]* 6.7 Escribir test de propiedad: invariante de soft delete
    - **Propiedad 6: contacto con isDeleted=true nunca aparece en listados activos**
    - **Valida: Requisito 11.1**
  - [ ]* 6.8 Escribir test de propiedad: metamórfica de filtros combinados
    - **Propiedad 7: filter(A AND B) ⊆ filter(A) y filter(A AND B) ⊆ filter(B)**
    - **Valida: Requisito 12.3**
  - [ ]* 6.9 Escribir tests unitarios para `ContactService`
    - Casos: crear contacto con email duplicado en mismo workspace, buscar sin resultados, filtros combinados, paginación
    - _Requisitos: 9.2, 11.2, 11.3, 12.3_

- [ ] 7. Checkpoint — Verificar módulos Auth + User + Contact
  - Asegurar que todos los tests pasan. Consultar al usuario si hay dudas antes de continuar.


- [ ] 8. Módulo Deal + Pipeline
  - [ ] 8.1 Crear entidades `Pipeline`, `Stage`, `Deal`, `DealStageHistory` con sus repositorios
    - `Pipeline`: id, name, workspaceId, isDefault
    - `Stage`: id, name, order, isWon, isLost, pipelineId, workspaceId
    - `Deal`: id, name, value (BigDecimal), contactId, stageId, assignedTo, workspaceId, isDeleted, createdAt, updatedAt
    - `DealStageHistory`: id, dealId, fromStageId, toStageId, changedBy, changedAt
    - _Requisitos: 14.4, 15.4, 17.4_
  - [ ] 8.2 Implementar `DealService` con métodos: `create`, `update`, `moveStage`, `list`, `getPipelineSummary`
    - `moveStage`: validar que stageId pertenece al mismo workspace, registrar historial
    - `getPipelineSummary`: agrupar por etapa con count y suma de valores; calcular totales won/lost
    - _Requisitos: 14.1–14.5, 15.1–15.4, 16.1–16.4, 17.1–17.4, 18.1–18.4_
  - [ ] 8.3 Crear `DealController` con endpoints:
    - `POST /api/deals`, `GET /api/deals`, `PATCH /api/deals/{id}`, `PATCH /api/deals/{id}/stage`
    - `GET /api/deals/pipeline/summary` (ADMIN/MANAGER)
    - _Requisitos: 14.1, 15.1, 16.1, 17.1, 18.1_
  - [ ]* 8.4 Escribir test de propiedad: invariante de valor del pipeline
    - **Propiedad 8: summary.total == Σ deal.value ∀ deal: !deal.isDeleted**
    - **Valida: Requisito 18.1, 18.4**
  - [ ]* 8.5 Escribir test de propiedad: consistencia de etapas
    - **Propiedad 9: deal.stageId siempre referencia una etapa del mismo workspace**
    - **Valida: Requisito 15.2**
  - [ ]* 8.6 Escribir test de propiedad: metamórfica de mover etapas
    - **Propiedad 10: mover A→B→C produce el mismo estado final que mover A→C**
    - **Valida: Requisito 15.1**
  - [ ]* 8.7 Escribir tests unitarios para `DealService`
    - Casos: crear deal sin etapa (asigna primera), mover a etapa de otro workspace, valor negativo, deal eliminado excluido de summary
    - _Requisitos: 14.2, 14.4, 15.2, 16.2, 17.4_


- [ ] 9. Módulo WhatsApp (Meta Cloud API)
  - [ ] 9.1 Crear entidad `WhatsAppConfig` con campos: phoneNumberId, accessToken (encriptado), webhookVerifyToken (encriptado), workspaceId, connectedAt
    - _Requisitos: 19.1, NFR-6_
  - [ ] 9.2 Implementar `WhatsAppProvider` (interfaz + implementación `MetaCloudApiProvider`)
    - `sendMessage(phoneNumber, body)`: llamada a `https://graph.facebook.com/v19.0/{phoneNumberId}/messages`
    - `verifyWebhookSignature(payload, signature)`: validar HMAC-SHA256 con `X-Hub-Signature-256`
    - `verifyConnection(config)`: llamada de prueba a Meta API para validar credenciales
    - _Requisitos: 19.2, 19.3, 20.1, 20.5, 21.1_
  - [ ] 9.3 Implementar `WhatsAppWebhookService`: procesar payload entrante de Meta
    - Identificar contacto por teléfono en el workspace; si no existe, crear contacto nuevo con estado NEW
    - Delegar persistencia del mensaje a `ConversationService`
    - Idempotencia: verificar `externalId` antes de insertar (ignorar duplicados)
    - _Requisitos: 20.2, 20.3, 20.4, 20.6_
  - [ ] 9.4 Crear `WhatsAppWebhookController` con endpoints:
    - `GET /webhooks/whatsapp`: verificación de Meta (hub.challenge)
    - `POST /webhooks/whatsapp`: recepción de mensajes (validar firma, retornar 200 inmediato)
    - _Requisitos: 20.1, 20.5, 20.6_
  - [ ] 9.5 Crear `WhatsAppController` con endpoint `POST /api/whatsapp/send`
    - Enviar mensaje vía `WhatsAppProvider`, registrar con estado SENDING → SENT/FAILED
    - _Requisitos: 21.1–21.5_
  - [ ]* 9.6 Escribir test de propiedad: idempotencia de webhook
    - **Propiedad 13: procesar el mismo payload dos veces (mismo externalId) crea exactamente un mensaje**
    - **Valida: Requisito 20.4**
  - [ ]* 9.7 Escribir tests unitarios para `WhatsAppWebhookService` y `MetaCloudApiProvider`
    - Casos: firma inválida → 403, contacto nuevo creado automáticamente, mensaje duplicado ignorado, fallo de Meta API → estado FAILED
    - _Requisitos: 20.1, 20.3, 20.5, 21.3_


- [ ] 10. Módulo Email (SMTP/Brevo + Gmail OAuth)
  - [ ] 10.1 Crear entidades `EmailConfig` (SMTP: host, port, username, password encriptado, encryption enum NONE/SSL/TLS) y `GmailConfig` (accessToken, refreshToken encriptados, email, workspaceId)
    - _Requisitos: 23.1, 23.4, 23.5, 24.1_
  - [ ] 10.2 Implementar `SmtpEmailProvider`: enviar email usando `JavaMailSender` con la config SMTP del workspace; método `testConnection()` para validar antes de guardar
    - _Requisitos: 23.2, 23.3, 25.1_
  - [ ] 10.3 Implementar `GmailOAuthProvider`: flujo OAuth2 con Google (redirect, callback, intercambio de código, renovación automática de access token, revocación)
    - _Requisitos: 24.1–24.4_
  - [ ] 10.4 Implementar `EmailService` con métodos: `send`, `resolveTemplate`, `processInboundReply`
    - `send`: seleccionar provider activo (SMTP o Gmail), registrar mensaje en conversación con canal EMAIL/OUTBOUND/SENT
    - `resolveTemplate`: reemplazar `{{contact_name}}` y `{{company_name}}` con datos del contacto
    - `processInboundReply`: identificar thread por `In-Reply-To`/`References`, agregar mensaje a conversación existente
    - _Requisitos: 25.1–25.5, 26.1–26.4_
  - [ ] 10.5 Crear `EmailController` con endpoints:
    - `POST /api/email/send`
    - `POST /api/settings/integrations/email` (ADMIN), `GET /api/settings/integrations/email/oauth/callback`
    - _Requisitos: 23.1, 24.1, 25.1_
  - [ ]* 10.6 Escribir tests unitarios para `EmailService`
    - Casos: enviar sin config activa → 422, template con variables resueltas, reply encadenado a conversación existente, remitente desconocido crea contacto
    - _Requisitos: 25.3, 25.5, 26.2, 26.3_


- [ ] 11. Módulo Conversation (WebSockets STOMP)
  - [ ] 11.1 Crear entidades `Conversation` y `Message` con sus repositorios
    - `Conversation`: id, contactId, channel (enum WHATSAPP/EMAIL), lastMessageAt, workspaceId, createdAt
    - `Message`: id, conversationId, body, direction (INBOUND/OUTBOUND), channel, status (SENDING/SENT/DELIVERED/READ/FAILED), externalId, sentAt, deliveredAt, readAt, workspaceId
    - _Requisitos: 20.4, 21.4, 22.2_
  - [ ] 11.2 Implementar `ConversationService` con métodos: `findOrCreate`, `addMessage`, `listMessages`, `listConversations`, `notifyViaWebSocket`
    - `findOrCreate`: buscar conversación activa por contactId + channel; crear si no existe
    - `notifyViaWebSocket`: publicar en `/topic/workspace/{workspaceId}/conversations` al recibir mensaje nuevo
    - _Requisitos: 21.4, 21.5, 22.1–22.4_
  - [ ] 11.3 Crear `ConversationController` con endpoints:
    - `GET /api/conversations` (ordenado por lastMessageAt desc)
    - `GET /api/conversations/{id}/messages` (paginado, ordenado por sentAt asc)
    - _Requisitos: 22.1, 22.4_
  - [ ]* 11.4 Escribir test de propiedad: invariante de canal
    - **Propiedad 11: canal del mensaje siempre coincide con canal de la conversación padre**
    - **Valida: Requisito 20.4, 25.2**
  - [ ]* 11.5 Escribir test de propiedad: ordenamiento temporal de mensajes
    - **Propiedad 12: mensajes retornados por /api/conversations/{id}/messages siempre ordenados por sentAt asc**
    - **Valida: Requisito 22.1**
  - [ ]* 11.6 Escribir tests unitarios para `ConversationService`
    - Casos: findOrCreate idempotente, listado ordenado por lastMessageAt, conversación de otro workspace → 404
    - _Requisitos: 21.4, 22.4, 8.3_

- [ ] 12. Checkpoint — Verificar módulos Deal + WhatsApp + Email + Conversation
  - Asegurar que todos los tests pasan. Consultar al usuario si hay dudas antes de continuar.


- [ ] 13. Módulo Task (con scheduler de recordatorios)
  - [ ] 13.1 Crear entidad `Task` con su repositorio
    - Campos: id, title, description, priority (enum LOW/MEDIUM/HIGH/URGENT), dueAt, isCompleted, completedAt, completedBy, contactId, dealId, assignedTo, workspaceId, createdAt, updatedAt
    - _Requisitos: 27.1, 27.4_
  - [ ] 13.2 Implementar `TaskService` con métodos: `create`, `list`, `complete`, `uncomplete`, `update`
    - `create`: asignar al usuario creador si `assignedTo` no se especifica
    - `list`: filtros por completed, assignedTo (con soporte `me`), priority, contactId, dueBefore/dueAfter; ordenar por dueAt asc
    - `complete`: registrar completedAt + completedBy; idempotente si ya está completada
    - _Requisitos: 27.1–27.6, 28.1–28.4, 29.1–29.4_
  - [ ] 13.3 Implementar `TaskReminderScheduler` con `@Scheduled(fixedRate = 60000)`
    - Consultar tareas pendientes con dueAt entre ahora y ahora+15min que no hayan sido notificadas
    - Publicar notificación vía WebSocket a `/queue/user/{userId}/reminders`
    - Omitir tareas completadas
    - _Requisitos: 30.1–30.4_
  - [ ] 13.4 Crear `TaskController` con endpoints:
    - `POST /api/tasks`, `GET /api/tasks`, `PATCH /api/tasks/{id}`, `PATCH /api/tasks/{id}/complete`
    - _Requisitos: 27.1, 28.1, 29.1, 29.4_
  - [ ]* 13.5 Escribir test de propiedad: invariante de completado
    - **Propiedad 14: task.isCompleted=true → task.completedAt != null siempre**
    - **Valida: Requisito 29.1**
  - [ ]* 13.6 Escribir test de propiedad: metamórfica de filtros de fecha
    - **Propiedad 15: tareas con dueAfter=T1 AND dueBefore=T2 ⊆ tareas con solo dueAfter=T1**
    - **Valida: Requisito 28.2**
  - [ ]* 13.7 Escribir tests unitarios para `TaskService` y `TaskReminderScheduler`
    - Casos: completar tarea ya completada (idempotente), filtro assignedTo=me, scheduler omite tareas completadas
    - _Requisitos: 29.2, 28.3, 30.3_


- [ ] 14. Módulo Analytics
  - [ ] 14.1 Implementar `AnalyticsService` con método `getDashboard(workspaceId, period)`
    - Calcular: total contactos activos, total deals activos, valor total del pipeline, tasa de conversión
    - Tasa de conversión: (deals con etapa isWon=true / total deals creados en período) × 100
    - Soportar períodos: `7d`, `30d`, `90d` (default `30d`)
    - _Requisitos: 31.1–31.5_
  - [ ] 14.2 Crear `AnalyticsController` con endpoint `GET /api/analytics/dashboard` (ADMIN/MANAGER únicamente)
    - _Requisitos: 31.1, 31.4_
  - [ ]* 14.3 Escribir tests unitarios para `AnalyticsService`
    - Casos: tasa de conversión con 0 deals, acceso de SALES → 403, datos de otro workspace no incluidos
    - _Requisitos: 31.2, 31.4, 31.5_

- [ ] 15. Módulo Export
  - [ ] 15.1 Implementar `ExportService` con métodos: `exportContactsCsv(workspaceId, filters)`, `exportDealsCsv(workspaceId, filters)`, `exportContactsPdf(workspaceId, filters)`
    - CSV: usar OpenCSV o Apache Commons CSV; incluir todos los campos visibles del listado
    - PDF: usar iText o Apache PDFBox; tabla con columnas principales
    - Respetar los mismos filtros que los listados normales
    - _Requisitos: 8.2 (aislamiento), 11.1 (filtros de contactos)_
  - [ ] 15.2 Crear `ExportController` con endpoints:
    - `GET /api/contacts/export?format=csv|pdf`
    - `GET /api/deals/export?format=csv`
    - Retornar con headers `Content-Disposition: attachment` apropiados
    - _Requisitos: 8.5_

- [ ] 16. Módulo Settings (integraciones)
  - [ ] 16.1 Crear `SettingsController` con endpoints de integraciones:
    - `GET /api/settings/integrations` (ADMIN): estado de WhatsApp y Email
    - `POST /api/settings/integrations/whatsapp` (ADMIN): guardar config WhatsApp con verificación previa
    - `DELETE /api/settings/integrations/whatsapp` (ADMIN): desconectar y eliminar credenciales
    - `DELETE /api/settings/integrations/email` (ADMIN): desconectar email (SMTP o Gmail)
    - _Requisitos: 19.1–19.4, 35.1–35.4_
  - [ ]* 16.2 Escribir tests unitarios para `SettingsService`
    - Casos: guardar WhatsApp con verificación fallida → 422, listar integraciones sin exponer tokens, acceso no-ADMIN → 403
    - _Requisitos: 19.3, 19.4, 35.4_

- [ ] 17. Checkpoint — Verificar módulos Task + Analytics + Export + Settings
  - Asegurar que todos los tests pasan. Consultar al usuario si hay dudas antes de continuar.


- [ ] 18. Migraciones Flyway
  - [ ] 18.1 Crear `V1__create_workspace_and_users.sql`
    - Tablas: `workspaces`, `users`, `refresh_tokens`
    - Índices: `users(email)`, `users(workspace_id)`, `refresh_tokens(token_hash)`
    - _Requisitos: 1.1, 2.4_
  - [ ] 18.2 Crear `V2__create_contacts_companies_tags.sql`
    - Tablas: `companies`, `contacts`, `tags`, `contact_tags`, `contact_notes`
    - Índices: `contacts(workspace_id, email)` (unique), `contacts(workspace_id, status)`, `contacts(assigned_to)`
    - _Requisitos: 9.2, 11.1_
  - [ ] 18.3 Crear `V3__create_deals_pipeline.sql`
    - Tablas: `pipelines`, `stages`, `deals`, `deal_stage_history`
    - Índices: `deals(workspace_id, stage_id)`, `deals(workspace_id, is_deleted)`, `stages(pipeline_id, order)`
    - _Requisitos: 14.4, 17.4_
  - [ ] 18.4 Crear `V4__create_conversations_messages.sql`
    - Tablas: `conversations`, `messages`
    - Índices: `conversations(workspace_id, contact_id, channel)`, `messages(conversation_id, sent_at)`, `messages(external_id)` (unique)
    - _Requisitos: 20.4, 22.1_
  - [ ] 18.5 Crear `V5__create_tasks.sql`
    - Tabla: `tasks`
    - Índices: `tasks(workspace_id, assigned_to)`, `tasks(workspace_id, due_at)`, `tasks(workspace_id, is_completed)`
    - _Requisitos: 27.1, 28.2_
  - [ ] 18.6 Crear `V6__create_integrations_settings.sql`
    - Tablas: `whatsapp_configs`, `email_smtp_configs`, `gmail_configs`
    - Todos los campos de credenciales como `TEXT` (almacenados encriptados con AES-256)
    - _Requisitos: 19.1, 23.1, 24.1, NFR-6_
  - [ ] 18.7 Crear `V7__seed_default_pipeline.sql`
    - Insertar pipeline por defecto con etapas: Nuevo Lead, Contactado, Propuesta, Negociación, Cerrado Ganado (isWon=true), Cerrado Perdido (isLost=true)
    - _Requisitos: 14.4_


- [ ] 19. Tests de integración
  - [ ]* 19.1 Escribir tests de integración para el flujo completo de Auth
    - Usar `@SpringBootTest` + Testcontainers (PostgreSQL + Redis)
    - Flujo: register → login → refresh → logout → intentar refresh con token revocado
    - _Requisitos: 1.1, 2.1, 4.1, 5.1, 5.2_
  - [ ]* 19.2 Escribir tests de integración para aislamiento de workspace
    - Crear dos workspaces, verificar que los recursos de uno no son visibles desde el otro
    - **Propiedad 4: aislamiento de workspace**
    - _Requisitos: 8.1–8.5_
  - [ ]* 19.3 Escribir tests de integración para el flujo WhatsApp webhook
    - Simular payload de Meta, verificar creación de contacto + mensaje + notificación WebSocket
    - Verificar idempotencia con mismo externalId
    - _Requisitos: 20.1–20.6_
  - [ ]* 19.4 Escribir tests de integración para el módulo Deal + pipeline summary
    - Crear deals en distintas etapas, verificar que el summary coincide con la suma aritmética
    - **Propiedad 8: invariante de valor del pipeline**
    - _Requisitos: 17.1, 18.1–18.4_

- [ ] 20. Configuración final y observabilidad
  - [ ] 20.1 Configurar logging estructurado JSON con Logback: agregar `logstash-logback-encoder` al `pom.xml` y configurar `logback-spring.xml`
    - Incluir en cada log: método, path, statusCode, duración ms, userId, workspaceId
    - _Requisitos: NFR-11, NFR-12_
  - [ ] 20.2 Configurar rate limiting en endpoints de auth (`/api/auth/**`) usando `Bucket4j` + Redis: 10 req/s por IP
    - _Requisitos: NFR-7_
  - [ ] 20.3 Configurar SpringDoc OpenAPI: agregar dependencia `springdoc-openapi-starter-webmvc-ui`, habilitar solo en perfil `dev`, configurar `SecurityScheme` para JWT Bearer
    - _Requisitos: NFR-13_
  - [ ] 20.4 Verificar endpoint `/actuator/health` con health indicators para PostgreSQL y Redis
    - _Requisitos: NFR-10_
  - [ ] 20.5 Actualizar `docker-compose.yml` con configuración completa: variables de entorno, volúmenes persistentes para postgres, healthchecks, red interna
    - _Requisitos: NFR-10_

- [ ] 21. Checkpoint final — Verificar sistema completo
  - Ejecutar suite completa de tests unitarios e integración. Asegurar que todos los tests pasan. Consultar al usuario si hay dudas antes de hacer merge.


## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints garantizan validación incremental antes de avanzar al siguiente módulo
- Los tests de propiedad validan invariantes universales; los tests unitarios validan casos concretos y edge cases
- El orden de las tareas respeta dependencias: infraestructura → auth → entidades → servicios → controladores → migraciones → tests de integración
