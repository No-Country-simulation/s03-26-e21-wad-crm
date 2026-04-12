# 🔐 Credenciales y Configuración de Base de Datos

## ⚠️ IMPORTANTE - Seguridad

> **NOTA:** Este documento contiene credenciales sensibles. 
> - NO commitear este archivo al repositorio público
> - Agregar a `.gitignore` si es necesario
> - Usar variables de entorno en producción

---

## 🗄️ Servicios de Base de Datos

### PostgreSQL (Datos principales)

| Campo | Valor |
|-------|-------|
| **Host** | `postgres` (interno) / `localhost:5432` (externo) |
| **Puerto** | `5432` |
| **Base de datos** | `crm_db` |
| **Usuario** | `postgres` |
| **Contraseña** | `Pino2026!` |
| **Usuario app** | `crm_user` |
| **Contraseña app** | `crm_pass` |

**Connection String (JDBC):**
```
jdbc:postgresql://postgres:5432/crm_db
```

---

### Redis (Cache y sesiones)

| Campo | Valor |
|-------|-------|
| **Host** | `redis` (interno) / `localhost:6379` (externo) |
| **Puerto** | `6379` |
| **Contraseña** | (sin contraseña) |

---

### MongoDB (Templates y datos flexibles) - NUEVO

| Campo | Valor |
|-------|-------|
| **Host** | `mongodb` (interno) / `localhost:27017` (externo) |
| **Puerto** | `27017` |
| **Base de datos** | `crm_data` |
| **Usuario root** | `mongoadmin` |
| **Contraseña root** | `MongoAdmin2026!` |

**Connection String (Spring Boot):**
```
mongodb://mongoadmin:MongoAdmin2026!@mongodb:27017/crm_data
```

---

## 🔧 Configuración por Entorno

### Desarrollo Local

```bash
# PostgreSQL
export DB_URL=jdbc:postgresql://localhost:5432/crm_db
export DB_USERNAME=crm_user
export DB_PASSWORD=crm_pass

# Redis
export REDIS_HOST=localhost
export REDIS_PORT=6379

# MongoDB
export SPRING_DATA_MONGODB_URI=mongodb://mongoadmin:MongoAdmin2026!@localhost:27017/crm_data
```

### Producción (Docker)

```bash
# Las credenciales se configuran en el docker-compose.yml
# o en variables de entorno del sistema
```

---

## 📁 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_URL` | URL de PostgreSQL | `jdbc:postgresql://postgres:5432/crm_db` |
| `DB_USERNAME` | Usuario PostgreSQL | `crm_user` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `crm_pass` |
| `REDIS_HOST` | Host de Redis | `redis` |
| `REDIS_PORT` | Puerto de Redis | `6379` |
| `SPRING_DATA_MONGODB_URI` | URI de MongoDB | `mongodb://...` |
| `JWT_SECRET` | Clave para JWT | (generar nueva) |
| `ENCRYPTION_KEY` | Clave para encriptación | (generar nueva) |
| `CORS_ORIGINS` | Orígenes permitidos | `http://localhost:5173` |

---

## 🐳 Docker Compose

### Iniciar todos los servicios

```bash
docker-compose up -d
```

### Verificar servicios

```bash
docker-compose ps
```

### Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo PostgreSQL
docker-compose logs -f postgres

# Solo MongoDB
docker-compose logs -f mongodb

# Solo Redis
docker-compose logs -f redis
```

### Detener servicios

```bash
docker-compose down
```

---

## 🧪 Testing de Conexión

### PostgreSQL

```bash
# Desde el host
docker exec -it crm_postgres psql -U postgres -d crm_db -c "SELECT version();"

# Desde otro contenedor
docker exec -it crm_app sh -c "nc -zv postgres 5432"
```

### Redis

```bash
docker exec -it crm_redis redis-cli ping
# Debería responder: PONG
```

### MongoDB

```bash
docker exec -it crm_mongodb mongosh -u mongoadmin -p MongoAdmin2026! --authenticationDatabase admin
# Comando de prueba:
db.adminCommand('ping')
```

---

## 📊 Estructura de MongoDB (Colecciones)

| Colección | Uso |
|-----------|-----|
| `whatsapp_templates` | Plantillas de mensajes WhatsApp |
| `email_templates` | Plantillas de emails |
| `conversation_history` | Historial completo de conversaciones |
| `agent_activity_log` | Bitácora de actividad por agente |
| `audit_logs` | Logs de auditoría |

---

## 🔐 Credenciales por Defecto para Testing

### Usuarios de prueba (definidos en el sistema)

| Rol | Email | Contraseña |
|-----|-------|------------|
| **ADMIN** | admin@nexo.com | admin123 |
| **MANAGER** | manager@nexo.com | manager123 |
| **AGENT** | agent@nexo.com | agent123 |
| **VIEWER** | viewer@nexo.com | viewer123 |

---

## 📝 Notas

1. Las credenciales de PostgreSQL y MongoDB son ejemplos - cambiar en producción
2. Usar Secrets de Docker o Kubernetes en entornos de producción
3. MongoDB se agregó en la versión V19+ del CRM
4. Las migraciones de base de datos se encuentran en `server/src/main/resources/db/migration/`

---

*Documento generado: 2024*
*Proyecto: Nexo CRM*
*Versión: 1.0*