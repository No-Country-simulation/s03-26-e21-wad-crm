package com.crm.module.task.dto;

import com.crm.module.task.entity.TaskPriority;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de respuesta para una tarea. Requisitos: 28.4
 */
public record TaskDto(
        UUID id,
        String title,
        String description,
        TaskPriority priority,
        LocalDateTime dueAt,
        boolean isCompleted,
        LocalDateTime completedAt,
        UUID completedBy,
        UUID contactId,
        UUID dealId,
        UUID assignedTo,
        UUID workspaceId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
