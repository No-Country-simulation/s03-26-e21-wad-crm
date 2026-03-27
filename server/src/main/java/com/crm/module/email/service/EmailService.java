package com.crm.module.email.service;

import com.crm.module.company.repository.CompanyRepository;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.entity.ContactStatus;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.entity.*;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.email.dto.EmailMessage;
import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.provider.EmailProvider;
import com.crm.module.email.provider.GmailOAuthProvider;
import com.crm.module.email.provider.SmtpEmailProvider;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.repository.GmailConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servicio principal de email: envío, resolución de templates y procesamiento de replies.
 * Requisitos: 25.1–25.5, 26.1–26.4
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailConfigRepository emailConfigRepository;
    private final GmailConfigRepository gmailConfigRepository;
    private final SmtpEmailProvider smtpEmailProvider;
    private final GmailOAuthProvider gmailOAuthProvider;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ContactRepository contactRepository;
    private final CompanyRepository companyRepository;

    /**
     * Envía un email usando el proveedor activo del workspace (Gmail tiene prioridad sobre SMTP).
     * Registra el mensaje en la conversación del contacto.
     * Requisitos: 25.1–25.4
     */
    @Transactional
    public void send(UUID workspaceId, EmailMessage message) {
        // 1. Resolve active provider — Gmail first, then SMTP
        EmailProvider provider = resolveActiveProvider(workspaceId);

        // 2. Resolve template variables if body contains placeholders
        String resolvedBody = message.templateId() != null
                ? resolveTemplate(message.body(), message.contactId())
                : message.body();

        EmailMessage finalMessage = new EmailMessage(
                message.contactId(),
                message.to(),
                message.subject(),
                resolvedBody,
                message.cc(),
                message.bcc(),
                message.templateId(),
                message.inReplyTo(),
                message.references()
        );

        // 3. Send via active provider
        provider.send(finalMessage);
        log.info("Email sent to {} via {} for workspace {}", message.to(), provider.getProviderName(), workspaceId);

        // 4. Find or create conversation for the contact with channel EMAIL
        Conversation conversation = findOrCreateConversation(workspaceId, message.contactId());

        // 5. Save outbound message and update conversation.lastMessageAt
        Message msg = new Message();
        msg.setConversationId(conversation.getId());
        msg.setWorkspaceId(workspaceId);
        msg.setChannel(MessageChannel.EMAIL);
        msg.setDirection(MessageDirection.OUTBOUND);
        msg.setBody(resolvedBody);
        msg.setStatus(MessageStatus.SENT);
        msg.setSentAt(LocalDateTime.now());
        messageRepository.save(msg);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    /**
     * Reemplaza variables de plantilla con datos del contacto.
     * Soporta: {{contact_name}}, {{company_name}}
     * Requisito: 25.5
     */
    public String resolveTemplate(String body, UUID contactId) {
        if (body == null) return "";

        // We need workspaceId to look up the contact safely; use a broad lookup here
        // since contactId is already scoped by the caller
        Optional<Contact> contactOpt = contactRepository.findById(contactId);
        if (contactOpt.isEmpty()) {
            log.warn("Contact {} not found for template resolution", contactId);
            return body;
        }

        Contact contact = contactOpt.get();
        String result = body.replace("{{contact_name}}", contact.getName() != null ? contact.getName() : "");

        String companyName = "";
        if (contact.getCompanyId() != null) {
            companyName = companyRepository.findByWorkspaceIdAndId(contact.getWorkspaceId(), contact.getCompanyId())
                    .map(c -> c.getName() != null ? c.getName() : "")
                    .orElse("");
        }
        result = result.replace("{{company_name}}", companyName);

        return result;
    }

    /**
     * Procesa un reply de email entrante: identifica el thread, agrega el mensaje
     * a la conversación existente o crea una nueva.
     * Requisitos: 26.1–26.4
     */
    @Transactional
    public void processInboundReply(String rawEmail, UUID workspaceId) {
        String inReplyTo = extractHeader(rawEmail, "In-Reply-To");
        String references = extractHeader(rawEmail, "References");
        String fromEmail = extractHeader(rawEmail, "From");
        String subject = extractHeader(rawEmail, "Subject");
        String body = extractBody(rawEmail);

        // Normalize from email (strip display name if present)
        fromEmail = normalizeEmail(fromEmail);

        log.info("Processing inbound email reply from {} for workspace {}", fromEmail, workspaceId);

        // 1. Find existing conversation by matching externalId in messages
        Conversation conversation = null;
        String threadId = inReplyTo != null ? inReplyTo : references;

        if (threadId != null) {
            Optional<Message> originalMessage = messageRepository.findByExternalIdAndChannel(
                    threadId.trim(), MessageChannel.EMAIL);
            if (originalMessage.isPresent()) {
                conversation = conversationRepository.findById(originalMessage.get().getConversationId())
                        .orElse(null);
            }
        }

        // 2. Find or create contact by sender email
        final String senderEmail = fromEmail;
        Contact contact = contactRepository.findByWorkspaceIdAndEmailAndDeletedFalse(workspaceId, senderEmail)
                .orElseGet(() -> {
                    // Requisito 26.3: create new contact if sender not found
                    log.info("Creating new contact for unknown sender {}", senderEmail);
                    Contact newContact = new Contact();
                    newContact.setWorkspaceId(workspaceId);
                    newContact.setName(senderEmail);
                    newContact.setEmail(senderEmail);
                    newContact.setStatus(ContactStatus.NEW);
                    return contactRepository.save(newContact);
                });

        // 3. If no matching conversation found, create a new one
        if (conversation == null) {
            conversation = findOrCreateConversation(workspaceId, contact.getId());
        }

        // 4. Add INBOUND message to the conversation
        Message inboundMsg = new Message();
        inboundMsg.setConversationId(conversation.getId());
        inboundMsg.setWorkspaceId(workspaceId);
        inboundMsg.setChannel(MessageChannel.EMAIL);
        inboundMsg.setDirection(MessageDirection.INBOUND);
        inboundMsg.setBody(body != null ? body : rawEmail);
        inboundMsg.setExternalId(inReplyTo);
        inboundMsg.setStatus(MessageStatus.DELIVERED);
        inboundMsg.setSentAt(LocalDateTime.now());
        messageRepository.save(inboundMsg);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Inbound email reply processed for conversation {}", conversation.getId());
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Resolves the active email provider for the workspace.
     * Gmail takes priority over SMTP. Throws if neither is configured.
     * Requisito: 25.3
     */
    private EmailProvider resolveActiveProvider(UUID workspaceId) {
        // Gmail first
        Optional<GmailConfig> gmailConfig = gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId);
        if (gmailConfig.isPresent()) {
            return gmailOAuthProvider.withConfig(gmailConfig.get());
        }

        // Then SMTP
        Optional<EmailConfig> smtpConfig = emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId);
        if (smtpConfig.isPresent()) {
            return smtpEmailProvider.withConfig(smtpConfig.get());
        }

        throw new IllegalStateException(
                "No hay configuración de email activa en el workspace. " +
                "Configure una integración SMTP o Gmail antes de enviar emails.");
    }

    private Conversation findOrCreateConversation(UUID workspaceId, UUID contactId) {
        return conversationRepository
                .findByWorkspaceIdAndContactIdAndChannel(workspaceId, contactId, MessageChannel.EMAIL)
                .orElseGet(() -> {
                    Conversation conv = new Conversation();
                    conv.setWorkspaceId(workspaceId);
                    conv.setContactId(contactId);
                    conv.setChannel(MessageChannel.EMAIL);
                    conv.setStatus(ConversationStatus.OPEN);
                    return conversationRepository.save(conv);
                });
    }

    /** Extracts a header value from a raw RFC 2822 email string. */
    private String extractHeader(String rawEmail, String headerName) {
        if (rawEmail == null) return null;
        Pattern pattern = Pattern.compile("^" + headerName + ":\\s*(.+)$",
                Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(rawEmail);
        return matcher.find() ? matcher.group(1).trim() : null;
    }

    /** Extracts the body from a raw RFC 2822 email (content after the blank line). */
    private String extractBody(String rawEmail) {
        if (rawEmail == null) return null;
        int blankLine = rawEmail.indexOf("\r\n\r\n");
        if (blankLine == -1) blankLine = rawEmail.indexOf("\n\n");
        return blankLine != -1 ? rawEmail.substring(blankLine).trim() : rawEmail;
    }

    /** Strips display name from "Display Name <email@example.com>" format. */
    private String normalizeEmail(String from) {
        if (from == null) return "";
        Matcher m = Pattern.compile("<([^>]+)>").matcher(from);
        return m.find() ? m.group(1).trim() : from.trim();
    }
}
