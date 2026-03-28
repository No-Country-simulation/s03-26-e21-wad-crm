package com.crm.module.task.dto;

import com.crm.module.task.entity.TaskPriority;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Parámetros de filtro para listar tareas. Requisitos: 28.2, 28.3
 */
public record TaskFilterRequest(
        Boolean completed,
        UUID assignedTo,
        boolean assignedToMe,
        TaskPriority priority,
        UUID contactId,
        LocalDateTime dueBefore,
        LocalDateTime dueAfter
) {}
