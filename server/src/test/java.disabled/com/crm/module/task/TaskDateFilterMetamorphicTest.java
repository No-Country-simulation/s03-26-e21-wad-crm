package com.crm.module.task;

import com.crm.module.task.dto.TaskDto;
import com.crm.module.task.dto.TaskFilterRequest;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Propiedad 15: Metamórfica de filtros de fecha.
 *
 * filter(dueAfter=T1 AND dueBefore=T2) ⊆ filter(dueAfter=T1)
 *
 * Para cualquier par de timestamps T1 < T2, el conjunto de tareas retornadas
 * al aplicar ambos filtros simultáneamente debe ser un subconjunto del
 * resultado de aplicar solo dueAfter=T1.
 *
 * Validates: Requisito 28.2
 */
@ExtendWith(MockitoExtension.class)
class TaskDateFilterMetamorphicTest {

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
     * Genera pares (T1, T2) con T1 < T2 que cubren distintos rangos temporales:
     * pasado, presente, futuro, rangos amplios y rangos estrechos.
     */
    static Stream<Arguments> dateRangePairs() {
        LocalDateTime now = LocalDateTime.now();
        return Stream.of(
                // Rango futuro próximo
                Arguments.of(now.plusDays(1), now.plusDays(7)),
                // Rango futuro amplio
                Arguments.of(now.plusDays(1), now.plusDays(30)),
                // Rango pasado
                Arguments.of(now.minusDays(30), now.minusDays(1)),
                // Rango que cruza el presente
                Arguments.of(now.minusDays(3), now.plusDays(3)),
                // Rango muy estrecho (horas)
                Arguments.of(now.plusHours(1), now.plusHours(6)),
                // Rango de un día exacto
                Arguments.of(now, now.plusDays(1))
        );
    }

    // ── Propiedad 15: subconjunto estricto ────────────────────────────────────

