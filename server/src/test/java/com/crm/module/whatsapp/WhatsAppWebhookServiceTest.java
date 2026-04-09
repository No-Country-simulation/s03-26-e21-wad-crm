package com.crm.module.whatsapp;

import com.crm.common.security.EncryptionService;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.entity.MessageStatus;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.MetaCloudApiProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import com.crm.module.whatsapp.service.WhatsAppWebhookService;
import com.crm.module.conversation.entity.Message;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link WhatsAppWebhookService}.
 *
 * Validates: Requisitos 20.1, 20.3, 20.4, 20.5
 */
@ExtendWith(MockitoExtension.class)
class WhatsAppWebhookServiceTest {

    @Mock WhatsAppConfigRepository configRepository;
    @Mock ContactRepository contactRepository;
    @Mock ConversationService conversationService;
    @Mock MessageRepository messageRepository;
    @Mock MetaCloudApiProvider metaCloudApiProvider;
    @Mock EncryptionService encryptionService;
    @Mock org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    WhatsAppWebhookService service;

    final UUID workspaceId   = UUID.randomUUID();
    final String phoneNumberId = "12345678";
    final String appSecretEncrypted = "encrypted-secret";
    final String appSecretPlain     = "my-app-secret";

    @BeforeEach
    void setUp() {
        // Note: appTimezone is set via @Value, not constructor
        service = new WhatsAppWebhookService(
                configRepository, contactRepository, conversationService,
                messageRepository, metaCloudApiProvider, encryptionService,
                new ObjectMapper(), messagingTemplate);
        // Inject appTimezone via reflection for tests
        try {
            var field = WhatsAppWebhookService.class.getDeclaredField("appTimezone");
            field.setAccessible(true);
            field.set(service, "America/Guayaquil");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // -------------------------------------------------------------------------
    // Req 20.5 — invalid signature → verifySignature returns false
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 20.5
     * When the HMAC-SHA256 signature is invalid, verifySignature must return false
     * so the controller can respond with 403.
     */
    @Test
    void verifySignature_invalidSignature_returnsFalse() {
        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));
        when(encryptionService.decrypt(appSecretEncrypted)).thenReturn(appSecretPlain);
        when(metaCloudApiProvider.verifyWebhookSignature(any(), any(), eq(appSecretPlain)))
                .thenReturn(false);

        String payload = buildPayload(phoneNumberId, "wamid.abc123", "5491100000000", "hello");
        boolean result = service.verifySignature(payload, "sha256=invalidsignature");

        assertThat(result).isFalse();
    }

