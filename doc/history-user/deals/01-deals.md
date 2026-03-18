# HU-030: Crear Deal (Oportunidad)

**Módulo**: Deals  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: crear una oportunidad de venta  
**Para**: hacer seguimiento de un negocio potencial

## Criterios de Aceptación

- [ ] Botón "Nuevo Deal" visible en kanban
- [ ] Formulario con campos: nombre, contacto, empresa, valor, etapa
- [ ] Etapas por defecto: Lead, Contactado, Propuesta, Negociación, Cerrado Ganado, Cerrado Perdido
- [ ] Se registra fecha de creación
- [ ] Se registra usuario creador
- [ ] Aparece en kanban en la etapa seleccionada

---

# HU-031: Mover Deal entre Etapas (Kanban)

**Módulo**: Deals  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: mover un deal a otra etapa  
**Para**: actualizar el estado del negocio

## Criterios de Aceptación

- [ ] Vista kanban con columnas por etapa
- [ ] Drag & drop para mover deals
- [ ] Al mover, se registra fecha y usuario
- [ ] Notificación cuando deal cambia de etapa (opcional)
- [ ] Historia de movimientos visible en detalle

---

# HU-032: Editar Deal

**Módulo**: Deals  
**Prioridad**: Alta  
**Como**: vendedor  
**Quiero**: editar los datos de un deal  
**Para**: actualizar información del negocio

## Criterios de Aceptación

- [ ] Click en deal abre modal de edición
- [ ] Editar: nombre, valor, etapa, contacto, empresa, fecha cierre esperada
- [ ] Se registra historial de cambios
- [ ] Validación de valores (valor > 0, fecha no pasado)

---

# HU-033: Eliminar Deal

**Módulo**: Deals  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: eliminar un deal  
**Para**: limpiar oportunidades inactivas

## Criterios de Aceptación

- [ ] Menú contextual con opción eliminar
- [ ] Modal de confirmación
- [ ] Soft delete con opción de restaurar
- [ ] Se elimina de todas las vistas
- [ ] Se mantiene historial para reportes

---

# HU-034: Filtrar Deals

**Módulo**: Deals  
**Prioridad**: Media  
**Como**: manager  
**Quiero**: filtrar deals por etapa, valor, fecha  
**Para**: analizar el pipeline

## Criterios de Aceptación

- [ ] Filtros en header del kanban
- [ ] Filtro por etapa (múltiples)
- [ ] Filtro por valor (rango)
- [ ] Filtro por fecha de cierre esperada
- [ ] Filtro por usuario asignado
- [ ] Filtros combinados (AND)

---

# HU-035: Ver Pipeline (Kanban)

**Módulo**: Deals  
**Prioridad**: Alta  
**Como**: usuario  
**Quiero**: ver el pipeline de ventas en vista kanban  
**Para**: visualizar el estado de mis oportunidades

## Criterios de Aceptación

- [ ] Columnas por etapa (configurable)
- [ ] Cards muestran: nombre deal, valor, contacto, días en etapa
- [ ] Count de deals por etapa
- [ ] Sumatoria de valores por etapa
- [ ] Vista total del pipeline visible

---

# HU-036: Calcular Valor del Pipeline

**Módulo**: Deals  
**Prioridad**: Alta  
**Como**: manager  
**Quiero**: ver el valor total del pipeline  
**Para**: entender el potencial de ventas

## Criterios de Aceptación

- [ ] Header muestra valor total de deals en pipeline
- [ ] Valor por etapa en el kanban
- [ ] Valor de deals ganados en período
- [ ] Valor de deals perdidos en período

---

# HU-037: Asignar Deal a Usuario

**Módulo**: Deals  
**Prioridad**: Media  
**Como**: manager  
**Quiero**: asignar un deal a un vendedor  
**Para**: distribuir oportunidades al equipo

## Criterios de Aceptación

- [ ] Dropdown "Asignar a" en detalle de deal
- [ ] Lista de usuarios del workspace
- [ ] Se registra asignación en historial
- [ ] Vista de "Mis Deals" filtra por usuario

---

# HU-038: Crear Etapa Personalizada

**Módulo**: Deals  
**Prioridad**: Baja  
**Como**: administrador  
**Quiero**: personalizar las etapas del pipeline  
**Para**: adaptar a mi proceso de ventas

## Criterios de Aceptación

- [ ] Settings permite crear/editar/eliminar etapas
- [ ] Drag & drop para reordenar etapas
- [ ] Color configurable por etapa
- [ ] Etapa "Cerrado Ganado" y "Cerrado Perdido" siempre presentes
- [ ] No se puede eliminar etapa con deals activos
