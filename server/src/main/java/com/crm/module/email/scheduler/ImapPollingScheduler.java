package com.crm.module.email.scheduler;

import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.service.EmailService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.FlagTerm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Slf4j
@Component
@RequiredArgsConstructor
public class ImapPollingScheduler {

    private final EmailConfigRepository emailConfigRepository;
    private final EmailService emailService;

    private static final int MAX_MESSAGES_PER_CYCLE = 20;
    // ✅ FIX: Solo revisar los últimos N mensajes para evitar escanear 3000+ emails
    private static final int RECENT_MESSAGES_WINDOW = 50;

    @Scheduled(fixedRate = 120_000)
    public void pollInbox() {
        log.info("IMAP polling cycle started...");
        try {
            List<EmailConfig> activeConfigs = emailConfigRepository.findAllByIsActiveTrue();
            log.info("IMAP: found {} active SMTP configs", activeConfigs.size());
            for (EmailConfig config : activeConfigs) {
                try {
                    pollWorkspaceInbox(config);
                } catch (Exception e) {
                    log.error("IMAP polling failed for workspace {}: {}", config.getWorkspaceId(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("IMAP pollInbox fatal error: {}", e.getMessage(), e);
        }
    }

    private void pollWorkspaceInbox(EmailConfig config) throws MessagingException, IOException {
        log.info("IMAP: connecting to {} for workspace {}", imapHost(config.getHost()), config.getWorkspaceId());
        Properties props = buildImapProperties(config);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(config.getUsername(), config.getPassword());
            }
        });

        try (Store store = session.getStore("imaps")) {
            store.connect(imapHost(config.getHost()), config.getUsername(), config.getPassword());
            log.info("IMAP: connected successfully to {}", imapHost(config.getHost()));

            try (Folder inbox = store.getFolder("INBOX")) {
                inbox.open(Folder.READ_WRITE);
                int total = inbox.getMessageCount();
                log.info("IMAP: INBOX opened, total messages: {}", total);

                // ✅ FIX: Solo revisar los últimos RECENT_MESSAGES_WINDOW mensajes
                //         Los replies recientes siempre llegan al final del buzón
                int start = Math.max(1, total - RECENT_MESSAGES_WINDOW + 1);
                Message[] recentMessages = inbox.getMessages(start, total);

                // ✅ FIX: Descargar todos los headers en un solo batch (mucho más rápido)
                FetchProfile fp = new FetchProfile();
                fp.add(FetchProfile.Item.FLAGS);
                fp.add("In-Reply-To");
                fp.add("References");
                fp.add("Message-ID");
                fp.add("From");
                fp.add("Subject");
                inbox.fetch(recentMessages, fp);

                log.info("IMAP: headers fetched for {} recent messages", recentMessages.length);

                // Filtrar solo no leídos que sean replies
                List<Message> replies = filterUnreadReplies(recentMessages);
                log.info("IMAP: {} unread replies found", replies.size());

                int limit = Math.min(replies.size(), MAX_MESSAGES_PER_CYCLE);
                for (int i = 0; i < limit; i++) {
                    Message message = replies.get(i);
                    try {
                        String rawEmail = buildRawEmail(message);
                        emailService.processInboundReply(rawEmail, config.getWorkspaceId());
                        message.setFlag(Flags.Flag.SEEN, true);
                        log.info("IMAP: reply processed and marked as read");
                    } catch (Exception e) {
                        log.warn("Failed to process reply: {}", e.getMessage());
                    }
                }

                if (replies.isEmpty()) {
                    log.info("IMAP: no new replies in last {} messages", RECENT_MESSAGES_WINDOW);
                }
            }
        }
    }

    /**
     * ✅ FIX: Filtra mensajes no leídos que tengan header In-Reply-To
     * usando los headers ya descargados en batch por FetchProfile.
     */
    private List<Message> filterUnreadReplies(Message[] messages) throws MessagingException {
        List<Message> replies = new ArrayList<>();
        for (Message message : messages) {
            // Verificar que no esté leído
            if (message.isSet(Flags.Flag.SEEN)) continue;

            // Verificar que tenga In-Reply-To
            String[] inReplyTo = message.getHeader("In-Reply-To");
            if (inReplyTo != null && inReplyTo.length > 0 && inReplyTo[0] != null) {
                replies.add(message);
            }
        }
        return replies;
    }

    private String buildRawEmail(Message message) throws MessagingException, IOException {
        StringBuilder raw = new StringBuilder();
        appendHeader(raw, "From", message.getFrom() != null ? message.getFrom()[0].toString() : "");
        appendHeader(raw, "Subject", message.getSubject());
        appendHeader(raw, "In-Reply-To", getHeader(message, "In-Reply-To"));
        appendHeader(raw, "References", getHeader(message, "References"));
        appendHeader(raw, "Message-ID", getHeader(message, "Message-ID"));
        raw.append("\r\n");
        raw.append(extractTextBody(message));
        return raw.toString();
    }

    private void appendHeader(StringBuilder sb, String name, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(name).append(": ").append(value).append("\r\n");
        }
    }

    private String getHeader(Message message, String name) throws MessagingException {
        String[] values = message.getHeader(name);
        return (values != null && values.length > 0) ? values[0] : null;
    }

    private String extractTextBody(Part part) throws MessagingException, IOException {
        if (part.isMimeType("text/plain")) return (String) part.getContent();
        if (part.isMimeType("text/html")) return (String) part.getContent();
        if (part.isMimeType("multipart/*")) {
            MimeMultipart multipart = (MimeMultipart) part.getContent();
            for (int i = 0; i < multipart.getCount(); i++) {
                BodyPart bodyPart = multipart.getBodyPart(i);
                if (bodyPart.isMimeType("text/plain")) return (String) bodyPart.getContent();
            }
            if (multipart.getCount() > 0) return extractTextBody(multipart.getBodyPart(0));
        }
        return "";
    }

    private Properties buildImapProperties(EmailConfig config) {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", imapHost(config.getHost()));
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.timeout", "10000");
        props.put("mail.imaps.connectiontimeout", "10000");
        return props;
    }

    private String imapHost(String smtpHost) {
        if (smtpHost == null) return "";
        return smtpHost.replace("smtp.", "imap.");
    }
}