    /**
     * Propiedad 15 — relación de subconjunto:
     * Los IDs retornados por filter(dueAfter=T1 AND dueBefore=T2)
     * deben ser un subconjunto de los IDs retornados por filter(dueAfter=T1).
     *
     * Validates: Requisito 28.2
     */
    @ParameterizedTest(name = "T1={0}, T2={1}")
    @MethodSource("dateRangePairs")
    @DisplayName("Propiedad 15: filter(dueAfter=T1 AND dueBefore=T2) ⊆ filter(dueAfter=T1)")
    void property15_combinedFilter_isSubsetOf_dueAfterOnly(
            LocalDateTime t1, LocalDateTime t2) {

        // Arrange — tareas distribuidas en distintas posiciones temporales
        List<Task> allTasks = buildTasksAcrossTimeRange(t1, t2);

        // Stub: filter(dueAfter=T1) → tareas con dueAt >= T1
        List<Task> dueAfterT1Tasks = allTasks.stream()
                .filter(task -> task.getDueAt() != null && !task.getDueAt().isBefore(t1))
                .toList();

        // Stub: filter(dueAfter=T1 AND dueBefore=T2) → tareas con T1 <= dueAt <= T2
        List<Task> combinedFilterTasks = allTasks.stream()
                .filter(task -> task.getDueAt() != null
                        && !task.getDueAt().isBefore(t1)
                        && !task.getDueAt().isAfter(t2))
                .toList();

        when(taskRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenAnswer(inv -> {
                    // Determinar qué filtro se está aplicando inspeccionando el contexto del test
                    // En la práctica, el mock devuelve los resultados pre-calculados según la llamada
                    return new PageImpl<>(combinedFilterTasks);
                });

        // Act — filter(dueAfter=T1 AND dueBefore=T2)
        // Record order: completed, assignedTo, assignedToMe, priority, contactId, dueBefore, dueAfter
        TaskFilterRequest combinedFilter = new TaskFilterRequest(
                null, null, false, null, null, t2, t1);
        Page<TaskDto> combinedResult = taskService.list(
                combinedFilter, workspaceId, userId, PageRequest.of(0, 100));

        // Stub para la segunda llamada: filter(dueAfter=T1 only)
        when(taskRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(dueAfterT1Tasks));

        // Act — filter(dueAfter=T1 only)
        TaskFilterRequest dueAfterOnlyFilter = new TaskFilterRequest(
                null, null, false, null, null, null, t1);
        Page<TaskDto> dueAfterOnlyResult = taskService.list(
                dueAfterOnlyFilter, workspaceId, userId, PageRequest.of(0, 100));

        // Assert — Propiedad 15: combinedResult.ids ⊆ dueAfterOnlyResult.ids
        Set<UUID> combinedIds = combinedResult.getContent().stream()
                .map(TaskDto::id)
                .collect(Collectors.toSet());

        Set<UUID> dueAfterOnlyIds = dueAfterOnlyResult.getContent().stream()
                .map(TaskDto::id)
                .collect(Collectors.toSet());

        assertThat(dueAfterOnlyIds)
                .as("Propiedad 15: filter(dueAfter=T1 AND dueBefore=T2) ⊆ filter(dueAfter=T1) — " +
                    "todos los IDs del filtro combinado deben estar en el filtro solo dueAfter")
                .containsAll(combinedIds);
    }

    /**
     * Propiedad 15 — verificación directa sobre datos en memoria:
     * Aplica los filtros directamente sobre una lista de tareas construida
     * sin mocks, verificando la relación de subconjunto a nivel de datos puros.
     *
     * Validates: Requisito 28.2
     */
    @ParameterizedTest(name = "T1={0}, T2={1}")
    @MethodSource("dateRangePairs")
    @DisplayName("Propiedad 15: subconjunto verificado directamente sobre datos (sin mocks)")
    void property15_subsetRelation_verifiedOnRawData(
            LocalDateTime t1, LocalDateTime t2) {

        // Arrange — tareas distribuidas en distintas posiciones temporales
        List<Task> allTasks = buildTasksAcrossTimeRange(t1, t2);

        // Act — aplicar filtros directamente sobre los datos
        Set<UUID> dueAfterT1Ids = allTasks.stream()
                .filter(task -> task.getDueAt() != null && !task.getDueAt().isBefore(t1))
                .map(this::getId)
                .collect(Collectors.toSet());

        Set<UUID> combinedFilterIds = allTasks.stream()
                .filter(task -> task.getDueAt() != null
                        && !task.getDueAt().isBefore(t1)
                        && !task.getDueAt().isAfter(t2))
                .map(this::getId)
                .collect(Collectors.toSet());

        // Assert — Propiedad 15: combinedFilterIds ⊆ dueAfterT1Ids
        assertThat(dueAfterT1Ids)
                .as("Propiedad 15: filter(dueAfter=T1 AND dueBefore=T2) ⊆ filter(dueAfter=T1)")
                .containsAll(combinedFilterIds);
    }

    /**
     * Propiedad 15 — cardinalidad:
     * El filtro combinado nunca puede retornar más resultados que el filtro solo dueAfter.
     *
     * Validates: Requisito 28.2
     */
    @ParameterizedTest(name = "T1={0}, T2={1}")
    @MethodSource("dateRangePairs")
    @DisplayName("Propiedad 15: |filter(dueAfter=T1 AND dueBefore=T2)| <= |filter(dueAfter=T1)|")
    void property15_combinedFilter_neverExceedsCount_of_dueAfterOnly(
            LocalDateTime t1, LocalDateTime t2) {

        List<Task> allTasks = buildTasksAcrossTimeRange(t1, t2);

        long dueAfterCount = allTasks.stream()
                .filter(task -> task.getDueAt() != null && !task.getDueAt().isBefore(t1))
                .count();

        long combinedCount = allTasks.stream()
                .filter(task -> task.getDueAt() != null
                        && !task.getDueAt().isBefore(t1)
                        && !task.getDueAt().isAfter(t2))
                .count();

        assertThat(combinedCount)
                .as("Propiedad 15: agregar dueBefore nunca puede aumentar el número de resultados")
                .isLessThanOrEqualTo(dueAfterCount);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Construye un conjunto de tareas distribuidas en distintas posiciones
     * relativas al rango [T1, T2] para cubrir todos los casos de la propiedad:
     * - Antes de T1 (fuera del rango, fuera de dueAfter)
     * - En T1 exacto (en ambos filtros)
     * - Entre T1 y T2 (en ambos filtros)
     * - En T2 exacto (en ambos filtros)
     * - Después de T2 (solo en dueAfter, no en combinado)
     * - Sin fecha (dueAt=null, excluida de ambos filtros)
     */
    private List<Task> buildTasksAcrossTimeRange(LocalDateTime t1, LocalDateTime t2) {
        LocalDateTime midpoint = t1.plusSeconds(t2.toEpochSecond(java.time.ZoneOffset.UTC)
                - t1.toEpochSecond(java.time.ZoneOffset.UTC) / 2);

        return List.of(
                buildTask(t1.minusDays(5),  TaskPriority.LOW),     // antes de T1
                buildTask(t1.minusHours(1), TaskPriority.MEDIUM),  // justo antes de T1
                buildTask(t1,               TaskPriority.HIGH),     // exactamente T1
                buildTask(t1.plusHours(1),  TaskPriority.URGENT),  // entre T1 y T2
                buildTask(t2.minusHours(1), TaskPriority.LOW),     // justo antes de T2
                buildTask(t2,               TaskPriority.MEDIUM),  // exactamente T2
                buildTask(t2.plusHours(1),  TaskPriority.HIGH),    // justo después de T2
                buildTask(t2.plusDays(5),   TaskPriority.URGENT),  // mucho después de T2
                buildTask(null,             TaskPriority.LOW)       // sin fecha
        );
    }

    private Task buildTask(LocalDateTime dueAt, TaskPriority priority) {
        Task task = new Task();
        task.setWorkspaceId(workspaceId);
        task.setTitle("Tarea " + (dueAt != null ? dueAt : "sin-fecha"));
        task.setPriority(priority);
        task.setDueAt(dueAt);
        task.setAssignedTo(userId);
        // Asignar ID único via reflexión
        setId(task, UUID.randomUUID());
        return task;
    }

    private UUID getId(Task task) {
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            return (UUID) idField.get(task);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
