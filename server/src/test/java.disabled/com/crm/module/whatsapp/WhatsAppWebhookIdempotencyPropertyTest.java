package com.crm.module.whatsapp;

import com.crm.common.security.EncryptionService;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.Message;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.MetaCloudApiProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.crm.module.whatsapp.service.WhatsAppWebhookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.jqwik.api.*;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Property-based tests for webhook idempotency.
 *
 * **Validates: Requisito 20.4**
 *
 * Property 13: procesar el mismo payload dos veces (mismo externalId) crea exactamente un mensaje.
 *
 * ∀ externalId ∈ Strings, ∀ phone ∈ Phones, ∀ body ∈ Strings:
 *   processPayload(payload) called twice with the same externalId
 *   → messageRepository.save() is called exactly once (duplicate is ignored)
 */
class WhatsAppWebhookIdempotencyPropertyTest {

    // -------------------------------------------------------------------------
    // Property 13: same externalId processed twice → exactly one message saved
    //
    // ∀ externalId ∈ Strings, ∀ fromPhone ∈ Phones, ∀ body ∈ Strings:
    //   calling processPayload twice with the same externalId must result in
    //   ConversationService.addMessage() being invoked exactly once.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 20.4**
     *
     * The idempotency guard in WhatsAppWebhookService checks
     * messageRepository.findByExternalIdAndChannel() before inserting.
     * On the second call with the same externalId the check returns a present
     * Optional, so addMessage() must NOT be called again — exactly one message
     * is persisted regardless of how many times the same payload arrives.
     */
    @Property
    void processingTheSamePayloadTwiceCreatesExactlyOneMessage(
            @ForAll("externalIds") String externalId,
            @ForAll("phoneNumbers") String fromPhone,
            @ForAll("messageBodies") String body) throws Exception {

        // ── Arrange ──────────────────────────────────────────────────────────
        UUID workspaceId = UUID.randomUUID();
        UUID contactId   = UUID.randomUUID();
        UUID convId      = UUID.randomUUID();
        String phoneNumberId = "phone-number-id-" + UUID.randomUUID();

WhatsAppConfigRepository configRepo    = Mockito.mock(WhatsAppConfigRepository.class);
        ContactRepository        contactRepo   = Mockito.mock(ContactRepository.class);
        ConversationService      convService   = Mockito.mock(ConversationService.class);
        MessageRepository        messageRepo   = Mockito.mock(MessageRepository.class);
        MetaCloudApiProvider     metaProvider  = Mockito.mock(MetaCloudApiProvider.class);
        EncryptionService        encryptionSvc = Mockito.mock(EncryptionService.class);
        ObjectMapper             objectMapper  = new ObjectMapper();
        org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate = 
                Mockito.mock(org.springframework.messaging.simp.SimpMessagingTemplate.class);

        WhatsAppWebhookService service = new WhatsAppWebhookService(
                configRepo, contactRepo, convService, messageRepo,
<<<<<<< HEAD:server/src/test/java/com/crm/module/whatsapp/WhatsAppWebhookIdempotencyPropertyTest.java
                metaProvider, encryptionSvc, objectMapper,
                Mockito.mock(org.springframework.messaging.simp.SimpMessagingTemplate.class));
=======
                metaProvider, encryptionSvc, objectMapper, messagingTemplate);
>>>>>>> origin/feat/startup-crm/whatsapp:server/src/test/java.disabled/com/crm/module/whatsapp/WhatsAppWebhookIdempotencyPropertyTest.java

        WhatsAppConfig config = new WhatsAppConfig();
        config.setPhoneNumberId(phoneNumberId);
        config.setActive(true);
        // AuditableEntity sets workspaceId via setter
        config.setWorkspaceId(workspaceId);

