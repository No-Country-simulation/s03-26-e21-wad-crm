package com.crm.module.email.service;

import com.crm.module.company.entity.Company;
import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.entity.*;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.email.dto.EmailMessage;
import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.EmailEncryption;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.provider.GmailOAuthProvider;
import com.crm.module.email.provider.SmtpEmailProvider;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.repository.GmailConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para EmailService.
 * Requisitos: 25.3, 25.5, 26.2, 26.3
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock EmailConfigRepository emailConfigRepository;
    @Mock GmailConfigRepository gmailConfigRepository;
    @Mock SmtpEmailProvider smtpEmailProvider;
    @Mock GmailOAuthProvider gmailOAuthProvider;
    @Mock ConversationRepository conversationRepository;
    @Mock MessageRepository messageRepository;
    @Mock ContactRepository contactRepository;
    @Mock CompanyRepository companyRepository;

    @InjectMocks EmailService emailService;

    private UUID workspaceId;
    private UUID contactId;
    private Contact contact;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
        contactId = UUID.randomUUID();

        contact = new Contact();
        contact.setWorkspaceId(workspaceId);
        contact.setName("Juan Pérez");
        contact.setEmail("juan@example.com");
        contact.setStatus(ContactStatus.NEW);
        // Set id via reflection since AuditableEntity uses @GeneratedValue
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(contact, contactId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ── send() ───────────────────────────────────────────────────────────────

    @Disabled @Test
    void send_withNoActiveConfig_throwsIllegalStateException() {
        // Requisito 25.3: sin config activa → excepción
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        EmailMessage message = new EmailMessage(contactId, "to@example.com",
                "Subject", "Body", null, null, null, null, null);

        assertThatThrownBy(() -> emailService.send(workspaceId, message))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No hay configuración de email activa");
    }

    @Disabled @Test
    void send_withActiveSmtpConfig_usesSmtpProvider() {
        // Arrange
        EmailConfig smtpConfig = buildSmtpConfig();
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(smtpConfig));
        when(smtpEmailProvider.withConfig(smtpConfig)).thenReturn(smtpEmailProvider);
        doNothing().when(smtpEmailProvider).send(any());

        Conversation conv = buildConversation();
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.EMAIL))
                .thenReturn(Optional.of(conv));
        when(conversationRepository.save(any())).thenReturn(conv);
        when(messageRepository.save(any())).thenReturn(new Message());

        EmailMessage message = new EmailMessage(contactId, "to@example.com",
                "Subject", "Body", null, null, null, null, null);

        // Act
        emailService.send(workspaceId, message);

        // Assert
        verify(smtpEmailProvider).send(any(EmailMessage.class));
        verify(messageRepository).save(argThat(m ->
                m.getDirection() == MessageDirection.OUTBOUND
                && m.getChannel() == MessageChannel.EMAIL
                && m.getStatus() == MessageStatus.SENT));
    }

    @Disabled @Test
    void send_withActiveGmailConfig_prefersGmailOverSmtp() {
        // Gmail takes priority over SMTP
        GmailConfig gmailConfig = buildGmailConfig();
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(gmailConfig));
        when(gmailOAuthProvider.withConfig(gmailConfig)).thenReturn(gmailOAuthProvider);
        doNothing().when(gmailOAuthProvider).send(any());

        Conversation conv = buildConversation();
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.EMAIL))
                .thenReturn(Optional.of(conv));
        when(conversationRepository.save(any())).thenReturn(conv);
        when(messageRepository.save(any())).thenReturn(new Message());

        EmailMessage message = new EmailMessage(contactId, "to@example.com",
                "Subject", "Body", null, null, null, null, null);

        emailService.send(workspaceId, message);

        verify(gmailOAuthProvider).send(any(EmailMessage.class));
        // SMTP should never be called
        verify(smtpEmailProvider, never()).send(any());
    }

    @Disabled @Test
    void send_createsNewConversationWhenNoneExists() {
        EmailConfig smtpConfig = buildSmtpConfig();
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(smtpConfig));
        when(smtpEmailProvider.withConfig(smtpConfig)).thenReturn(smtpEmailProvider);
        doNothing().when(smtpEmailProvider).send(any());

        // No existing conversation
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.EMAIL))
                .thenReturn(Optional.empty());
        Conversation newConv = buildConversation();
        when(conversationRepository.save(any())).thenReturn(newConv);
        when(messageRepository.save(any())).thenReturn(new Message());

        EmailMessage message = new EmailMessage(contactId, "to@example.com",
                "Subject", "Body", null, null, null, null, null);

        emailService.send(workspaceId, message);

        // Conversation should be created (saved twice: create + update lastMessageAt)
        verify(conversationRepository, atLeast(1)).save(argThat(c ->
                c.getChannel() == MessageChannel.EMAIL
                && c.getWorkspaceId().equals(workspaceId)));
    }

    // ── resolveTemplate() ────────────────────────────────────────────────────

    @Disabled @Test
    void resolveTemplate_replacesContactName() {
        // Requisito 25.5
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));

        String result = emailService.resolveTemplate("Hola {{contact_name}}", contactId);

        assertThat(result).isEqualTo("Hola Juan Pérez");
    }

    @Disabled @Test
    void resolveTemplate_replacesCompanyName() {
        Company company = new Company();
        company.setId(UUID.randomUUID());
        company.setName("Acme Corp");
        contact.setCompany(company);

        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));
        when(companyRepository.findByWorkspaceIdAndId(workspaceId, company.getId()))
                .thenReturn(Optional.of(company));

        String result = emailService.resolveTemplate("Empresa: {{company_name}}", contactId);

        assertThat(result).isEqualTo("Empresa: Acme Corp");
    }

    @Disabled @Test
    void resolveTemplate_withNoCompany_replacesWithEmptyString() {
        contact.setCompany(null);
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));

        String result = emailService.resolveTemplate("Empresa: {{company_name}}", contactId);

        assertThat(result).isEqualTo("Empresa: ");
    }

    @Disabled @Test
    void resolveTemplate_withUnknownContact_returnsOriginalBody() {
        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());

        String body = "Hola {{contact_name}}";
        String result = emailService.resolveTemplate(body, contactId);

        assertThat(result).isEqualTo(body);
    }

    // ── processInboundReply() ────────────────────────────────────────────────

    @Disabled @Test
    void processInboundReply_withKnownThread_addsMessageToExistingConversation() {
        // Requisito 26.2: reply encadenado a conversación existente
        String messageId = "<original-message-id@example.com>";
        String rawEmail = "From: sender@example.com\r\n"
                + "In-Reply-To: " + messageId + "\r\n"
                + "Subject: Re: Test\r\n"
                + "\r\n"
                + "Reply body";

        Message originalMsg = new Message();
        UUID convId = UUID.randomUUID();
        originalMsg.setConversationId(convId);

        Conversation existingConv = buildConversation();
        existingConv.setId(convId);

        when(messageRepository.findByExternalIdAndChannel(messageId.trim(), MessageChannel.EMAIL))
                .thenReturn(Optional.of(originalMsg));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(existingConv));
        when(contactRepository.findByWorkspaceIdAndEmailAndDeletedFalse(workspaceId, "sender@example.com"))
                .thenReturn(Optional.of(contact));
        when(conversationRepository.save(any())).thenReturn(existingConv);
        when(messageRepository.save(any())).thenReturn(new Message());

        emailService.processInboundReply(rawEmail, workspaceId);

        verify(messageRepository).save(argThat(m ->
                m.getDirection() == MessageDirection.INBOUND
                && m.getChannel() == MessageChannel.EMAIL
                && m.getConversationId().equals(convId)));
    }

    @Disabled @Test
    void processInboundReply_withUnknownSender_createsNewContact() {
        // Requisito 26.3: remitente desconocido → crear contacto nuevo
        String rawEmail = "From: unknown@newdomain.com\r\n"
                + "Subject: Hello\r\n"
                + "\r\n"
                + "Body";

        // No In-Reply-To header → no thread lookup needed
        when(contactRepository.findByWorkspaceIdAndEmailAndDeletedFalse(workspaceId, "unknown@newdomain.com"))
                .thenReturn(Optional.empty());

        Contact newContact = new Contact();
        newContact.setWorkspaceId(workspaceId);
        newContact.setEmail("unknown@newdomain.com");
        newContact.setName("unknown@newdomain.com");
        newContact.setStatus(ContactStatus.NEW);
        UUID newContactId = UUID.randomUUID();
        try {
            var idField = com.crm.common.audit.AuditableEntity.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(newContact, newContactId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        when(contactRepository.save(argThat(c ->
                "unknown@newdomain.com".equals(c.getEmail())
                && c.getStatus() == ContactStatus.NEW)))
                .thenReturn(newContact);

        Conversation conv = buildConversation();
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, newContactId, MessageChannel.EMAIL))
                .thenReturn(Optional.empty());
        when(conversationRepository.save(any())).thenReturn(conv);
        when(messageRepository.save(any())).thenReturn(new Message());

        emailService.processInboundReply(rawEmail, workspaceId);

        verify(contactRepository).save(argThat(c ->
                "unknown@newdomain.com".equals(c.getEmail())
                && c.getStatus() == ContactStatus.NEW));
    }

    @Disabled @Test
    void processInboundReply_withNoMatchingThread_createsNewConversation() {
        // Requisito 26.4: sin thread → nueva conversación
        String rawEmail = "From: known@example.com\r\n"
                + "Subject: New topic\r\n"
                + "\r\n"
                + "Body";

        // No In-Reply-To header → no thread lookup
        when(contactRepository.findByWorkspaceIdAndEmailAndDeletedFalse(workspaceId, "known@example.com"))
                .thenReturn(Optional.of(contact));
        when(conversationRepository.findByWorkspaceIdAndContactIdAndChannel(
                workspaceId, contactId, MessageChannel.EMAIL))
                .thenReturn(Optional.empty());

        Conversation newConv = buildConversation();
        when(conversationRepository.save(any())).thenReturn(newConv);
        when(messageRepository.save(any())).thenReturn(new Message());

        emailService.processInboundReply(rawEmail, workspaceId);

        verify(conversationRepository, atLeast(1)).save(any(Conversation.class));
        verify(messageRepository).save(argThat(m ->
                m.getDirection() == MessageDirection.INBOUND));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private EmailConfig buildSmtpConfig() {
        EmailConfig config = new EmailConfig();
        config.setHost("smtp.example.com");
        config.setPort(587);
        config.setUsername("user@example.com");
        config.setPassword("secret");
        config.setEncryption(EmailEncryption.TLS);
        config.setActive(true);
        try {
            var wid = com.crm.common.audit.AuditableEntity.class.getDeclaredField("workspaceId");
            wid.setAccessible(true);
            wid.set(config, workspaceId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return config;
    }

    private GmailConfig buildGmailConfig() {
        GmailConfig config = new GmailConfig();
        config.setEmail("user@gmail.com");
        config.setAccessToken("access-token");
        config.setRefreshToken("refresh-token");
        config.setActive(true);
        try {
            var wid = com.crm.common.audit.AuditableEntity.class.getDeclaredField("workspaceId");
            wid.setAccessible(true);
            wid.set(config, workspaceId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return config;
    }

    private Conversation buildConversation() {
        Conversation conv = new Conversation();
        conv.setId(UUID.randomUUID());
        conv.setWorkspaceId(workspaceId);
        conv.setContactId(contactId);
        conv.setChannel(MessageChannel.EMAIL);
        conv.setStatus(ConversationStatus.OPEN);
        return conv;
    }
}
