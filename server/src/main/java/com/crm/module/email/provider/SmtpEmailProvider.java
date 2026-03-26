package com.crm.module.email.provider;

import com.crm.module.email.dto.EmailMessage;
import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.EmailEncryption;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.Properties;

/**
 * Proveedor de email vía SMTP usando JavaMailSender configurado dinámicamente
 * desde la EmailConfig del workspace.
 * Requisitos: 23.2, 23.3, 25.1
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SmtpEmailProvider implements EmailProvider {

    private EmailConfig emailConfig;

    /**
     * Configura el proveedor con la configuración SMTP del workspace.
     */
    public SmtpEmailProvider withConfig(EmailConfig config) {
        this.emailConfig = config;
        return this;
    }

    @Override
    public void send(EmailMessage message) {
        JavaMailSenderImpl mailSender = buildMailSender();
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(emailConfig.getUsername());
            helper.setTo(message.to());
            helper.setSubject(message.subject());
            helper.setText(message.body(), true);

            if (!CollectionUtils.isEmpty(message.cc())) {
                helper.setCc(message.cc().toArray(new String[0]));
            }
            if (!CollectionUtils.isEmpty(message.bcc())) {
                helper.setBcc(message.bcc().toArray(new String[0]));
            }

            // Set Message-ID headers for email threading (Requisito 25.1)
            if (message.inReplyTo() != null) {
                mimeMessage.setHeader("In-Reply-To", message.inReplyTo());
            }
            if (message.references() != null) {
                mimeMessage.setHeader("References", message.references());
            }

            mailSender.send(mimeMessage);
            log.info("Email sent via SMTP to {}", message.to());
        } catch (Exception e) {
            log.error("Failed to send email via SMTP to {}: {}", message.to(), e.getMessage());
            throw new RuntimeException("Error al enviar email vía SMTP: " + e.getMessage(), e);
        }
    }

    @Override
    public void testConnection() {
        JavaMailSenderImpl mailSender = buildMailSender();
        try {
            mailSender.testConnection();
            log.info("SMTP connection test successful for host {}:{}", emailConfig.getHost(), emailConfig.getPort());
        } catch (Exception e) {
            String msg = String.format("No se pudo conectar al servidor SMTP %s:%d — %s",
                    emailConfig.getHost(), emailConfig.getPort(), e.getMessage());
            log.error(msg);
            throw new RuntimeException(msg, e);
        }
    }

    @Override
    public String getProviderName() {
        return "SMTP";
    }

    private JavaMailSenderImpl buildMailSender() {
        if (emailConfig == null) {
            throw new IllegalStateException("EmailConfig no configurada para SmtpEmailProvider");
        }

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(emailConfig.getHost());
        mailSender.setPort(emailConfig.getPort());
        mailSender.setUsername(emailConfig.getUsername());
        // TODO: descifrar password con EncryptionService (AES-256) cuando esté disponible
        mailSender.setPassword(emailConfig.getPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.debug", "false");

        EmailEncryption encryption = emailConfig.getEncryption();
        if (encryption == EmailEncryption.TLS) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        } else if (encryption == EmailEncryption.SSL) {
            mailSender.setProtocol("smtps");
            props.put("mail.smtps.ssl.enable", "true");
        }
        // NONE: no additional SSL/TLS properties

        return mailSender;
    }
}
