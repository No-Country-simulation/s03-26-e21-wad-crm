package com.crm.module.conversation.service;

import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.dto.ConversationDto;
import com.crm.module.conversation.dto.ConversationNotification;
import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.Message;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageStatus;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de conversaciones y mensajes.
 * Requisitos: 21.4, 21.5, 22.1–22.4
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Busca una conversación activa por contactId + channel + workspaceId.
     * Si no existe, la crea. Req 21.4
     */
    @Transactional
    public Conversation findOrCreate(UUID contactId, MessageChannel channel, UUID workspaceId) {
        return conversationRepository
                .findByWorkspaceIdAndContactIdAndChannel(workspaceId, contactId, channel)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setContactId(contactId);
                    conv.setChannel(channel);
                    conv.setWorkspaceId(workspaceId);
                    return conversationRepository.save(conv);
                });
    }

    /**
     * Persiste un mensaje, actualiza lastMessageAt y notifica por WebSocket. Req 21.5, 22.2
     */
    @Transactional
    public MessageDto addMessage(AddMessageRequest request, UUID workspaceId) {
        Conversation conversation = conversationRepository
                .findByIdAndWorkspaceId(request.conversationId(), workspaceId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Conversación no encontrada: " + request.conversationId()));

        // Req 20.4, 25.2: el canal del mensaje SIEMPRE hereda el canal de la conversación padre.
        // Ignorar request.channel() para garantizar la invariante M.channel == C.channel.
        if (request.channel() != null && request.channel() != conversation.getChannel()) {
            throw new IllegalArgumentException(
                    "El canal del mensaje (" + request.channel()
                    + ") no coincide con el canal de la conversación (" + conversation.getChannel() + ")");
        }

        Message message = new Message();
        message.setConversationId(conversation.getId());
        message.setWorkspaceId(workspaceId);
        message.setBody(request.body());
        message.setDirection(request.direction());
        message.setChannel(conversation.getChannel());   // siempre del padre
        message.setStatus(request.status() != null ? request.status() : MessageStatus.SENT);
        message.setExternalId(request.externalId());
        message.setSentAt(request.sentAt() != null ? request.sentAt() : LocalDateTime.now());

        message = messageRepository.save(message);

        conversation.setLastMessageAt(message.getSentAt());
        conversationRepository.save(conversation);

        MessageDto dto = toMessageDto(message);
        notifyViaWebSocket(conversation, message);
        return dto;
    }

    /**
     * Actualiza el externalId de un mensaje existente.
     * Usado para asignar el wamid retornado por Meta después de enviar.
     */
    @Transactional
    public MessageDto updateMessageExternalId(UUID messageId, String externalId, UUID workspaceId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Mensaje no encontrado: " + messageId));
        
        // Verificar que el mensaje pertenece al workspace
        if (!message.getWorkspaceId().equals(workspaceId)) {
            throw new IllegalArgumentException("El mensaje no pertenece a este workspace");
        }
        
        message.setExternalId(externalId);
        message = messageRepository.save(message);
        
        log.info("[CONVERSATION] Updated externalId for message {}: {}", messageId, externalId);
        return toMessageDto(message);
    }

    /**
     * Lista conversaciones del workspace ordenadas por lastMessageAt desc. Req 22.4
     */
    @Transactional(readOnly = true)
    public Page<ConversationDto> listConversations(UUID workspaceId, Pageable pageable) {
        return conversationRepository
                .findByWorkspaceIdOrderByLastMessageAtDesc(workspaceId, pageable)
                .map(this::toConversationDto);
    }

    /**
     * Lista mensajes de una conversación paginados, ordenados por sentAt asc. Req 22.1, 22.3
     */
    @Transactional(readOnly = true)
    public Page<MessageDto> listMessages(UUID conversationId, UUID workspaceId, Pageable pageable) {
        boolean exists = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .isPresent();
        if (!exists) {
            throw new EntityNotFoundException("Conversación no encontrada: " + conversationId);
        }
        return messageRepository
                .findByConversationIdAndWorkspaceIdOrderBySentAtAsc(conversationId, workspaceId, pageable)
                .map(this::toMessageDto);
    }

    /**
     * Publica notificación WebSocket al topic del workspace. Req 21.5
     * Si falla el WebSocket, el mensaje YA fue guardado en BD — solo se loggea el error.
     */
    private void notifyViaWebSocket(Conversation conversation, Message message) {
        try {
            ConversationNotification notification = new ConversationNotification(
                    conversation.getId(),
                    toMessageDto(message),
                    conversation.getWorkspaceId()
            );
            messagingTemplate.convertAndSend(
                    "/topic/workspace/" + conversation.getWorkspaceId() + "/conversations",
                    notification
            );
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for conversation {}", conversation.getId(), e);
        }
    }

    // ── Mappers manuales ──────────────────────────────────────────────────────

    private MessageDto toMessageDto(Message m) {
        return new MessageDto(
                m.getId(),
                m.getConversationId(),
                m.getBody(),
                m.getDirection(),
                m.getChannel(),
                m.getStatus(),
                m.getExternalId(),
                m.getSentAt(),
                m.getDeliveredAt(),
                m.getReadAt()
        );
    }

    private ConversationDto toConversationDto(Conversation c) {
        return new ConversationDto(
                c.getId(),
                c.getContactId(),
                c.getChannel(),
                c.getLastMessageAt(),
                c.getWorkspaceId(),
                c.getCreatedAt()
        );
    }
}
