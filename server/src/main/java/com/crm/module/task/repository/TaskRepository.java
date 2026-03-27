package com.crm.module.task.repository;

import com.crm.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repositorio JPA para la entidad Task.
 * JpaSpecificationExecutor permite filtros dinámicos combinados.
 * Requisitos: 27.1, 28.2, 30.4
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {

    /** Tareas pendientes de un workspace con dueAt en un rango. Req 28.2 */
    List<Task> findByWorkspaceIdAndCompletedFalseAndDueAtBetween(
            UUID workspaceId,
            LocalDateTime from,
            LocalDateTime to
    );

    /**
     * Tareas pendientes (no completadas) con dueAt dentro de la ventana de tiempo,
     * usadas por el scheduler global de recordatorios. Req 30.3, 30.4
     */
    @Query("SELECT t FROM Task t WHERE t.completed = false AND t.dueAt >= :from AND t.dueAt <= :to")
    List<Task> findPendingTasksDueWithin(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}
