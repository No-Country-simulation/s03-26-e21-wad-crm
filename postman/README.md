# Postman Collection - Startup CRM API

## Archivos

- `Startup_CRM_API.postman_collection.json` - Colección con todos los endpoints
- `Startup_CRM_Env.postman_environment.json` - Variables de entorno

## Importar en Postman

1. Abrir Postman
2. Click en **Import**
3. Arrastrar o seleccionar los archivos JSON
4. Seleccionar el entorno "Startup CRM - Development"

## Orden de Pruebas Sugerido

### 1. Autenticación (Auth)

1. **Register** - Crea usuario y workspace (ejecutar primero)
2. **Login** - Login con credenciales
3. **Refresh Token** - Renovar token (después de que expire)
4. **Logout** - Invalidar tokens

### 2. Contacts

1. **Create Contact** - Crear contacto de prueba
2. **List Contacts** - Ver lista
3. **Get Contact by ID** - Ver detalle
4. **Search Contacts** - Buscar
5. **Update Contact** - Modificar
6. **Add Note** - Agregar nota
7. **List Notes** - Ver notas

### 3. Deals

1. **Create Deal** - Crear negociación
2. **List Deals** - Ver lista
3. **Get Pipelines** - Ver pipelines
4. **Get Pipeline Summary** - Resumen de embudo

### 4. Tasks

1. **Create Task** - Crear tarea
2. **List Tasks** - Ver tareas pendientes
3. **List My Tasks** - Ver mis tareas

### 5. Conversations

1. **List Conversations** - Ver conversaciones
2. **List Messages** - Ver mensajes

### 6. Workspace

1. **Get Current Workspace** - Info del workspace
2. **Update Workspace** - Modificar

### 7. Tags

1. **Create Tag** - Crear etiqueta
2. **List Tags** - Ver todas

### 8. Analytics

1. **Dashboard Overview** - Métricas generales

### 9. Settings

1. **Get Integrations** - Ver integraciones configuradas

## Notas

- Los endpoints protegidos requieren **Bearer Token** (se configura automáticamente)
- `{{contactId}}`, `{{accessToken}}`, etc. son variables automáticas
- Register/L Login se ejecutan solos y guardan los tokens

## Probar Login/Register

```json
// Register
{
    "email": "tuemail@example.com",
    "password": "password123",
    "name": "Tu Nombre"
}

// Login
{
    "email": "tuemail@example.com",
    "password": "password123"
}
```
