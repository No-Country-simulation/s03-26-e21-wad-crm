package com.crm.module.task.scheduler;

import com.crm.module.task.entity.Task;
import com.crm.module.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler que verifica tareas próximas a vencer y emite recordatorios vía WebSocket.
 * Requisitos: 30.1–30.4
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TaskReminderScheduler {

    private final TaskRepository taskRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /** Ventana de anticipación: notificar 15 minutos antes del dueAt. Req 30.2 */
    private static final long REMINDER_WINDOW_MINUTES = 15;

    /**
     * Ejecuta cada 60 segundos. Req 30.4
     * Consulta tareas pendientes con dueAt en los próximos 15 minutos y notifica
     * al usuario asignado vía WebSocket. Omite tareas completadas. Req 30.3
     */
    @Scheduled(fixedRate = 60_000)
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime windowEnd = now.plusMinutes(REMINDER_WINDOW_MINUTES);

        // Req 30.3: solo tareas NO completadas dentro de la ventana de tiempo
        // La query filtra por workspaceId=null aquí porque el scheduler opera globalmente;
        // usamos el método que acepta rango de fechas sin filtro de workspace.
        List<Task> upcoming = taskRepository.findPendingTasksDueWithin(now, windowEnd);

        for (Task task : upcoming) {
            if (task.getAssignedTo() == null) continue;

            TaskReminderNotification notification = new TaskReminderNotification(
                    task.getId(),
                    task.getTitle(),
                    task.getDueAt(),
                    task.getPriority(),
                    task.getContactId(),
                    task.getDealId()
            );

            // Req 30.1: notificación in-app al usuario asignado vía WebSocket
            String destination = "/queue/user/" + task.getAssignedTo() + "/reminders";
            messagingTemplate.convertAndSend(destination, notification);

            log.debug("Reminder sent for task {} to user {}", task.getId(), task.getAssignedTo());
        }
    }
}
