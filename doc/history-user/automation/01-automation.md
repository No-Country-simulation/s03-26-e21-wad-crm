# HU-080: Crear Automatización (Workflow)

**Módulo**: Automation  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: crear una automatización  
**Para**: reducir trabajo manual

## Criterios de Aceptación

- [ ] Sección "Automatizaciones" en settings
- [ ] Constructor visual (if this → that)
- [ ] Triggers disponibles: contacto creado, deal movido, tarea completada, etc.
- [ ] Acciones disponibles: cambiar etapa, asignar usuario, enviar email, crear tarea
- [ ] Guardar y activar automatización
- [ ] Ver automatizaciones existentes

---

# HU-081: Trigger: Contacto en Estado X

**Módulo**: Automation  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: que ocurra una acción cuando un contacto cambia de estado  
**Para**: automatizar seguimientos

## Criterios de Aceptación

- [ ] Trigger: "Cuando contacto cambia a [estado]"
- [ ] Acción: enviar email de bienvenida, crear tarea, asignar a usuario
- [ ] Logs de ejecución visibles

---

# HU-082: Trigger: Deal en Etapa Y

**Módulo**: Automation  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: automatizar acciones cuando un deal avanza  
**Para**: mover el proceso automáticamente

## Criterios de Aceptación

- [ ] Trigger: "Cuando deal entra a [etapa]"
- [ ] Acción: enviar propuesta, notificar manager, crear tarea de seguimiento

---

# HU-083: Email Automático de Bienvenida

**Módulo**: Automation  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: enviar email automático cuando se crea un nuevo contacto  
**Para**: dar la bienvenida automáticamente

## Criterios de Aceptación

- [ ] Plantilla de email de bienvenida predefinida
- [ ] Configurable por workspace
- [ ] Delay opcional (ej: 1 hora después)
- [ ] Métricas: cuántos enviados, abiertos

---

# HU-084: Notificación de Deal Ganado

**Módulo**: Automation  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: notificar al equipo cuando se cierra un deal  
**Para**: celebrar wins

## Criterios de Aceptación

- [ ] Trigger: "Cuando deal pasa a Cerrado Ganado"
- [ ] Acción: enviar email a equipo, mostrar notificación in-app
- [ ] Mensaje personalizable

---

# HU-085: Desactivar/Activar Automatización

**Módulo**: Automation  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: pausar una automatización temporalmente  
**Para**: hacer mantenimiento o pruebas

## Criterios de Aceptación

- [ ] Toggle en cada automatización
- [ ] Historial de ejecuciones
- [ ] Logs de errores
