package com.crm.module.whatsapp.service;

import com.crm.common.security.EncryptionService;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.Message;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.MetaCloudApiProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

/**
 * Procesa los payloads entrantes del webhook de Meta Cloud API.
 * - Identifica contacto por teléfono en el workspace (Req 20.2)
 * - Crea contacto nuevo con estado NEW si no existe (Req 20.3)
 * - Delega persistencia del mensaje a ConversationService (Req 20.4)
 * - Garantiza idempotencia por externalId (Req 20.4)
 * - Verifica firma HMAC-SHA256 (Req 20.5)
 * Requisitos: 20.1–20.6
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppWebhookService {

    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final ContactRepository contactRepository;
    private final ConversationService conversationService;
    private final MessageRepository messageRepository;
    private final MetaCloudApiProvider metaCloudApiProvider;
    private final EncryptionService encryptionService;
    private final ObjectMapper objectMapper;

    /**
     * Req 20.5: verifica la firma HMAC-SHA256 del payload.
     * Extrae el phone_number_id del payload para resolver el workspace y obtener el app_secret.
     * El appSecret se descifra antes de usarlo para la verificación HMAC.
     */
    public boolean verifySignature(String payload, String signature) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            String phoneNumberId = root.path("entry").path(0)
                    .path("changes").path(0)
                    .path("value").path("metadata").path("phone_number_id").asText(null);

            if (phoneNumberId == null) return false;

            Optional<WhatsAppConfig> configOpt = whatsAppConfigRepository
                    .findByPhoneNumberIdAndActiveTrue(phoneNumberId);
            if (configOpt.isEmpty() || configOpt.get().getAppSecret() == null) return false;

            // Decrypt appSecret before HMAC verification (NFR-6)
            String appSecret = encryptionService.decrypt(configOpt.get().getAppSecret());
            return metaCloudApiProvider.verifyWebhookSignature(payload, signature, appSecret);

        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Procesa el payload JSON del webhook de Meta.
     * Soporta dos tipos de eventos:
     * 1. "messages" — inbound messages (text, media, interactive, etc.)
     * 2. "statuses" — outbound message status updates (sent, delivered, read, failed)
     *
     * Req 20.2: identifica contacto por teléfono dentro del workspace.
     * Req 20.3: crea contacto nuevo con status NEW si no existe.
     * Req 20.4: registra mensaje con externalId, dirección INBOUND, canal WHATSAPP.
     * Idempotencia: verifica externalId antes de insertar (ignora duplicados).
     */
    @Transactional
    public void processPayload(String payloadJson) {
        try {
            JsonNode root = objectMapper.readTree(payloadJson);
            JsonNode entries = root.path("entry");
            if (entries.isMissingNode() || !entries.isArray()) return;

            for (JsonNode entry : entries) {
                for (JsonNode change : entry.path("changes")) {
                    JsonNode value = change.path("value");
                    String field = change.path("field").asText();

                    if ("messages".equals(field)) {
                        processInboundMessages(value);
                    } else if ("statuses".equals(field)) {
                        processStatusUpdates(value);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook payload", e);
            throw new RuntimeException("Failed to process webhook payload", e);
        }
    }

    /**
     * Procesa mensajes entrantes (inbound) del webhook.
     */
    private void processInboundMessages(JsonNode value) {
        String phoneNumberId = value.path("metadata").path("phone_number_id").asText(null);
        if (phoneNumberId == null) return;

        // Resolve workspace via phone_number_id
        Optional<WhatsAppConfig> configOpt = whatsAppConfigRepository
                .findByPhoneNumberIdAndActiveTrue(phoneNumberId);
        if (configOpt.isEmpty()) {
            log.warn("No active WhatsApp config for phone_number_id={}", phoneNumberId);
            return;
        }
        UUID workspaceId = configOpt.get().getWorkspaceId();

        JsonNode messages = value.path("messages");
        if (!messages.isArray()) return;

        for (JsonNode msg : messages) {
            String type = msg.path("type").asText();
            String externalId = msg.path("id").asText(null);
            String fromPhone  = msg.path("from").asText(null);

            if (externalId == null || fromPhone == null) continue;

            // Req 20.4: idempotencia — skip if already processed
            if (messageRepository.findByExternalIdAndChannel(
                    externalId, MessageChannel.WHATSAPP).isPresent()) {
                log.info("Duplicate webhook message ignored: externalId={}", externalId);
                continue;
            }

            // Req 20.2: find contact by phone within workspace
            // Req 20.3: create new contact with status NEW if not found
            Contact contact = contactRepository
                    .findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone)
                    .orElseGet(() -> createContact(workspaceId, fromPhone));

            // findOrCreate conversation (Req 21.4)
            Conversation conversation = conversationService.findOrCreate(
                    contact.getId(), MessageChannel.WHATSAPP, workspaceId);

            long tsEpoch = msg.path("timestamp").asLong(0);
            LocalDateTime sentAt = tsEpoch > 0
                    ? LocalDateTime.ofInstant(Instant.ofEpochSecond(tsEpoch), ZoneOffset.UTC)
                    : LocalDateTime.now();

            if ("text".equals(type)) {
                String body = msg.path("text").path("body").asText(null);
                if (body == null) continue;

                conversationService.addMessage(new AddMessageRequest(
                        conversation.getId(),
                        body,
                        MessageDirection.INBOUND,
                        MessageChannel.WHATSAPP,
                        null,
                        externalId,
                        sentAt
                ), workspaceId);

            } else if ("interactive".equals(type)) {
                // Handle button/list replies
                JsonNode interactive = msg.path("interactive");
                String replyBody = extractInteractiveReply(interactive);
                if (replyBody != null) {
                    conversationService.addMessage(new AddMessageRequest(
                            conversation.getId(),
                            replyBody,
                            MessageDirection.INBOUND,
                            MessageChannel.WHATSAPP,
                            null,
                            externalId,
                            sentAt
                    ), workspaceId);
                }

            } else if ("image".equals(type) || "document".equals(type) ||
                       "video".equals(type) || "audio".equals(type)) {
                // Media messages — store caption or media type as body
                String caption = msg.path(type).path("caption").asText(null);
                String mimeType = msg.path(type).path("mime_type").asText(null);
                String mediaBody = caption != null ? caption : "[" + type.toUpperCase() + ": " + mimeType + "]";

                conversationService.addMessage(new AddMessageRequest(
                        conversation.getId(),
                        mediaBody,
                        MessageDirection.INBOUND,
                        MessageChannel.WHATSAPP,
                        null,
                        externalId,
                        sentAt
                ), workspaceId);
            }
        }
    }

    /**
     * Procesa actualizaciones de estado de mensajes salientes.
     * Statuses: sent, delivered, read, failed, deleted
     */
    private void processStatusUpdates(JsonNode value) {
        JsonNode statuses = value.path("statuses");
        if (!statuses.isArray()) return;

        for (JsonNode status : statuses) {
            String externalId = status.path("id").asText(null);
            String statusValue = status.path("status").asText(null);
            String recipientId = status.path("recipient_id").asText(null);

            if (externalId == null || statusValue == null) continue;

            // Find message by externalId and update status
            messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP)
                    .ifPresent(message -> {
                        MessageStatus newStatus = mapStatusToEnum(statusValue);
                        if (newStatus != null && message.getStatus() != newStatus) {
                            message.setStatus(newStatus);
                            messageRepository.save(message);
                            log.info("Message {} status updated to {} (recipient: {})",
                                    externalId, statusValue, recipientId);
                        }
                    });

            // Log failures for monitoring
            if ("failed".equals(statusValue)) {
                JsonNode errors = status.path("errors");
                if (errors.isArray() && errors.size() > 0) {
                    String errorCode = errors.get(0).path("code").asText("unknown");
                    String errorMsg = errors.get(0).path("message").asText("unknown");
                    log.warn("WhatsApp message failed: externalId={}, code={}, message={}",
                            externalId, errorCode, errorMsg);
                }
            }
        }
    }

    /**
     * Extrae el texto de una respuesta interactiva (button o list).
     */
    private String extractInteractiveReply(JsonNode interactive) {
        String type = interactive.path("type").asText();
        if ("button_reply".equals(type)) {
            JsonNode reply = interactive.path("button_reply");
            String title = reply.path("title").asText(null);
            String id = reply.path("id").asText(null);
            return title != null ? title : (id != null ? "[button:" + id + "]" : null);
        } else if ("list_reply".equals(type)) {
            JsonNode reply = interactive.path("list_reply");
            String title = reply.path("title").asText(null);
            String id = reply.path("id").asText(null);
            return title != null ? title : (id != null ? "[list:" + id + "]" : null);
        }
        return null;
    }

    /**
     * Mapea el string de status de Meta al enum MessageStatus.
     */
    private MessageStatus mapStatusToEnum(String status) {
        return switch (status.toLowerCase()) {
            case "sent" -> MessageStatus.SENT;
            case "delivered" -> MessageStatus.DELIVERED;
            case "read" -> MessageStatus.READ;
            case "failed" -> MessageStatus.FAILED;
            case "deleted" -> MessageStatus.DELETED;
            default -> null;
        };
    }

    /** Req 20.3: crea contacto nuevo con status NEW usando el teléfono como identificador. */
    private Contact createContact(UUID workspaceId, String phone) {
        Contact contact = new Contact();
        contact.setWorkspaceId(workspaceId);
        contact.setName(phone);
        contact.setPhone(phone);
        contact.setStatus(ContactStatus.NEW);
        return contactRepository.save(contact);
    }
}
