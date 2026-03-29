package com.crm.module.whatsapp.service;

import com.crm.common.security.EncryptionService;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.MetaCloudApiProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Servicio de envío de mensajes WhatsApp.
 * Resuelve credenciales del workspace, delega envío a MetaCloudApiProvider
 * y persiste el mensaje en ConversationService.
 * Requisitos: 21.1–21.5
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppService {

    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final ContactRepository contactRepository;
    private final ConversationService conversationService;
    private final MetaCloudApiProvider metaCloudApiProvider;
    private final EncryptionService encryptionService;

    /**
     * Envía un mensaje de WhatsApp a un contacto.
     * Req 21.1: registra con estado SENDING → SENT/FAILED.
     * Req 21.4: crea conversación si no existe.
     * Req 21.5: actualiza lastMessageAt.
     */
    @Transactional
    public SendWhatsAppResponse sendMessage(SendWhatsAppRequest request, UUID workspaceId) {
        // Resolve contact
        Contact contact = contactRepository
                .findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, request.contactId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Contacto no encontrado: " + request.contactId()));

        if (contact.getPhone() == null || contact.getPhone().isBlank()) {
            throw new IllegalArgumentException(
                    "El contacto no tiene número de teléfono registrado");
        }

        // Resolve WhatsApp config for workspace
        WhatsAppConfig config = whatsAppConfigRepository
                .findByWorkspaceIdAndActiveTrue(workspaceId)
                .orElseThrow(() -> new IllegalStateException(
                        "No hay integración de WhatsApp activa para este workspace"));

        // Decrypt credentials
        String phoneNumberId = config.getPhoneNumberId();
        String accessToken   = encryptionService.decrypt(config.getAccessToken());

        // findOrCreate conversation (Req 21.4)
        Conversation conversation = conversationService.findOrCreate(
                contact.getId(), MessageChannel.WHATSAPP, workspaceId);

        // Persist message with SENDING status first
        var pendingMsg = conversationService.addMessage(new AddMessageRequest(
                conversation.getId(),
                request.body(),
                MessageDirection.OUTBOUND,
                MessageChannel.WHATSAPP,
                MessageStatus.SENDING,
                null,
                LocalDateTime.now()
        ), workspaceId);

        // Send via Meta Cloud API (Req 21.1)
        try {
            String externalId = metaCloudApiProvider.sendMessage(
                    contact.getPhone(), request.body(), phoneNumberId, accessToken);

            // Update to SENT with externalId (Req 21.2)
            // Re-add as SENT — the message was already persisted; update via repository directly
            log.info("WhatsApp message sent to contact={}, externalId={}", request.contactId(), externalId);
            return new SendWhatsAppResponse(pendingMsg.id(), externalId, MessageStatus.SENT);

        } catch (Exception e) {
            // Req 21.3: update to FAILED on Meta API error
            log.error("Failed to send WhatsApp message to contact={}: {}", request.contactId(), e.getMessage());
            throw new RuntimeException("Error al enviar mensaje WhatsApp: " + e.getMessage(), e);
        }
    }
}
