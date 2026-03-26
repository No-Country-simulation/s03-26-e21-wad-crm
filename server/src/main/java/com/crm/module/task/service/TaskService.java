package com.crm.module.task.service;

import com.crm.module.task.dto.CreateTaskRequest;
import com.crm.module.task.dto.TaskDto;
import com.crm.module.task.dto.TaskFilterRequest;
import com.crm.module.task.dto.UpdateTaskRequest;
import com.crm.module.task.entity.Task;
import com.crm.module.task.entity.TaskPriority;
import com.crm.module.task.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de gestión de tareas.
 * Requisitos: 27.1–27.6, 28.1–28.4, 29.1–29.4
 */
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Crea una tarea. Si assignedTo no se especifica, se asigna al creador. Req 27.1, 27.5
     */
    @Transactional
    public TaskDto create(CreateTaskRequest request, UUID workspaceId, UUID currentUserId) {
        Task task = new Task();
        task.setWorkspaceId(workspaceId);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM);
        task.setDueAt(request.dueAt());
        task.setContactId(request.contactId());
        task.setDealId(request.dealId());
        // Req 27.5: asignar al creador si no se especifica assignedTo
        task.setAssignedTo(request.assignedTo() != null ? request.assignedTo() : currentUserId);
        return toDto(taskRepository.save(task));
    }

    /**
     * Lista tareas con filtros dinámicos y paginación. Req 28.1–28.4
     */
    @Transactional(readOnly = true)
    public Page<TaskDto> list(TaskFilterRequest filter, UUID workspaceId, UUID currentUserId, Pageable pageable) {
        Specification<Task> spec = Specification.where(byWorkspace(workspaceId));

        if (filter.completed() != null) {
            spec = spec.and(byCompleted(filter.completed()));
        }
        // Req 28.3: assignedTo=me → filtrar por usuario autenticado
        if (filter.assignedToMe()) {
            spec = spec.and(byAssignedTo(currentUserId));
        } else if (filter.assignedTo() != null) {
            spec = spec.and(byAssignedTo(filter.assignedTo()));
        }
        if (filter.priority() != null) {
            spec = spec.and(byPriority(filter.priority()));
        }
        if (filter.contactId() != null) {
            spec = spec.and(byContact(filter.contactId()));
        }
        if (filter.dueAfter() != null) {
            spec = spec.and(dueAfter(filter.dueAfter()));
        }
        if (filter.dueBefore() != null) {
            spec = spec.and(dueBefore(filter.dueBefore()));
        }

        return taskRepository.findAll(spec, pageable).map(this::toDto);
    }

    /**
     * Actualiza campos de una tarea. Req 29.4 (uncomplete via isCompleted=false)
     */
    @Transactional
    public TaskDto update(UUID taskId, UpdateTaskRequest request, UUID workspaceId, UUID currentUserId) {
        Task task = findByIdAndWorkspace(taskId, workspaceId);

        if (request.title() != null) task.setTitle(request.title());
        if (request.description() != null) task.setDescription(request.description());
        if (request.priority() != null) task.setPriority(request.priority());
        if (request.dueAt() != null) task.setDueAt(request.dueAt());
        if (request.assignedTo() != null) task.setAssignedTo(request.assignedTo());

        // Req 29.4: desmarcar tarea completada limpia completedAt
        if (Boolean.FALSE.equals(request.isCompleted()) && task.isCompleted()) {
            task.setCompleted(false);
            task.setCompletedAt(null);
            task.setCompletedBy(null);
        }

        return toDto(taskRepository.save(task));
    }

    /**
     * Marca una tarea como completada. Idempotente si ya está completada. Req 29.1, 29.2
     */
    @Transactional
    public TaskDto complete(UUID taskId, UUID workspaceId, UUID currentUserId) {
        Task task = findByIdAndWorkspace(taskId, workspaceId);

        // Req 29.2: idempotente — no modificar si ya está completada
        if (!task.isCompleted()) {
            task.setCompleted(true);
            task.setCompletedAt(LocalDateTime.now());
            task.setCompletedBy(currentUserId);
            taskRepository.save(task);
        }

        return toDto(task);
    }

    /**
     * Desmarca una tarea completada. Req 29.4
     */
    @Transactional
    public TaskDto uncomplete(UUID taskId, UUID workspaceId) {
        Task task = findByIdAndWorkspace(taskId, workspaceId);
        task.setCompleted(false);
        task.setCompletedAt(null);
        task.setCompletedBy(null);
        return toDto(taskRepository.save(task));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task findByIdAndWorkspace(UUID taskId, UUID workspaceId) {
        return taskRepository.findById(taskId)
                .filter(t -> t.getWorkspaceId().equals(workspaceId))
                .orElseThrow(() -> new EntityNotFoundException("Tarea no encontrada: " + taskId));
    }

    // ── Specifications ────────────────────────────────────────────────────────

    private static Specification<Task> byWorkspace(UUID workspaceId) {
        return (root, q, cb) -> cb.equal(root.get("workspaceId"), workspaceId);
    }

    private static Specification<Task> byCompleted(boolean completed) {
        return (root, q, cb) -> cb.equal(root.get("completed"), completed);
    }

    private static Specification<Task> byAssignedTo(UUID userId) {
        return (root, q, cb) -> cb.equal(root.get("assignedTo"), userId);
    }

    private static Specification<Task> byPriority(TaskPriority priority) {
        return (root, q, cb) -> cb.equal(root.get("priority"), priority);
    }

    private static Specification<Task> byContact(UUID contactId) {
        return (root, q, cb) -> cb.equal(root.get("contactId"), contactId);
    }

    private static Specification<Task> dueAfter(LocalDateTime after) {
        return (root, q, cb) -> cb.greaterThanOrEqualTo(root.get("dueAt"), after);
    }

    private static Specification<Task> dueBefore(LocalDateTime before) {
        return (root, q, cb) -> cb.lessThanOrEqualTo(root.get("dueAt"), before);
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private TaskDto toDto(Task t) {
        return new TaskDto(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getPriority(),
                t.getDueAt(),
                t.isCompleted(),
                t.getCompletedAt(),
                t.getCompletedBy(),
                t.getContactId(),
                t.getDealId(),
                t.getAssignedTo(),
                t.getWorkspaceId(),
                t.getCreatedAt(),
                t.getUpdatedAt()
        );
    }
}
