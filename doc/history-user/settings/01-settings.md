# HU-100: Configurar Perfil de Usuario

**Módulo**: Settings  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: configurar mi perfil  
**Para**: mantener mis datos actualizados

## Criterios de Aceptación

- [ ] Sección "Mi Perfil" en settings
- [ ] Editar: nombre, avatar, teléfono
- [ ] Cambiar contraseña
- [ ] Configurar zona horaria
- [ ] Configurar idioma

---

# HU-101: Configuración del Workspace

**Módulo**: Settings  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: configurar los datos de mi empresa/workspace  
**Para**: personalizar el CRM

## Criterios de Aceptación

- [ ] Sección "Workspace" en settings (solo Admin)
- [ ] Editar: nombre del workspace, logo, website
- [ ] Configurar timezone del workspace
- [ ] Ver información del plan

---

# HU-102: Gestionar Roles de Usuario

**Módulo**: Settings  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: gestionar los roles de los usuarios  
**Para**: mantener la seguridad del sistema

## Criterios de Aceptación

- [ ] Ver lista de usuarios con sus roles
- [ ] Cambiar rol de usuario
- [ ] Ver historial de cambios de rol
- [ ] No se puede quitar Admin al único administrador

---

# HU-103: Configurar Pipeline (Etapas)

**Módulo**: Settings  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: personalizar las etapas del pipeline  
**Para**: adaptar a mi proceso de ventas

## Criterios de Aceptación

- [ ] CRUD de etapas
- [ ] Reordenar etapas (drag & drop)
- [ ] Color por etapa
- [ ] Valores por defecto por etapa
- [ ] No eliminar con deals activos

---

# HU-104: Gestionar Campos Personalizados

**Módulo**: Settings  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: agregar campos personalizados a contactos  
**Para**: guardar información específica

## Criterios de Aceptación

- [ ] Crear campo personalizado en contacto
- [ ] Tipos: texto, número, fecha, dropdown, checkbox
- [ ] Hacer campo requerido o no
- [ ] Editar y eliminar campos
- [ ] Aplica a todos los contactos

---

# HU-105: Configurar Notificaciones

**Módulo**: Settings  
**Prioridad**: Media  
**Como**: usuario  
**Quiero**: configurar qué notificaciones recibo  
**Para**: evitar ruido innecesario

## Criterios de Aceptación

- [ ] Toggle por tipo de notificación
- [ ] Notificaciones in-app: nuevos leads, deals, mensajes
- [ ] Notificaciones por email: resumen diario, etc.
- [ ] Sonido de notificaciones (on/off)

---

# HU-106: Ver/bitacora de Actividad

**Módulo**: Settings  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: ver un log de todas las acciones  
**Para**: auditoría de uso

## Criterios de Aceptación

- [ ] Sección "Auditoría" (solo Admin)
- [ ] Lista de acciones: login, crear, editar, eliminar
- [ ] Filtrable por usuario, acción, fecha
- [ ] Retención de logs: 90 días

---

# HU-107: Integraciones del Workspace

**Módulo**: Settings  
**Prioridad**: Alta  
**Como**: administrador  
**Quiero**: gestionar las integraciones conectadas  
**Para**: administrar los canales

## Criterios de Aceptación

- [ ] Lista de integraciones: WhatsApp, Email, Google Calendar
- [ ] Estado de cada integración
- [ ] Conectar/desconectar
- [ ] Recargar tokens si es necesario

---

# HU-108: Gestión deEtiquetas Globales

**Módulo**: Settings  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: gestionar las etiquetas disponibles  
**Para**: mantener consistencia

## Criterios de Aceptación

- [ ] Lista de todas las etiquetas del workspace
- [ ] Crear, editar, eliminar etiquetas
- [ ] Ver cuántos contactos usan cada etiqueta
- [ ] No eliminar si está en uso (mostrar warning)
