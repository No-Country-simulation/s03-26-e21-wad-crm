# HU-060: Crear Tarea

**Módulo**: Tasks  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: crear una tarea asociada a un contacto  
**Para**: recordar hacer seguimiento

## Criterios de Aceptación

- [ ] Botón "Nueva Tarea" visible en detalle de contacto
- [ ] Formulario: título, descripción, fecha/hora, prioridad
- [ ] Selector de contacto (prellenado si es desde contacto)
- [ ] Selector de usuario asignado (por defecto, el creador)
- [ ] Al crear, aparece en lista de tareas
- [ ] Notificación/reminder configurable

---

# HU-061: Ver Lista de Tareas

**Módulo**: Tasks  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: ver todas mis tareas pendientes  
**Para**: organizar mi día

## Criterios de Aceptación

- [ ] Vista de lista de tareas (no kanban)
- [ ] Filtros: hoy, esta semana, todas, completadas
- [ ] Filtros por: usuario asignado, prioridad, contacto
- [ ] Orden por: fecha, prioridad, creado
- [ ] Muestra: título, contacto, fecha, prioridad
- [ ] Checkbox para completar

---

# HU-062: Completar Tarea

**Módulo**: Tasks  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: marcar una tarea como completada  
**Para**: registrar que hice la actividad

## Criterios de Aceptación

- [ ] Checkbox en cada tarea
- [ ] Click marca como completada
- [ ] Se registra: fecha de completado, usuario que completó
- [ ] Tarea movida a vista "completadas"
- [ ] Notificación de tarea completada (si fue asignada por otro)

---

# HU-063: Editar Tarea

**Módulo**: Tasks  
**Prioridad**: Media  
**Como**: usuario  
**Quiero**: modificar una tarea  
**Para**: ajustar detalles o corregir errores

## Criterios de Aceptación

- [ ] Click en tarea abre modal de edición
- [ ] Editar: título, descripción, fecha, prioridad, asignado
- [ ] Se registra historial de cambios
- [ ] Validación: fecha no en pasado para recordatorio

---

# HU-064: Eliminar Tarea

**Módulo**: Tasks  
**Prioridad**: Baja  
**Como**: usuario  
**Quiero**: eliminar una tarea  
**Para**: cancelar algo que ya no necesito

## Criterios de Aceptación

- [ ] Menú contextual con opción eliminar
- [ ] Confirmación requerida
- [ ] Eliminación permanente (no soft delete para tareas)

---

# HU-065: Recordatorio de Tarea

**Módulo**: Tasks  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: recibir recordatorio de mis tareas  
**Para**: no olvidar hacerlas

## Criterios de Aceptación

- [ ] Notificación in-app al momento de la tarea
- [ ] Notificación 15 min antes (configurable)
- [ ] Notificación por email para tareas del día
- [ ] Badge de tareas pendientes en sidebar
- [ ] Vista "Tareas de Hoy" destaca las del día

---

# HU-066: Reasignar Tarea

**Módulo**: Tasks  
**Prioridad**: Media  
**Como**: manager  
**Quiero**: reasignar una tarea a otro usuario  
**Para**: redistribuir trabajo

## Criterios de Aceptación

- [ ] Dropdown "Asignar a" en detalle de tarea
- [ ] Lista de usuarios del workspace
- [ ] Notificación al nuevo asignado
- [ ] Historial de cambios de asignación
- [ ] Solo Admin/Manager puede reasignar tareas de otros

---

# HU-067: Tareas Automáticas (Follow-up)

**Módulo**: Tasks  
**Prioridad**: Media  
**Como**: sistema  
**Quiero**: crear tareas automáticamente tras eventos  
**Para**: automatizar seguimientos

## Criterios de Aceptación

- [ ] Regla: luego de email enviado sin respuesta en X días → crear tarea
- [ ] Regla: luego de deal en etapa "Propuesta" por Y días → crear tarea
- [ ] Regla: luego de contacto sin actividad en Z días → crear tarea
- [ ] Configurable por Admin en sección de automation
