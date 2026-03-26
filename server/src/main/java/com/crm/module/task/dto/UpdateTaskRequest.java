package com.crm.module.task.dto;

import com.crm.module.task.entity.TaskPriority;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para actualizar una tarea (campos opcionales). Requisitos: 29.4
 */
public record UpdateTaskRequest(
        String title,
        String description,
        TaskPriority priority,
        LocalDateTime dueAt,
        UUID assignedTo,
        Boolean isCompleted
) {}
