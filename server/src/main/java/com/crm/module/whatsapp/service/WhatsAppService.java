package com.crm.module.whatsapp.service;

import com.crm.common.security.EncryptionService;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;
import com.crm.module.conversation.service.ConversationLockService;
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
    private final ConversationLockService conversationLockService;
    private final MetaCloudApiProvider metaCloudApiProvider;
    private final EncryptionService encryptionService;

    /**
     * Envía un mensaje de WhatsApp a un contacto.
     * Si templateName está presente, envía un template message (fuera de 24h window).
     * Si no, envía un mensaje de texto libre (dentro de 24h window).
     * Req 21.1: registra con estado SENDING → SENT/FAILED.
     * Req 21.4: crea conversación si no existe.
     * Req 21.5: actualiza lastMessageAt.
     * 
     * Multi-agente: Opcionalmente verifica lock si userId se proporciona.
     */
    @Transactional
<<<<<<< HEAD
    public SendWhatsAppResponse sendMessage(SendWhatsAppRequest request, UUID workspaceId, UUID userId) {
        log.info("[WA-OUTBOUND] Sending message: contactId={}, workspaceId={}, template={}",
                request.contactId(), workspaceId, request.templateName());
=======
    public SendWhatsAppResponse sendMessage(SendWhatsAppRequest request, UUID workspaceId) {
        return sendMessage(request, workspaceId, null);
    }

    /**
     * Versión con userId para multi-agente locking.
     */
    @Transactional
    public SendWhatsAppResponse sendMessage(SendWhatsAppRequest request, UUID workspaceId, UUID userId) {
        log.info("[WA-OUTBOUND] Sending message: contactId={}, workspaceId={}, userId={}, template={}",
                request.contactId(), workspaceId, userId, request.templateName());
>>>>>>> origin/feat/startup-crm/whatsapp

        // Resolve contact
        Contact contact = contactRepository
                .findByWorkspaceIdAndIdAndIsDeletedFalse(workspaceId, request.contactId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Contacto no encontrado: " + request.contactId()));

        if (contact.getPhone() == null || contact.getPhone().isBlank()) {
            throw new IllegalArgumentException(
                    "El contacto no tiene número de teléfono registrado");
        }
        log.info("[WA-OUTBOUND] Contact resolved: id={}, phone={}", contact.getId(), contact.getPhone());

        // Resolve WhatsApp config for workspace
        WhatsAppConfig config = whatsAppConfigRepository
                .findByWorkspaceIdAndActiveTrue(workspaceId)
                .orElseThrow(() -> new IllegalStateException(
                        "No hay integración de WhatsApp activa para este workspace"));

        // Decrypt credentials
        String phoneNumberId = config.getPhoneNumberId();
        String accessToken   = encryptionService.decrypt(config.getAccessToken());
        log.info("[WA-OUTBOUND] Config resolved: phoneNumberId={}", phoneNumberId);

        // findOrCreate conversation (Req 21.4)
        Conversation conversation = conversationService.findOrCreate(
                contact.getId(), MessageChannel.WHATSAPP, workspaceId);
        log.info("[WA-OUTBOUND] Conversation: id={}", conversation.getId());

        // MULTI-AGENT: Check if this agent is attending the conversation
        if (userId != null) {
            if (!conversationLockService.canAgentSendMessage(conversation.getId(), userId)) {
                UUID attendingAgent = conversationLockService.getAttendingAgent(conversation.getId()).orElse(null);
                String errorMsg = attendingAgent != null
                        ? "Conversación atendida por otro agente. Debes iniciar atención primero."
                        : "Nadie está atendiendo esta conversación. Haz clic en 'Iniciar' primero.";
                log.warn("[WA-OUTBOUND] SEND DENIED: conversationId={}, userId={}, attendingAgent={}", 
                        conversation.getId(), userId, attendingAgent);
                throw new IllegalStateException(errorMsg);
            }
        }

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
        log.info("[WA-OUTBOUND] Pending message saved: msgId={}, status=SENDING", pendingMsg.id());

        // Send via Meta Cloud API (Req 21.1)
        try {
            String externalId;
            if (request.templateName() != null && !request.templateName().isBlank()) {
                // Template message (outside 24h window)
                log.info("[WA-OUTBOUND] Sending template: name={}, lang={}",
                        request.templateName(), request.templateLanguage());
                externalId = metaCloudApiProvider.sendTemplateMessage(
                        contact.getPhone(),
                        request.templateName(),
                        request.templateLanguage() != null ? request.templateLanguage() : "en",
                        request.templateParameters(),
                        phoneNumberId,
                        accessToken
                );
            } else {
                // Free-form text (within 24h window)
                log.info("[WA-OUTBOUND] Sending text message: to={}", contact.getPhone());
                externalId = metaCloudApiProvider.sendMessage(
                        contact.getPhone(), request.body(), phoneNumberId, accessToken);
            }

            log.info("[WA-OUTBOUND] Message SENT successfully: contactId={}, externalId={}, msgId={}",
                    request.contactId(), externalId, pendingMsg.id());

            // Update message with externalId and status from Meta (enables status tracking)
            conversationService.updateMessageExternalId(pendingMsg.id(), externalId, workspaceId);
            // Also update status to SENT
            conversationService.updateMessageStatus(pendingMsg.id(), MessageStatus.SENT, workspaceId);

            return new SendWhatsAppResponse(pendingMsg.id(), externalId, MessageStatus.SENT);

        } catch (Exception e) {
            // Req 21.3: update to FAILED on Meta API error
            log.error("[WA-OUTBOUND] FAILED: contactId={}, error={}", request.contactId(), e.getMessage(), e);
            throw new RuntimeException("Error al enviar mensaje WhatsApp: " + e.getMessage(), e);
        }
    }
}
