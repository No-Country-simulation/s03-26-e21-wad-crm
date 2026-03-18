# HU-010: Crear Contacto

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: agregar un nuevo contacto manualmente  
**Para**: registrar un lead o cliente potencial

## Criterios de Aceptación

- [ ] Formulario con campos: nombre, email, teléfono, empresa, cargo
- [ ] Validación de email único dentro del workspace
- [ ] Al crear, se asigna estado inicial "Nuevo"
- [ ] Se registra fecha y usuario creador
- [ ] Retorna a lista de contactos con el nuevo visible

---

# HU-011: Importar Contactos desde CSV

**Módulo**: Contacts  
**Prioridad**: Media  
**Como**: administrador  
**Quiero**: importar contactos desde archivo CSV  
**Para**: migrar mi base de datos existente

## Criterios de Aceptación

- [ ] Botón "Importar CSV" visible para Admin/Manager
- [ ] Upload de archivo CSV con preview de primeras 10 filas
- [ ] Mapeo de columnas (arrastrar-matching)
- [ ] Validación de datos (email requerido, formato teléfono)
- [ ] Reporte de contactos creados vs errores
- [ ] Soporte para 1000+ contactos

---

# HU-012: Editar Contacto

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: editar la información de un contacto  
**Para**: mantener los datos actualizados

## Criterios de Aceptación

- [ ] Botón "Editar" visible en fila de contacto
- [ ] Formulario prellenado con datos actuales
- [ ] Validación de email único (excluyendo actual)
- [ ] Se registra historial de cambios
- [ ] Notificación de guardado exitoso

---

# HU-013: Eliminar Contacto

**Módulo**: Contacts  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: eliminar un contacto  
**Para**: mantener mi base de datos limpia

## Criterios de Aceptación

- [ ] Botón "Eliminar" visible para Admin/Manager
- [ ] Modal de confirmación antes de eliminar
- [ ] Soft delete (no se borra físicamente)
- [ ] Contacto desaparece de vistas activas
- [ ] Admin puede restaurar desde papelera

---

# HU-014: Buscar Contacto

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: buscar un contacto por nombre, email o teléfono  
**Para**: encontrar rápidamente un registro

## Criterios de Aceptación

- [ ] Barra de búsqueda en header de lista de contactos
- [ ] Búsqueda en tiempo real (mínimo 2 caracteres)
- [ ] Busca en: nombre, email, teléfono, empresa
- [ ] Resultados highlighteados
- [ ] Si solo 1 resultado, redirige al detalle

---

# HU-015: Filtrar Contactos por Estado

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: filtrar contactos por su estado en el funnel  
**Para**: enfocarme en mis leads activos

## Criterios de Aceptación

- [ ] Dropdown de filtros en lista de contactos
- [ ] Filtros por estado: Nuevo, Contactado, Calificado, Perdido, Convertido
- [ ] Filtros por tags (múltiples)
- [ ] Filtros por usuario asignado
- [ ] Filtros combinados (AND)
- [ ] Filter badge muestra filtros activos

---

# HU-016: Asignar Contacto a Usuario

**Módulo**: Contacts  
**Prioridad**: Media  
**Como**: manager  
**Quiero**: asignar un contacto a un vendedor  
**Para**: distribuir leads al equipo

## Criterios de Aceptación

- [ ] Dropdown "Asignar a" en detalle de contacto
- [ ] Lista de usuarios del workspace
- [ ] Se registra quién asignó y cuándo
- [ ] Notificación al vendedor asignado (opcional)
- [ ] Vista de "Mis Contactos" muestra solo asignados

---

# HU-017: Agregar Nota a Contacto

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: agregar una nota a un contacto  
**Para**: registrar información relevante de la conversación

## Criterios de Aceptación

- [ ] Campo de notas en detalle del contacto
- [ ] Editor de texto básico (bold, italic, listas)
- [ ] Se registra fecha y autor de cada nota
- [ ] Historial de notas visible en timeline
- [ ] Notas visibles para todos con acceso al contacto

---

# HU-018: Crear Etiqueta (Tag)

**Módulo**: Contacts  
**Prioridad**: Media  
**Como**: usuario  
**Quiero**: crear etiquetas personalizadas  
**Para**: segmentar mis contactos

## Criterios de Aceptación

- [ ] Botón "Nueva Etiqueta" en sección de tags
- [ ] Selector de color para la etiqueta
- [ ] Nombre único dentro del workspace
- [ ] Etiqueta disponible para todos los contactos
- [ ] Editar y eliminar etiquetas existentes

---

# HU-019: Ver Detalle de Contacto

**Módulo**: Contacts  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: ver toda la información de un contacto  
**Para**: entender el historial y contexto

## Criterios de Aceptación

- [ ] Click en contacto abre panel/drawer de detalle
- [ ] Muestra: datos básicos, empresa, etiquetas, notas, historial
- [ ] Muestra: conversaciones asociadas
- [ ] Muestra: deals asociados
- [ ] Muestra: actividad reciente (tareas, llamadas, emails)
- [ ] Acciones rápidas: editar, crear deal, enviar mensaje