        when(configRepo.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        // Contact found by phone
        Contact contact = new Contact();
        contact.setId(contactId);
        contact.setWorkspaceId(workspaceId);
        contact.setPhone(fromPhone);
        contact.setStatus(ContactStatus.NEW);

        when(contactRepo.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.of(contact));

        // Conversation found or created
        Conversation conversation = new Conversation();
        conversation.setId(convId);
        conversation.setWorkspaceId(workspaceId);
        conversation.setContactId(contactId);
        conversation.setChannel(MessageChannel.WHATSAPP);

        when(convService.findOrCreate(contactId, MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conversation);

        // Stub addMessage to return a minimal MessageDto (not used in assertion)
        when(convService.addMessage(any(AddMessageRequest.class), eq(workspaceId)))
                .thenReturn(null);

        // ── First call: externalId NOT yet in DB → message is saved ──────────
        when(messageRepo.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());

        String payload = buildPayload(phoneNumberId, externalId, fromPhone, body);
        service.processPayload(payload);

        // ── Second call: externalId IS already in DB → duplicate ignored ─────
        Message existingMessage = new Message();
        existingMessage.setExternalId(externalId);
        existingMessage.setChannel(MessageChannel.WHATSAPP);

        when(messageRepo.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.of(existingMessage));

        service.processPayload(payload);

        // ── Assert ────────────────────────────────────────────────────────────
        // addMessage must have been called exactly once across both processPayload invocations
        verify(convService, times(1))
                .addMessage(any(AddMessageRequest.class), eq(workspaceId));
    }

    // -------------------------------------------------------------------------
    // Property 13b: first call always triggers message creation
    //
    // ∀ externalId ∈ Strings:
    //   when externalId is not yet in DB, processPayload() must call addMessage() once.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requisito 20.4**
     *
     * Complementary property: the first time a payload arrives (externalId absent
     * from DB), the service must always persist the message — it must not silently
     * drop legitimate new messages.
     */
    @Property
    void firstOccurrenceOfPayloadAlwaysCreatesMessage(
            @ForAll("externalIds") String externalId,
            @ForAll("phoneNumbers") String fromPhone,
            @ForAll("messageBodies") String body) throws Exception {

        // ── Arrange ──────────────────────────────────────────────────────────
        UUID workspaceId = UUID.randomUUID();
        UUID contactId   = UUID.randomUUID();
        UUID convId      = UUID.randomUUID();
        String phoneNumberId = "phone-number-id-" + UUID.randomUUID();

        WhatsAppConfigRepository configRepo    = Mockito.mock(WhatsAppConfigRepository.class);
        ContactRepository        contactRepo   = Mockito.mock(ContactRepository.class);
        ConversationService      convService   = Mockito.mock(ConversationService.class);
        MessageRepository        messageRepo   = Mockito.mock(MessageRepository.class);
        MetaCloudApiProvider     metaProvider  = Mockito.mock(MetaCloudApiProvider.class);
        EncryptionService        encryptionSvc = Mockito.mock(EncryptionService.class);
        ObjectMapper             objectMapper  = new ObjectMapper();
        org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate = 
                Mockito.mock(org.springframework.messaging.simp.SimpMessagingTemplate.class);

        WhatsAppWebhookService service = new WhatsAppWebhookService(
                configRepo, contactRepo, convService, messageRepo,
<<<<<<< HEAD:server/src/test/java/com/crm/module/whatsapp/WhatsAppWebhookIdempotencyPropertyTest.java
                metaProvider, encryptionSvc, objectMapper,
                Mockito.mock(org.springframework.messaging.simp.SimpMessagingTemplate.class));
=======
                metaProvider, encryptionSvc, objectMapper, messagingTemplate);
>>>>>>> origin/feat/startup-crm/whatsapp:server/src/test/java.disabled/com/crm/module/whatsapp/WhatsAppWebhookIdempotencyPropertyTest.java

        WhatsAppConfig config = new WhatsAppConfig();
        config.setPhoneNumberId(phoneNumberId);
        config.setActive(true);
        config.setWorkspaceId(workspaceId);

        when(configRepo.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        Contact contact = new Contact();
        contact.setId(contactId);
        contact.setWorkspaceId(workspaceId);
        contact.setPhone(fromPhone);
        contact.setStatus(ContactStatus.NEW);

        when(contactRepo.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.of(contact));

        Conversation conversation = new Conversation();
        conversation.setId(convId);
        conversation.setWorkspaceId(workspaceId);
        conversation.setContactId(contactId);
        conversation.setChannel(MessageChannel.WHATSAPP);

        when(convService.findOrCreate(contactId, MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conversation);

        when(convService.addMessage(any(AddMessageRequest.class), eq(workspaceId)))
                .thenReturn(null);

        // externalId not yet in DB
        when(messageRepo.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());

        // ── Act ───────────────────────────────────────────────────────────────
        String payload = buildPayload(phoneNumberId, externalId, fromPhone, body);
        service.processPayload(payload);

        // ── Assert ────────────────────────────────────────────────────────────
        verify(convService, times(1))
                .addMessage(any(AddMessageRequest.class), eq(workspaceId));

        // Verify the AddMessageRequest carries the correct externalId and direction
        ArgumentCaptor<AddMessageRequest> captor = ArgumentCaptor.forClass(AddMessageRequest.class);
        verify(convService).addMessage(captor.capture(), eq(workspaceId));

        AddMessageRequest captured = captor.getValue();
        assertThat(captured.externalId())
                .as("addMessage must be called with the correct externalId")
                .isEqualTo(externalId);
        assertThat(captured.direction())
                .as("Incoming webhook messages must have INBOUND direction")
                .isEqualTo(MessageDirection.INBOUND);
        assertThat(captured.channel())
                .as("Incoming webhook messages must use WHATSAPP channel")
                .isEqualTo(MessageChannel.WHATSAPP);
    }

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    @Provide
    Arbitrary<String> externalIds() {
        // Meta message IDs look like "wamid.xxx" — use alphanumeric strings
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(8)
                .ofMaxLength(24)
                .map(s -> "wamid." + s);
    }

    @Provide
    Arbitrary<String> phoneNumbers() {
        // E.164-style phone numbers without the leading +
        return Arbitraries.strings()
                .withCharRange('0', '9')
                .ofMinLength(7)
                .ofMaxLength(12)
                .map(digits -> "1" + digits);
    }

    @Provide
    Arbitrary<String> messageBodies() {
        return Arbitraries.strings()
                .withCharRange('a', 'z')
                .ofMinLength(1)
                .ofMaxLength(50);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Builds a minimal Meta Cloud API webhook payload JSON string.
     * Structure mirrors what Meta sends for an inbound text message.
     */
    private String buildPayload(String phoneNumberId, String externalId,
                                String fromPhone, String body) {
        return "{"
             + "\"object\":\"whatsapp_business_account\","
             + "\"entry\":[{"
             +   "\"changes\":[{"
             +     "\"field\":\"messages\","
             +     "\"value\":{"
             +       "\"metadata\":{\"phone_number_id\":\"" + phoneNumberId + "\"},"
             +       "\"messages\":[{"
             +         "\"id\":\"" + externalId + "\","
             +         "\"from\":\"" + fromPhone + "\","
             +         "\"type\":\"text\","
             +         "\"timestamp\":\"1700000000\","
             +         "\"text\":{\"body\":\"" + escapeJson(body) + "\"}"
             +       "}]"
             +     "}"
             +   "}]"
             + "}]"
             + "}";
    }

    /** Minimal JSON string escaping for generated body text. */
    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
