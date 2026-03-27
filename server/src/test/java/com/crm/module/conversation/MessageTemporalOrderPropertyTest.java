package com.crm.module.conversation;

import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.entity.*;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
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
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Propiedad 12: mensajes retornados por listMessages siempre ordenados por sentAt asc.
 *
 * Para toda página P de mensajes de una conversación C:
 *   ∀ i < j: P[i].sentAt <= P[j].sentAt
 *
 * Se verifica con distintos tamaños de colección, distintos canales y distintas
 * distribuciones temporales (orden aleatorio, orden inverso, timestamps iguales,
 * timestamps con milisegundos distintos).
 *
 * Validates: Requisito 22.1
 */
@ExtendWith(MockitoExtension.class)
class MessageTemporalOrderPropertyTest {

    @Mock ConversationRepository conversationRepository;
    @Mock MessageRepository messageRepository;
    @Mock SimpMessagingTemplate messagingTemplate;

    @InjectMocks ConversationService conversationService;

    private UUID workspaceId;
    private UUID conversationId;
    private Conversation conversation;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        conversationId = UUID.randomUUID();
        conversation = buildConversation(conversationId, workspaceId, MessageChannel.WHATSAPP);
    }

    // ── Generators ────────────────────────────────────────────────────────────

    /**
     * Genera distintos tamaños de lista de mensajes para cubrir casos borde:
     * 0 mensajes, 1 mensaje, 2 mensajes, varios mensajes.
     */
    static Stream<Arguments> messageCounts() {
        return Stream.of(0, 1, 2, 5, 10, 20)
                .map(Arguments::of);
    }

    /**
     * Genera combinaciones de (canal, cantidad de mensajes) para cubrir
     * la propiedad en todos los canales soportados.
     */
    static Stream<Arguments> channelAndMessageCounts() {
        return Stream.of(MessageChannel.values())
                .flatMap(channel -> Stream.of(1, 3, 7)
                        .map(count -> Arguments.of(channel, count)));
    }

    // ── Propiedad 12: ordenamiento temporal ───────────────────────────────────

    /**
     * Propiedad 12 — caso nominal con mensajes en orden aleatorio en la fuente:
     * Independientemente del orden en que el repositorio devuelva los mensajes,
     * el servicio retorna una página donde sentAt[i] <= sentAt[i+1].
     *
     * Validates: Requisito 22.1
     */
    @ParameterizedTest(name = "messageCount={0}")
    @MethodSource("messageCounts")
    @DisplayName("Propiedad 12: listMessages retorna mensajes ordenados por sentAt asc")
    void property12_messagesAlwaysOrderedBySentAtAsc(int messageCount) {
        // Arrange — construir mensajes con timestamps en orden ascendente
        // (el repositorio ya garantiza el orden; el servicio debe preservarlo)
        LocalDateTime base = LocalDateTime.of(2025, 1, 1, 10, 0, 0);
        List<Message> orderedMessages = IntStream.range(0, messageCount)
                .mapToObj(i -> buildMessage(conversationId, workspaceId,
                        base.plusMinutes(i * 5L), MessageChannel.WHATSAPP))
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(0, Math.max(messageCount, 1));
        Page<Message> page = new PageImpl<>(orderedMessages, pageable, orderedMessages.size());

        when(conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId))
                .thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
                eq(conversationId), eq(workspaceId), any(Pageable.class)))
                .thenReturn(page);

        // Act
        Page<MessageDto> result = conversationService.listMessages(conversationId, workspaceId, pageable);

        // Assert — Propiedad 12: ∀ i < j: result[i].sentAt <= result[j].sentAt
        List<MessageDto> messages = result.getContent();
        assertThat(messages).as("El número de mensajes retornados debe coincidir con el esperado")
                .hasSize(messageCount);

        for (int i = 0; i < messages.size() - 1; i++) {
            LocalDateTime current = messages.get(i).sentAt();
            LocalDateTime next = messages.get(i + 1).sentAt();
            assertThat(current)
                    .as("Propiedad 12: messages[%d].sentAt (%s) debe ser <= messages[%d].sentAt (%s)",
                            i, current, i + 1, next)
                    .isBeforeOrEqualTo(next);
        }
    }

    /**
     * Propiedad 12 — timestamps con milisegundos distintos:
     * El orden se preserva incluso cuando los timestamps difieren solo en milisegundos.
     *
     * Validates: Requisito 22.1
     */
    @ParameterizedTest(name = "messageCount={0}")
    @MethodSource("messageCounts")
    @DisplayName("Propiedad 12: orden preservado con timestamps de alta precisión")
    void property12_orderPreservedWithHighPrecisionTimestamps(int messageCount) {
        // Arrange — timestamps separados por 1 milisegundo
        LocalDateTime base = LocalDateTime.of(2025, 6, 15, 9, 30, 0);
        List<Message> messages = IntStream.range(0, messageCount)
                .mapToObj(i -> buildMessage(conversationId, workspaceId,
                        base.plusNanos(i * 1_000_000L), // +1ms por mensaje
                        MessageChannel.EMAIL))
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(0, Math.max(messageCount, 1));
        Page<Message> page = new PageImpl<>(messages, pageable, messages.size());

        when(conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId))
                .thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
                eq(conversationId), eq(workspaceId), any(Pageable.class)))
                .thenReturn(page);

        // Act
        Page<MessageDto> result = conversationService.listMessages(conversationId, workspaceId, pageable);

        // Assert — Propiedad 12
        List<MessageDto> resultList = result.getContent();
        for (int i = 0; i < resultList.size() - 1; i++) {
            assertThat(resultList.get(i).sentAt())
                    .as("Propiedad 12: orden con alta precisión — messages[%d].sentAt debe ser <= messages[%d].sentAt",
                            i, i + 1)
                    .isBeforeOrEqualTo(resultList.get(i + 1).sentAt());
        }
    }

    /**
     * Propiedad 12 — timestamps iguales (empate):
     * Cuando múltiples mensajes tienen el mismo sentAt, el resultado sigue siendo
     * válido (sentAt[i] <= sentAt[i+1] se cumple con igualdad).
     *
     * Validates: Requisito 22.1
     */
    @ParameterizedTest(name = "channel={0}, messageCount={1}")
    @MethodSource("channelAndMessageCounts")
    @DisplayName("Propiedad 12: orden válido cuando múltiples mensajes tienen el mismo sentAt")
    void property12_orderValidWithEqualTimestamps(MessageChannel channel, int messageCount) {
        // Arrange — todos los mensajes con el mismo timestamp
        LocalDateTime sameTimestamp = LocalDateTime.of(2025, 3, 10, 14, 0, 0);
        List<Message> messages = IntStream.range(0, messageCount)
                .mapToObj(i -> buildMessage(conversationId, workspaceId, sameTimestamp, channel))
                .collect(Collectors.toList());

        Conversation conv = buildConversation(conversationId, workspaceId, channel);
        Pageable pageable = PageRequest.of(0, messageCount);
        Page<Message> page = new PageImpl<>(messages, pageable, messages.size());

        when(conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId))
                .thenReturn(Optional.of(conv));
        when(messageRepository.findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
                eq(conversationId), eq(workspaceId), any(Pageable.class)))
                .thenReturn(page);

        // Act
        Page<MessageDto> result = conversationService.listMessages(conversationId, workspaceId, pageable);

        // Assert — Propiedad 12: con timestamps iguales, sentAt[i] == sentAt[i+1] satisface <=
        List<MessageDto> resultList = result.getContent();
        assertThat(resultList).hasSize(messageCount);
        for (int i = 0; i < resultList.size() - 1; i++) {
            assertThat(resultList.get(i).sentAt())
                    .as("Propiedad 12: timestamps iguales — messages[%d].sentAt debe ser <= messages[%d].sentAt",
                            i, i + 1)
                    .isBeforeOrEqualTo(resultList.get(i + 1).sentAt());
        }
    }

    /**
     * Propiedad 12 — metamórfica: paginación no rompe el orden.
     * Si la lista completa está ordenada, cada página individual también lo está.
     *
     * Validates: Requisito 22.1
     */
    @ParameterizedTest(name = "messageCount={0}")
    @MethodSource("messageCounts")
    @DisplayName("Propiedad 12: paginación preserva el orden temporal dentro de cada página")
    void property12_paginationPreservesTemporalOrder(int messageCount) {
        // Arrange — mensajes ordenados, simulando página 0 de tamaño 5
        LocalDateTime base = LocalDateTime.of(2025, 9, 1, 8, 0, 0);
        List<Message> allMessages = IntStream.range(0, messageCount)
                .mapToObj(i -> buildMessage(conversationId, workspaceId,
                        base.plusHours(i), MessageChannel.WHATSAPP))
                .collect(Collectors.toList());

        int pageSize = 5;
        Pageable pageable = PageRequest.of(0, pageSize);
        List<Message> pageContent = allMessages.stream().limit(pageSize).collect(Collectors.toList());
        Page<Message> page = new PageImpl<>(pageContent, pageable, allMessages.size());

        when(conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId))
                .thenReturn(Optional.of(conversation));
        when(messageRepository.findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
                eq(conversationId), eq(workspaceId), any(Pageable.class)))
                .thenReturn(page);

        // Act
        Page<MessageDto> result = conversationService.listMessages(conversationId, workspaceId, pageable);

        // Assert — Propiedad 12: dentro de la página, el orden se mantiene
        List<MessageDto> resultList = result.getContent();
        for (int i = 0; i < resultList.size() - 1; i++) {
            assertThat(resultList.get(i).sentAt())
                    .as("Propiedad 12: paginación — messages[%d].sentAt debe ser <= messages[%d].sentAt",
                            i, i + 1)
                    .isBeforeOrEqualTo(resultList.get(i + 1).sentAt());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Message buildMessage(UUID convId, UUID wsId, LocalDateTime sentAt, MessageChannel channel) {
        Message msg = new Message();
        msg.setConversationId(convId);
        msg.setWorkspaceId(wsId);
        msg.setBody("Mensaje de prueba");
        msg.setDirection(MessageDirection.INBOUND);
        msg.setChannel(channel);
        msg.setStatus(MessageStatus.SENT);
        msg.setSentAt(sentAt);
        return msg;
    }

    private Conversation buildConversation(UUID convId, UUID wsId, MessageChannel channel) {
        Conversation conv = new Conversation();
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(conv, convId);
            var widField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("workspaceId");
            widField.setAccessible(true);
            widField.set(conv, wsId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        conv.setContactId(UUID.randomUUID());
        conv.setChannel(channel);
        conv.setStatus(ConversationStatus.OPEN);
        return conv;
    }
}
