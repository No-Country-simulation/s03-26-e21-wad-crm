package com.crm.module.task;

import com.crm.module.task.dto.TaskDto;
import com.crm.module.task.entity.Task;
import com.crm.module.task.entity.TaskPriority;
import com.crm.module.task.repository.TaskRepository;
import com.crm.module.task.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Propiedad 14: task.isCompleted=true → task.completedAt != null siempre.
 *
 * Para toda tarea T: si T.isCompleted == true, entonces T.completedAt != null.
 * La invariante se verifica:
 *   1. Sobre objetos Task construidos directamente (propiedad estructural).
 *   2. Después de llamar a TaskService.complete() (propiedad de comportamiento).
 *
 * Validates: Requisito 29.1
 */
@ExtendWith(MockitoExtension.class)
class TaskCompletionInvariantTest {

    @Mock
    TaskRepository taskRepository;

    @InjectMocks
    TaskService taskService;

    private UUID workspaceId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        userId = UUID.randomUUID();
    }

    // ── Generators ────────────────────────────────────────────────────────────

    /**
     * Genera tareas incompletas con distintas combinaciones de prioridad y dueAt
     * para cubrir el espacio de entrada de la propiedad.
     */
    static Stream<Arguments> incompleteTasks() {
        LocalDateTime now = LocalDateTime.now();
        return Stream.of(
                Arguments.of(TaskPriority.LOW,    now.plusDays(1)),
                Arguments.of(TaskPriority.MEDIUM, now.plusDays(3)),
                Arguments.of(TaskPriority.HIGH,   now.plusHours(2)),
                Arguments.of(TaskPriority.URGENT, now.minusDays(1)),  // vencida
                Arguments.of(TaskPriority.MEDIUM, null)               // sin fecha límite
        );
    }

    /**
     * Genera tareas ya completadas (isCompleted=true, completedAt != null)
     * para verificar la idempotencia de complete().
     */
    static Stream<Arguments> alreadyCompletedTasks() {
        LocalDateTime now = LocalDateTime.now();
        return Stream.of(
                Arguments.of(TaskPriority.LOW,    now.minusDays(2), now.minusDays(1)),
                Arguments.of(TaskPriority.HIGH,   now.minusHours(5), now.minusHours(1)),
                Arguments.of(TaskPriority.URGENT, now.minusDays(10), now.minusDays(9))
        );
    }

    // ── Propiedad 14: invariante estructural ──────────────────────────────────

    /**
     * Propiedad 14 — invariante estructural:
     * Un objeto Task con isCompleted=true construido directamente
     * debe tener completedAt != null para satisfacer la invariante.
     *
     * Validates: Requisito 29.1
     */
    @ParameterizedTest(name = "priority={0}, dueAt={1}")
    @MethodSource("incompleteTasks")
    @DisplayName("Propiedad 14: Task con isCompleted=true debe tener completedAt != null (invariante estructural)")
    void property14_completedTaskMustHaveCompletedAt_structural(
            TaskPriority priority, LocalDateTime dueAt) {

        // Arrange — construir tarea y marcarla como completada manualmente
        Task task = buildTask(priority, dueAt);
        LocalDateTime completedAt = LocalDateTime.now();

        task.setCompleted(true);
        task.setCompletedAt(completedAt);
        task.setCompletedBy(userId);

        // Assert — Propiedad 14: isCompleted=true → completedAt != null
        assertThat(task.isCompleted())
                .as("La tarea debe estar marcada como completada")
                .isTrue();
        assertThat(task.getCompletedAt())
                .as("Propiedad 14: task.isCompleted=true → task.completedAt != null")
                .isNotNull();
    }

    /**
     * Propiedad 14 — invariante negativa:
     * Un objeto Task con isCompleted=false debe tener completedAt == null.
     * La invariante inversa garantiza consistencia bidireccional.
     *
     * Validates: Requisito 29.1
     */
    @ParameterizedTest(name = "priority={0}, dueAt={1}")
    @MethodSource("incompleteTasks")
    @DisplayName("Propiedad 14: Task recién creada (isCompleted=false) debe tener completedAt == null")
    void property14_incompleteTaskMustHaveNullCompletedAt(
            TaskPriority priority, LocalDateTime dueAt) {

        // Arrange — tarea recién creada, sin completar
        Task task = buildTask(priority, dueAt);

        // Assert — isCompleted=false → completedAt == null
        assertThat(task.isCompleted())
                .as("La tarea recién creada no debe estar completada")
                .isFalse();
        assertThat(task.getCompletedAt())
                .as("Propiedad 14 (inversa): task.isCompleted=false → task.completedAt == null")
                .isNull();
    }

    // ── Propiedad 14: invariante de comportamiento (TaskService.complete) ─────

    /**
     * Propiedad 14 — después de TaskService.complete():
     * Para cualquier tarea incompleta, tras llamar a complete(),
     * el DTO retornado siempre tiene isCompleted=true y completedAt != null.
     *
     * Validates: Requisito 29.1
     */
    @ParameterizedTest(name = "priority={0}, dueAt={1}")
    @MethodSource("incompleteTasks")
    @DisplayName("Propiedad 14: TaskService.complete() garantiza isCompleted=true y completedAt != null")
    void property14_afterComplete_isCompletedTrueAndCompletedAtNotNull(
            TaskPriority priority, LocalDateTime dueAt) {

        // Arrange
        Task task = buildTask(priority, dueAt);
        UUID taskId = UUID.randomUUID();
        setId(task, taskId);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        TaskDto result = taskService.complete(taskId, workspaceId, userId);

        // Assert — Propiedad 14: isCompleted=true → completedAt != null
        assertThat(result.isCompleted())
                .as("Propiedad 14: tras complete(), isCompleted debe ser true")
                .isTrue();
        assertThat(result.completedAt())
                .as("Propiedad 14: tras complete(), completedAt no debe ser null")
                .isNotNull();
        assertThat(result.completedBy())
                .as("completedBy debe registrar el usuario que completó la tarea")
                .isEqualTo(userId);
    }

    /**
     * Propiedad 14 — idempotencia de complete():
     * Llamar a complete() sobre una tarea ya completada no debe alterar
     * completedAt ni violar la invariante.
     *
     * Validates: Requisito 29.1, 29.2
     */
    @ParameterizedTest(name = "priority={0}, dueAt={1}, originalCompletedAt={2}")
    @MethodSource("alreadyCompletedTasks")
    @DisplayName("Propiedad 14: complete() idempotente — completedAt != null se mantiene")
    void property14_complete_idempotent_completedAtRemainsNotNull(
            TaskPriority priority, LocalDateTime dueAt, LocalDateTime originalCompletedAt) {

        // Arrange — tarea ya completada
        Task task = buildTask(priority, dueAt);
        UUID taskId = UUID.randomUUID();
        setId(task, taskId);
        UUID originalCompletedBy = UUID.randomUUID();

        task.setCompleted(true);
        task.setCompletedAt(originalCompletedAt);
        task.setCompletedBy(originalCompletedBy);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));
        // save no debe llamarse en el caso idempotente

        // Act
        TaskDto result = taskService.complete(taskId, workspaceId, userId);

        // Assert — Propiedad 14: la invariante se mantiene tras llamada idempotente
        assertThat(result.isCompleted())
                .as("Propiedad 14 (idempotente): isCompleted debe seguir siendo true")
                .isTrue();
        assertThat(result.completedAt())
                .as("Propiedad 14 (idempotente): completedAt no debe ser null")
                .isNotNull();
        assertThat(result.completedAt())
                .as("completedAt no debe cambiar en llamada idempotente")
                .isEqualTo(originalCompletedAt);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task buildTask(TaskPriority priority, LocalDateTime dueAt) {
        Task task = new Task();
        task.setWorkspaceId(workspaceId);
        task.setTitle("Tarea de prueba");
        task.setPriority(priority);
        task.setDueAt(dueAt);
        task.setAssignedTo(userId);
        return task;
    }

    private void setId(Task task, UUID id) {
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(task, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
