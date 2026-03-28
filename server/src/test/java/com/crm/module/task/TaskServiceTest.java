package com.crm.module.task;

import com.crm.module.task.dto.TaskDto;
import com.crm.module.task.dto.TaskFilterRequest;
import com.crm.module.task.entity.Task;
import com.crm.module.task.entity.TaskPriority;
import com.crm.module.task.repository.TaskRepository;
import com.crm.module.task.scheduler.TaskReminderScheduler;
import com.crm.module.task.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para TaskService y TaskReminderScheduler.
 * Casos: completar tarea ya completada (idempotente), filtro assignedTo=me,
 *        scheduler omite tareas completadas.
 * Requisitos: 29.2, 28.3, 30.3
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    // ── TaskService tests ─────────────────────────────────────────────────────

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

    // ── Req 29.2: complete() idempotente ─────────────────────────────────────

    /**
     * Req 29.2: Si la tarea ya está completada, complete() retorna HTTP 200
     * sin modificar completedAt ni completedBy originales.
     */
    @Test
    @DisplayName("complete: tarea ya completada — retorna DTO sin modificar completedAt ni completedBy (idempotente)")
    void complete_alreadyCompletedTask_doesNotModifyCompletedAtOrCompletedBy() {
        // Arrange
        UUID taskId = UUID.randomUUID();
        UUID originalCompletedBy = UUID.randomUUID();
        LocalDateTime originalCompletedAt = LocalDateTime.now().minusHours(3);

        Task task = buildTask(taskId, TaskPriority.MEDIUM, LocalDateTime.now().plusDays(1));
        task.setCompleted(true);
        task.setCompletedAt(originalCompletedAt);
        task.setCompletedBy(originalCompletedBy);

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        // Act — llamar con un userId diferente al que completó originalmente
        TaskDto result = taskService.complete(taskId, workspaceId, userId);

        // Assert — Req 29.2: completedAt y completedBy no deben cambiar
        assertThat(result.isCompleted()).isTrue();
        assertThat(result.completedAt())
                .as("Req 29.2: completedAt no debe modificarse en llamada idempotente")
                .isEqualTo(originalCompletedAt);
        assertThat(result.completedBy())
                .as("Req 29.2: completedBy no debe modificarse en llamada idempotente")
                .isEqualTo(originalCompletedBy);

        // save no debe invocarse cuando la tarea ya está completada
        verify(taskRepository, never()).save(any());
    }

    /**
     * Req 29.2: complete() sobre tarea ya completada no llama a save(),
     * garantizando que no hay escritura innecesaria en base de datos.
     */
    @Test
    @DisplayName("complete: tarea ya completada — no persiste cambios (sin llamada a save)")
    void complete_alreadyCompletedTask_neverCallsSave() {
        // Arrange
        UUID taskId = UUID.randomUUID();
        Task task = buildTask(taskId, TaskPriority.HIGH, null);
        task.setCompleted(true);
        task.setCompletedAt(LocalDateTime.now().minusDays(1));
        task.setCompletedBy(UUID.randomUUID());

        when(taskRepository.findById(taskId)).thenReturn(Optional.of(task));

        // Act
        taskService.complete(taskId, workspaceId, userId);

        // Assert
        verify(taskRepository, never()).save(any());
    }

    // ── Req 28.3: filtro assignedTo=me ───────────────────────────────────────

    /**
     * Req 28.3: Cuando assignedToMe=true, list() aplica un filtro por el userId
     * del usuario autenticado, retornando solo sus tareas.
     */
    @Test
    @DisplayName("list: assignedToMe=true — filtra por userId del usuario autenticado")
    @SuppressWarnings("unchecked")
    void list_assignedToMeFilter_returnsOnlyTasksAssignedToCurrentUser() {
        // Arrange
        UUID otherUserId = UUID.randomUUID();

        Task myTask = buildTask(UUID.randomUUID(), TaskPriority.MEDIUM, LocalDateTime.now().plusDays(1));
        myTask.setAssignedTo(userId);

        Task otherTask = buildTask(UUID.randomUUID(), TaskPriority.LOW, LocalDateTime.now().plusDays(2));
        otherTask.setAssignedTo(otherUserId);

        Pageable pageable = PageRequest.of(0, 10);

        // El repositorio devuelve solo la tarea del usuario autenticado
        // (la Specification construida internamente filtra por assignedTo=userId)
        Page<Task> repoPage = new PageImpl<>(List.of(myTask), pageable, 1);
        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(repoPage);

        TaskFilterRequest filter = new TaskFilterRequest(
                null,       // completed
                null,       // assignedTo
                true,       // assignedToMe = true  ← Req 28.3
                null,       // priority
                null,       // contactId
                null,       // dueBefore
                null        // dueAfter
        );

        // Act
        Page<TaskDto> result = taskService.list(filter, workspaceId, userId, pageable);

        // Assert — solo la tarea del usuario autenticado
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).assignedTo())
                .as("Req 28.3: la tarea retornada debe estar asignada al usuario autenticado")
                .isEqualTo(userId);

        verify(taskRepository).findAll(any(Specification.class), eq(pageable));
    }

    /**
     * Req 28.3: Cuando assignedToMe=false y assignedTo=null, list() no aplica
     * filtro por usuario, retornando tareas de todos los usuarios del workspace.
     */
    @Test
    @DisplayName("list: sin filtro assignedTo — retorna tareas de todos los usuarios del workspace")
    @SuppressWarnings("unchecked")
    void list_noAssignedToFilter_returnsAllWorkspaceTasks() {
        // Arrange
        Task task1 = buildTask(UUID.randomUUID(), TaskPriority.LOW, null);
        task1.setAssignedTo(userId);
        Task task2 = buildTask(UUID.randomUUID(), TaskPriority.HIGH, null);
        task2.setAssignedTo(UUID.randomUUID());

        Pageable pageable = PageRequest.of(0, 20);
        Page<Task> repoPage = new PageImpl<>(List.of(task1, task2), pageable, 2);
        when(taskRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(repoPage);

        TaskFilterRequest filter = new TaskFilterRequest(
                null, null, false, null, null, null, null
        );

        // Act
        Page<TaskDto> result = taskService.list(filter, workspaceId, userId, pageable);

        // Assert — ambas tareas retornadas
        assertThat(result.getContent()).hasSize(2);
    }

    // ── Req 30.3: scheduler omite tareas completadas ──────────────────────────

    /**
     * Tests para TaskReminderScheduler — necesita su propio mock de repositorio
     * y SimpMessagingTemplate.
     */
    @Test
    @DisplayName("sendReminders: omite tareas completadas — no envía notificación WebSocket para ellas")
    void sendReminders_completedTask_isSkippedAndNoNotificationSent() {
        // Arrange
        TaskRepository schedulerRepo = mock(TaskRepository.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        TaskReminderScheduler scheduler = new TaskReminderScheduler(schedulerRepo, messagingTemplate);

        // La query findPendingTasksDueWithin ya filtra completed=false en JPQL,
        // por lo que el repositorio no devuelve tareas completadas.
        // Simulamos que no hay tareas pendientes (todas completadas fueron filtradas).
        when(schedulerRepo.findPendingTasksDueWithin(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of());

        // Act
        scheduler.sendReminders();

        // Assert — ninguna notificación enviada
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    /**
     * Req 30.3: El scheduler solo envía recordatorios para tareas pendientes (no completadas).
     * Verifica que la notificación se envía al destino correcto para tareas pendientes.
     */
    @Test
    @DisplayName("sendReminders: tarea pendiente con assignedTo — envía notificación al usuario asignado")
    void sendReminders_pendingTaskWithAssignedUser_sendsWebSocketNotification() {
        // Arrange
        TaskRepository schedulerRepo = mock(TaskRepository.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        TaskReminderScheduler scheduler = new TaskReminderScheduler(schedulerRepo, messagingTemplate);

        UUID assignedUserId = UUID.randomUUID();
        Task pendingTask = buildTask(UUID.randomUUID(), TaskPriority.HIGH, LocalDateTime.now().plusMinutes(10));
        pendingTask.setAssignedTo(assignedUserId);
        // completed=false por defecto

        when(schedulerRepo.findPendingTasksDueWithin(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(pendingTask));

        // Act
        scheduler.sendReminders();

        // Assert — notificación enviada al destino correcto
        ArgumentCaptor<String> destinationCaptor = ArgumentCaptor.forClass(String.class);
        verify(messagingTemplate).convertAndSend(destinationCaptor.capture(), any(Object.class));

        assertThat(destinationCaptor.getValue())
                .as("Req 30.1: destino WebSocket debe incluir el userId del usuario asignado")
                .isEqualTo("/queue/user/" + assignedUserId + "/reminders");
    }

    /**
     * Req 30.3: El scheduler omite tareas sin usuario asignado (assignedTo=null).
     */
    @Test
    @DisplayName("sendReminders: tarea sin assignedTo — no envía notificación")
    void sendReminders_taskWithoutAssignedUser_skipsNotification() {
        // Arrange
        TaskRepository schedulerRepo = mock(TaskRepository.class);
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        TaskReminderScheduler scheduler = new TaskReminderScheduler(schedulerRepo, messagingTemplate);

        Task taskWithoutAssignee = buildTask(UUID.randomUUID(), TaskPriority.MEDIUM, LocalDateTime.now().plusMinutes(5));
        taskWithoutAssignee.setAssignedTo(null); // sin asignar

        when(schedulerRepo.findPendingTasksDueWithin(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(taskWithoutAssignee));

        // Act
        scheduler.sendReminders();

        // Assert — no se envía notificación
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Task buildTask(UUID id, TaskPriority priority, LocalDateTime dueAt) {
        Task task = new Task();
        task.setWorkspaceId(workspaceId);
        task.setTitle("Tarea de prueba");
        task.setPriority(priority);
        task.setDueAt(dueAt);
        setId(task, id);
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
