package com.crm.module.whatsapp.service;

import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Procesa los payloads entrantes del webhook de Meta Cloud API.
 * - Identifica contacto por teléfono en el workspace
 * - Crea contacto nuevo si no existe (estado NEW)
 * - Delega persistencia del mensaje a ConversationService
 * - Garantiza idempotencia por externalId
 * Requisitos: 20.1–20.5
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppWebhookService {

    private final WhatsAppConfigRepository whatsAppConfigRepository;
    private final ContactRepository contactRepository;
    private final ConversationService conversationService;
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    /**
     * Req 20.5: verifica la firma HMAC-SHA256 del payload.
     * Extrae el phone_number_id del payload para resolver el workspace y obtener el app_secret.
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

            String appSecret = configOpt.get().getAppSecret();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(), "HmacSHA256"));
            String expected = "sha256=" + HexFormat.of().formatHex(mac.doFinal(payload.getBytes()));
            return MessageDigest.isEqual(expected.getBytes(), signature.getBytes());
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Procesa el payload JSON del webhook de Meta.
     * Req 20.2: identifica contacto por teléfono dentro del workspace.
     * Req 20.3: crea contacto nuevo con status NEW si no existe.
     * Req 20.4: registra mensaje con externalId, dirección INBOUND, canal WHATSAPP.
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
                    if (!"messages".equals(field)) continue;

                    String phoneNumberId = value.path("metadata").path("phone_number_id").asText(null);
                    if (phoneNumberId == null) continue;

                    // Resolve workspace via phone_number_id
                    Optional<WhatsAppConfig> configOpt = whatsAppConfigRepository
                            .findByPhoneNumberIdAndActiveTrue(phoneNumberId);
                    if (configOpt.isEmpty()) {
                        log.warn("No active WhatsApp config for phone_number_id={}", phoneNumberId);
                        continue;
                    }
                    UUID workspaceId = configOpt.get().getWorkspaceId();

                    JsonNode messages = value.path("messages");
                    if (!messages.isArray()) continue;

                    for (JsonNode msg : messages) {
                        String type = msg.path("type").asText();
                        if (!"text".equals(type)) continue;

                        String externalId = msg.path("id").asText(null);
                        String fromPhone  = msg.path("from").asText(null);
                        String body       = msg.path("text").path("body").asText(null);
                        long   tsEpoch    = msg.path("timestamp").asLong(0);

                        if (externalId == null || fromPhone == null) continue;

                        // Req 20.4: idempotencia — skip if already processed
                        if (messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP).isPresent()) {
                            log.info("Duplicate webhook message ignored: externalId={}", externalId);
                            continue;
                        }

                        // Req 20.2: find contact by phone within workspace
                        Contact contact = contactRepository
                                .findByWorkspaceIdAndPhoneAndDeletedFalse(workspaceId, fromPhone)
                                .orElseGet(() -> createContact(workspaceId, fromPhone));

                        // findOrCreate conversation
                        Conversation conversation = conversationService.findOrCreate(
                                contact.getId(), MessageChannel.WHATSAPP, workspaceId);

                        // Req 20.4: persist message
                        LocalDateTime sentAt = tsEpoch > 0
                                ? LocalDateTime.ofInstant(Instant.ofEpochSecond(tsEpoch), ZoneOffset.UTC)
                                : LocalDateTime.now();

                        conversationService.addMessage(new AddMessageRequest(
                                conversation.getId(),
                                body,
                                MessageDirection.INBOUND,
                                MessageChannel.WHATSAPP,
                                null,
                                externalId,
                                sentAt
                        ), workspaceId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing WhatsApp webhook payload", e);
            throw new RuntimeException("Failed to process webhook payload", e);
        }
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
