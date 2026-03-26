package com.crm.module.task.scheduler;

import com.crm.module.task.entity.TaskPriority;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payload de notificación de recordatorio enviado vía WebSocket. Req 30.1
 */
public record TaskReminderNotification(
        UUID taskId,
        String title,
        LocalDateTime dueAt,
        TaskPriority priority,
        UUID contactId,
        UUID dealId
) {}