    /**
     * Validates: Requisito 20.5
     * When the HMAC-SHA256 signature is valid, verifySignature must return true.
     */
    @Test
    void verifySignature_validSignature_returnsTrue() {
        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));
        when(encryptionService.decrypt(appSecretEncrypted)).thenReturn(appSecretPlain);
        when(metaCloudApiProvider.verifyWebhookSignature(any(), any(), eq(appSecretPlain)))
                .thenReturn(true);

        String payload = buildPayload(phoneNumberId, "wamid.abc123", "5491100000000", "hello");
        boolean result = service.verifySignature(payload, "sha256=validsignature");

        assertThat(result).isTrue();
    }

    /**
     * Validates: Requisito 20.5
     * When no active config is found for the phone_number_id, verifySignature returns false.
     */
    @Test
    void verifySignature_noConfigFound_returnsFalse() {
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.empty());

        String payload = buildPayload(phoneNumberId, "wamid.abc123", "5491100000000", "hello");
        boolean result = service.verifySignature(payload, "sha256=anything");

        assertThat(result).isFalse();
        verify(metaCloudApiProvider, never()).verifyWebhookSignature(any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // Req 20.3 — new contact auto-created when phone not found in workspace
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 20.3
     * When no contact exists for the incoming phone number in the workspace,
     * a new contact with status NEW must be created automatically.
     */
    @Test
    void processPayload_newPhone_contactCreatedWithStatusNew() {
        String externalId = "wamid.newcontact";
        String fromPhone  = "5491199999999";

        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        // Phone not found → will create new contact
        when(contactRepository.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.empty());

        Contact newContact = buildContact(UUID.randomUUID(), fromPhone);
        when(contactRepository.save(any(Contact.class))).thenReturn(newContact);

        // No duplicate
        when(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());

        Conversation conv = buildConversation(newContact.getId());
        when(conversationService.findOrCreate(newContact.getId(), MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conv);
        when(conversationService.addMessage(any(), eq(workspaceId))).thenReturn(null);

        service.processPayload(buildPayload(phoneNumberId, externalId, fromPhone, "hola"));

        // Verify a new contact was saved with status NEW and the phone number
        ArgumentCaptor<Contact> contactCaptor = ArgumentCaptor.forClass(Contact.class);
        verify(contactRepository).save(contactCaptor.capture());
        Contact saved = contactCaptor.getValue();
        assertThat(saved.getStatus()).isEqualTo(ContactStatus.NEW);
        assertThat(saved.getPhone()).isEqualTo(fromPhone);
        assertThat(saved.getWorkspaceId()).isEqualTo(workspaceId);
    }

    /**
     * Validates: Requisito 20.3
     * When a contact already exists for the phone number, no new contact is created.
     */
    @Test
    void processPayload_existingPhone_noNewContactCreated() {
        String externalId = "wamid.existing";
        String fromPhone  = "5491188888888";

        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        Contact existing = buildContact(UUID.randomUUID(), fromPhone);
        when(contactRepository.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.of(existing));

        when(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());

        Conversation conv = buildConversation(existing.getId());
        when(conversationService.findOrCreate(existing.getId(), MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conv);
        when(conversationService.addMessage(any(), eq(workspaceId))).thenReturn(null);

        service.processPayload(buildPayload(phoneNumberId, externalId, fromPhone, "hola"));

        // contactRepository.save must NOT be called (no new contact)
        verify(contactRepository, never()).save(any());
    }

    // -------------------------------------------------------------------------
    // Req 20.4 — duplicate message ignored (idempotency)
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 20.4
     * When the same externalId is processed twice, addMessage must be called only once.
     */
    @Test
    void processPayload_duplicateExternalId_messageNotPersistedTwice() {
        String externalId = "wamid.duplicate";
        String fromPhone  = "5491177777777";

        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        Contact contact = buildContact(UUID.randomUUID(), fromPhone);
        when(contactRepository.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.of(contact));

        Conversation conv = buildConversation(contact.getId());
        when(conversationService.findOrCreate(contact.getId(), MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conv);
        when(conversationService.addMessage(any(), eq(workspaceId))).thenReturn(null);

        String payload = buildPayload(phoneNumberId, externalId, fromPhone, "hello");

        // First call: externalId not in DB
        when(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());
        service.processPayload(payload);

        // Second call: externalId already in DB
        Message existing = new Message();
        existing.setExternalId(externalId);
        when(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.of(existing));
        service.processPayload(payload);

        // addMessage called exactly once across both invocations
        verify(conversationService, times(1)).addMessage(any(), eq(workspaceId));
    }

    // -------------------------------------------------------------------------
    // Req 20.1 — valid payload processed successfully
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 20.1
     * A valid webhook payload must be processed: message persisted with INBOUND direction
     * and WHATSAPP channel.
     */
    @Test
    void processPayload_validPayload_messagePersistedWithCorrectAttributes() {
        String externalId = "wamid.valid001";
        String fromPhone  = "5491166666666";
        String body       = "mensaje de prueba";

        WhatsAppConfig config = buildConfig();
        when(configRepository.findByPhoneNumberIdAndActiveTrue(phoneNumberId))
                .thenReturn(Optional.of(config));

        Contact contact = buildContact(UUID.randomUUID(), fromPhone);
        when(contactRepository.findByWorkspaceIdAndPhoneAndIsDeletedFalse(workspaceId, fromPhone))
                .thenReturn(Optional.of(contact));

        when(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .thenReturn(Optional.empty());

        Conversation conv = buildConversation(contact.getId());
        when(conversationService.findOrCreate(contact.getId(), MessageChannel.WHATSAPP, workspaceId))
                .thenReturn(conv);
        when(conversationService.addMessage(any(), eq(workspaceId))).thenReturn(null);

        service.processPayload(buildPayload(phoneNumberId, externalId, fromPhone, body));

        ArgumentCaptor<AddMessageRequest> captor = ArgumentCaptor.forClass(AddMessageRequest.class);
        verify(conversationService).addMessage(captor.capture(), eq(workspaceId));

        AddMessageRequest req = captor.getValue();
        assertThat(req.externalId()).isEqualTo(externalId);
        assertThat(req.direction()).isEqualTo(MessageDirection.INBOUND);
        assertThat(req.channel()).isEqualTo(MessageChannel.WHATSAPP);
        assertThat(req.body()).isEqualTo(body);
        assertThat(req.conversationId()).isEqualTo(conv.getId());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private WhatsAppConfig buildConfig() {
        WhatsAppConfig config = new WhatsAppConfig();
        config.setPhoneNumberId(phoneNumberId);
        config.setActive(true);
        config.setWorkspaceId(workspaceId);
        config.setAppSecret(appSecretEncrypted);
        return config;
    }

    private Contact buildContact(UUID id, String phone) {
        Contact c = new Contact();
        c.setId(id);
        c.setWorkspaceId(workspaceId);
        c.setPhone(phone);
        c.setName(phone);
        c.setStatus(ContactStatus.NEW);
        return c;
    }

    private Conversation buildConversation(UUID contactId) {
        Conversation conv = new Conversation();
        conv.setId(UUID.randomUUID());
        conv.setWorkspaceId(workspaceId);
        conv.setContactId(contactId);
        conv.setChannel(MessageChannel.WHATSAPP);
        return conv;
    }

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
             +         "\"text\":{\"body\":\"" + body.replace("\"", "\\\"") + "\"}"
             +       "}]"
             +     "}"
             +   "}]"
             + "}]"
             + "}";
    }
}
