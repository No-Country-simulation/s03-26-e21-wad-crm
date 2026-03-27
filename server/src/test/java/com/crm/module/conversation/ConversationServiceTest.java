package com.crm.module.conversation;

import com.crm.module.conversation.dto.ConversationDto;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.ConversationStatus;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import jakarta.persistence.EntityNotFoundException;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ConversationService.
 * Casos: findOrCreate idempotente, listado ordenado por lastMessageAt, conversación de otro workspace → 404
 * Requisitos: 21.4, 22.4, 8.3
 */
@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock ConversationRepository conversationRepository;
    @Mock MessageRepository messageRepository;
    @Mock SimpMessagingTemplate messagingTemplate;

    @InjectMocks ConversationService conversationService;

    private UUID workspaceId;
    private UUID contactId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        contactId = UUID.randomUUID();
    }

    // ── findOrCreate: idempotencia ────────────────────────────────────────────

    /**
     * Req 21.4: findOrCreate retorna la conversación existente sin crear una nueva.
     * Llamar dos veces con los mismos parámetros debe producir el mismo resultado
     * y solo persistir una conversación.
     */
    @Test
    @DisplayName("findOrCreate: retorna conversación existente sin crear duplicado (idempotente)")
    void findOrCreate_existingConversation_returnsExistingWithoutCreating() {
        // Arrange
        Conversation existing = buildConversation(MessageChannel.WHATSAPP);
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.of(existing));

        // Act
        Conversation first = conversationService.findOrCreate(contactId, MessageChannel.WHATSAPP, workspaceId);
        Conversation second = conversationService.findOrCreate(contactId, MessageChannel.WHATSAPP, workspaceId);

        // Assert — misma instancia, nunca se llama save
        assertThat(first.getId()).isEqualTo(existing.getId());
        assertThat(second.getId()).isEqualTo(existing.getId());
        verify(conversationRepository, never()).save(any());
    }

    /**
     * Req 21.4: findOrCreate crea una nueva conversación cuando no existe ninguna.
     */
    @Test
    @DisplayName("findOrCreate: crea conversación nueva cuando no existe")
    void findOrCreate_noExistingConversation_createsAndPersists() {
        // Arrange
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.EMAIL))
                .thenReturn(Optional.empty());

        ArgumentCaptor<Conversation> captor = ArgumentCaptor.forClass(Conversation.class);
        when(conversationRepository.save(captor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        // Act
        Conversation result = conversationService.findOrCreate(contactId, MessageChannel.EMAIL, workspaceId);

        // Assert
        verify(conversationRepository, times(1)).save(any());
        assertThat(captor.getValue().getContactId()).isEqualTo(contactId);
        assertThat(captor.getValue().getChannel()).isEqualTo(MessageChannel.EMAIL);
        assertThat(captor.getValue().getWorkspaceId()).isEqualTo(workspaceId);
        assertThat(result).isNotNull();
    }

    /**
     * Req 21.4: findOrCreate es idempotente — llamar N veces con conversación existente
     * nunca persiste una nueva conversación.
     */
    @Test
    @DisplayName("findOrCreate: idempotente — N llamadas con conversación existente no crean duplicados")
    void findOrCreate_calledMultipleTimes_neverCreatesDuplicate() {
        // Arrange
        Conversation existing = buildConversation(MessageChannel.WHATSAPP);
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.of(existing));

        // Act — llamar 5 veces
        for (int i = 0; i < 5; i++) {
            conversationService.findOrCreate(contactId, MessageChannel.WHATSAPP, workspaceId);
        }

        // Assert — save nunca fue invocado
        verify(conversationRepository, never()).save(any());
        verify(conversationRepository, times(5))
                .findByWorkspaceIdAndContactIdAndChannel(workspaceId, contactId, MessageChannel.WHATSAPP);
    }

    // ── listConversations: ordenamiento por lastMessageAt ─────────────────────

    /**
     * Req 22.4: listConversations delega al repositorio con orden lastMessageAt desc.
     */
    @Test
    @DisplayName("listConversations: delega al repositorio con orden lastMessageAt desc")
    void listConversations_delegatesToRepositoryWithCorrectOrdering() {
        // Arrange
        LocalDateTime older = LocalDateTime.now().minusHours(2);
        LocalDateTime newer = LocalDateTime.now().minusMinutes(10);

        Conversation conv1 = buildConversationWithLastMessage(MessageChannel.WHATSAPP, newer);
        Conversation conv2 = buildConversationWithLastMessage(MessageChannel.EMAIL, older);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Conversation> repoPage = new PageImpl<>(List.of(conv1, conv2), pageable, 2);

        when(conversationRepository.findByWorkspaceIdOrderByLastMessageAtDesc(workspaceId, pageable))
                .thenReturn(repoPage);

        // Act
        Page<ConversationDto> result = conversationService.listConversations(workspaceId, pageable);

        // Assert — el repositorio fue llamado con el workspaceId correcto
        verify(conversationRepository).findByWorkspaceIdOrderByLastMessageAtDesc(workspaceId, pageable);
        assertThat(result.getContent()).hasSize(2);

        // El primer elemento tiene lastMessageAt más reciente (orden desc preservado del repo)
        assertThat(result.getContent().get(0).lastMessageAt()).isEqualTo(newer);
        assertThat(result.getContent().get(1).lastMessageAt()).isEqualTo(older);
    }

    /**
     * Req 22.4: listConversations retorna solo conversaciones del workspace del usuario.
     */
    @Test
    @DisplayName("listConversations: filtra por workspaceId del usuario autenticado")
    void listConversations_filtersOnlyByAuthenticatedWorkspace() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        when(conversationRepository.findByWorkspaceIdOrderByLastMessageAtDesc(workspaceId, pageable))
                .thenReturn(Page.empty(pageable));

        // Act
        conversationService.listConversations(workspaceId, pageable);

        // Assert — el repositorio recibe exactamente el workspaceId del usuario
        verify(conversationRepository).findByWorkspaceIdOrderByLastMessageAtDesc(workspaceId, pageable);
        verify(conversationRepository, never())
                .findByWorkspaceIdOrderByLastMessageAtDesc(argThat(id -> !id.equals(workspaceId)), any());
    }

    // ── Aislamiento de workspace: conversación de otro workspace → 404 ────────

    /**
     * Req 8.3: listMessages lanza EntityNotFoundException cuando la conversación
     * pertenece a otro workspace (no revelar existencia del recurso).
     */
    @Test
    @DisplayName("listMessages: conversación de otro workspace lanza EntityNotFoundException (→ 404)")
    void listMessages_conversationFromOtherWorkspace_throwsEntityNotFoundException() {
        // Arrange
        UUID otherWorkspaceConversationId = UUID.randomUUID();
        UUID myWorkspaceId = UUID.randomUUID();

        // El repositorio no encuentra la conversación con ese workspaceId (pertenece a otro)
        when(conversationRepository.findByIdAndWorkspaceId(otherWorkspaceConversationId, myWorkspaceId))
                .thenReturn(Optional.empty());

        Pageable pageable = PageRequest.of(0, 20);

        // Act & Assert
        assertThatThrownBy(() ->
                conversationService.listMessages(otherWorkspaceConversationId, myWorkspaceId, pageable))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(otherWorkspaceConversationId.toString());

        // Nunca se consultan mensajes si la conversación no pertenece al workspace
        verify(messageRepository, never()).findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
                any(), any(), any());
    }

    /**
     * Req 8.3: addMessage lanza EntityNotFoundException cuando la conversación
     * pertenece a otro workspace.
     */
    @Test
    @DisplayName("addMessage: conversación de otro workspace lanza EntityNotFoundException (→ 404)")
    void addMessage_conversationFromOtherWorkspace_throwsEntityNotFoundException() {
        // Arrange
        UUID foreignConversationId = UUID.randomUUID();
        UUID myWorkspaceId = UUID.randomUUID();

        when(conversationRepository.findByIdAndWorkspaceId(foreignConversationId, myWorkspaceId))
                .thenReturn(Optional.empty());

        var request = new com.crm.module.conversation.dto.AddMessageRequest(
                foreignConversationId,
                "Hola",
                com.crm.module.conversation.entity.MessageDirection.OUTBOUND,
                MessageChannel.WHATSAPP,
                null, null, null
        );

        // Act & Assert
        assertThatThrownBy(() -> conversationService.addMessage(request, myWorkspaceId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(foreignConversationId.toString());

        verify(messageRepository, never()).save(any());
    }

    /**
     * Req 8.3: listMessages de conversación inexistente también lanza EntityNotFoundException.
     * El sistema no debe diferenciar entre "no existe" y "pertenece a otro workspace".
     */
    @Test
    @DisplayName("listMessages: conversación inexistente lanza EntityNotFoundException (→ 404)")
    void listMessages_nonExistentConversation_throwsEntityNotFoundException() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(conversationRepository.findByIdAndWorkspaceId(nonExistentId, workspaceId))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() ->
                conversationService.listMessages(nonExistentId, workspaceId, PageRequest.of(0, 10)))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Conversation buildConversation(MessageChannel channel) {
        Conversation conv = new Conversation();
        setField(conv, "id", UUID.randomUUID());
        setField(conv, "workspaceId", workspaceId);
        conv.setContactId(contactId);
        conv.setChannel(channel);
        conv.setStatus(ConversationStatus.OPEN);
        return conv;
    }

    private Conversation buildConversationWithLastMessage(MessageChannel channel, LocalDateTime lastMessageAt) {
        Conversation conv = buildConversation(channel);
        conv.setLastMessageAt(lastMessageAt);
        return conv;
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            var field = com.crm.common.audit.AuditableEntity.class.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (NoSuchFieldException e) {
            // campo en la subclase
            try {
                var field = target.getClass().getDeclaredField(fieldName);
                field.setAccessible(true);
                field.set(target, value);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
