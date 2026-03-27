package com.crm.module.task.controller;

import com.crm.module.task.dto.CreateTaskRequest;
import com.crm.module.task.dto.TaskDto;
import com.crm.module.task.dto.TaskFilterRequest;
import com.crm.module.task.dto.UpdateTaskRequest;
import com.crm.module.task.entity.TaskPriority;
import com.crm.module.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador de tareas.
 * Requisitos: 27.1, 28.1, 29.1, 29.4
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
public class TaskController {

    private final TaskService taskService;

    /**
     * POST /api/tasks — crea una tarea. Req 27.1
     */
    @PostMapping
    public ResponseEntity<TaskDto> create(
            @Valid @RequestBody CreateTaskRequest request,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        UUID userId = extractUserId(principal);
        TaskDto created = taskService.create(request, workspaceId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/tasks — lista tareas con filtros y paginación. Req 28.1
     */
    @GetMapping
    public ResponseEntity<Page<TaskDto>> list(
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) UUID assignedTo,
            @RequestParam(defaultValue = "false") boolean assignedToMe,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) UUID contactId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueBefore,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dueAfter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        UUID userId = extractUserId(principal);

        TaskFilterRequest filter = new TaskFilterRequest(
                completed, assignedTo, assignedToMe, priority, contactId, dueBefore, dueAfter);

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueAt"));
        return ResponseEntity.ok(taskService.list(filter, workspaceId, userId, pageable));
    }

    /**
     * PATCH /api/tasks/{id} — actualiza una tarea. Req 29.4
     */
    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateTaskRequest request,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        UUID userId = extractUserId(principal);
        return ResponseEntity.ok(taskService.update(id, request, workspaceId, userId));
    }

    /**
     * PATCH /api/tasks/{id}/complete — marca la tarea como completada. Req 29.1
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskDto> complete(
            @PathVariable UUID id,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        UUID userId = extractUserId(principal);
        return ResponseEntity.ok(taskService.complete(id, workspaceId, userId));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private UUID extractWorkspaceId(Principal principal) {
        return extractClaim(principal, "workspaceId");
    }

    private UUID extractUserId(Principal principal) {
        return extractClaim(principal, "userId");
    }

    private UUID extractClaim(Principal principal, String claim) {
        if (principal == null) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        try {
            var auth = (org.springframework.security.core.Authentication) principal;
            Object details = auth.getDetails();
            if (details instanceof Map<?, ?> map && map.containsKey(claim)) {
                return UUID.fromString(map.get(claim).toString());
            }
        } catch (Exception ignored) {
            // fall through
        }
        throw new IllegalStateException(
                "'" + claim + "' no disponible en el contexto. Asegúrese de que WorkspaceFilter esté configurado.");
    }
}
