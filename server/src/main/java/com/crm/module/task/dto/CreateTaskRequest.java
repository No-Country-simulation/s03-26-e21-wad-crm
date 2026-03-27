package com.crm.module.task.dto;

import com.crm.module.task.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO para crear una tarea. Requisitos: 27.1–27.6
 */
public record CreateTaskRequest(
        @NotBlank String title,
        String description,
        TaskPriority priority,
        @NotNull LocalDateTime dueAt,
        @NotNull UUID contactId,
        UUID dealId,
        UUID assignedTo
) {}
