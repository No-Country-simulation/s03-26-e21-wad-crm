package com.crm.module.whatsapp.provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Implementación de WhatsAppProvider usando Meta Cloud API v20.0.
 * Reemplaza la integración anterior con Twilio.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MetaCloudWhatsAppProvider implements WhatsAppProvider {

    private static final String META_API_BASE = "https://graph.facebook.com/v20.0";

    // TODO: inyectar desde WhatsAppConfig del workspace (por ahora placeholder)
    private String phoneNumberId;
    private String accessToken;
    private String appSecret;

    @Override
    public String sendTextMessage(String phoneNumber, String body) {
        // Implementación completa en tarea 9.2
        log.info("Sending WhatsApp message to {} via Meta Cloud API", phoneNumber);
        throw new UnsupportedOperationException("Implementar en tarea 9.2");
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(), "HmacSHA256"));
            String expected = "sha256=" + HexFormat.of()
                    .formatHex(mac.doFinal(payload.getBytes()));
            return MessageDigest.isEqual(expected.getBytes(), signature.getBytes());
        } catch (Exception e) {
            log.error("Error verifying Meta webhook signature", e);
            return false;
        }
    }

    @Override
    public boolean verifyConnection() {
        // Implementación completa en tarea 9.2
        throw new UnsupportedOperationException("Implementar en tarea 9.2");
    }

    @Override
    public String getProviderName() {
        return "META_CLOUD";
    }

    private String normalizePhone(String phone) {
        return phone.replace("whatsapp:", "").replace("+", "");
    }
}
