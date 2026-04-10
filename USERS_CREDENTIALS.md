# 🔐 Users & Credentials - Startup CRM

## ⚠️ IMPORTANTE
Estos usuarios están en la BD local (Docker PostgreSQL). 
**NO COMPARTIR estos datos en repositorio público**.

---

## 👥 Current Users

| Email | Role | Password | Status |
|-------|------|----------|--------|
| `admin@test.com` | ADMIN | ❌ Unknown (set during registration) | Active |
| `dc@gmail.com` | ADMIN | ❌ Unknown (set during registration) | Active |
| `cj@gmail.com` | AGENT | ❌ Unknown (set during registration) | Active |

---

## 🛠️ How to reset a password

Si necesitás resetear un password, podés:

### Opción 1: Registrar un nuevo usuario
```bash
# Backend running on port 8080
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "password": "SecurePass123!",
    "name": "Test User"
  }'
```

### Opción 2: Resetear en BD (desarrollo)
```bash
# Connect to PostgreSQL
docker exec -it crm_postgres psql -U postgres -d crm_db

# View users
SELECT email, password_hash FROM users;

# Manually update password (generate new bcrypt hash)
UPDATE users SET password_hash = '<new_bcrypt_hash>' WHERE email = 'user@email.com';
```

---

## 🔍 To view hashed passwords in BD

```bash
docker exec crm_postgres psql -U postgres -d crm_db -c "SELECT email, role, password_hash FROM users;"
```

---

## 📝 To create test users programmatically

See `server/src/test/resources/test-data.sql` or use the `/api/auth/register` endpoint.


---

## 🆕 Create new admin user with known password

Si querés crear un admin nuevo con password que sepas, corrés esto:

```bash
# 1. Generar bcrypt hash del password (install bcrypt-cli si no lo tenés)
# Para "AdminPass123!" → $2a$10$...
npm install -g bcrypt-cli
bcrypt "AdminPass123!"

# 2. Insert en BD
docker exec crm_postgres psql -U postgres -d crm_db << 'SQL'
INSERT INTO users (id, workspace_id, email, password_hash, name, timezone, role, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM workspaces LIMIT 1),
  'admin-new@test.com',
  '$2a$10$...',  -- ← Reemplazar con bcrypt hash
  'New Admin',
  'UTC',
  'ADMIN',
  true,
  now(),
  now()
);
SQL
```

---

## 📊 Migration Status

✅ **V17 Migration Updated** - Agora mapea MANAGER → AGENT role
⏳ **Backend rebuild necesario** - Para ejecutar V17 en BD

