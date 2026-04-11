package com.crm.module.task.controller;

import com.crm.common.security.WorkspaceContext;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @PostMapping
    public ResponseEntity<TaskDto> create(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UUID userId) {
        TaskDto created = taskService.create(request, WorkspaceContext.getWorkspaceId(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

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
            @AuthenticationPrincipal UUID userId) {

        TaskFilterRequest filter = new TaskFilterRequest(
                completed, assignedTo, assignedToMe, priority, contactId, dueBefore, dueAfter);

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "dueAt"));
        return ResponseEntity.ok(taskService.list(filter, WorkspaceContext.getWorkspaceId(), userId, pageable));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> update(
            @PathVariable UUID id,
            @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(taskService.update(id, request, WorkspaceContext.getWorkspaceId(), userId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskDto> complete(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(taskService.complete(id, WorkspaceContext.getWorkspaceId(), userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id) {
        taskService.delete(id, WorkspaceContext.getWorkspaceId());
        return ResponseEntity.noContent().build();
    }
}
