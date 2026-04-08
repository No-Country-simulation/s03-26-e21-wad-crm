package com.crm.module.whatsapp.provider;

import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación de WhatsAppProvider usando Meta Cloud API v22.0.
 * Requisitos: 19.2, 19.3, 20.1, 20.5, 21.1
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MetaCloudApiProvider implements WhatsAppProvider {

    private static final String META_API_BASE = "https://graph.facebook.com/v22.0";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Req 21.1: envía mensaje de texto vía Meta Cloud API.
     * Retorna el externalId (messages[0].id) asignado por Meta.
     */
    @Override
    public String sendMessage(String phoneNumber, String body) {
        // phoneNumberId y accessToken se resuelven en WhatsAppService por workspace
        throw new UnsupportedOperationException(
                "Use WhatsAppService.sendMessage(contactId, body, workspaceId) — " +
                "este método requiere contexto de workspace para resolver credenciales.");
    }

    /**
     * Envía un mensaje de texto usando las credenciales explícitas del workspace.
     * Req 21.1–21.3
     *
     * @param phoneNumber  número destino normalizado (sin +)
     * @param body         texto del mensaje
     * @param phoneNumberId ID del número de Meta
     * @param accessToken  token de acceso (ya descifrado)
     * @return externalId retornado por Meta
     */
    public String sendMessage(String phoneNumber, String body,
                              String phoneNumberId, String accessToken) {
        String url = META_API_BASE + "/" + phoneNumberId + "/messages";

        Map<String, Object> payload = Map.of(
                "messaging_product", "whatsapp",
                "recipient_type", "individual",
                "to", normalizePhone(phoneNumber),
                "type", "text",
                "text", Map.of("preview_url", false, "body", body)
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String externalId = root.path("messages").path(0).path("id").asText(null);
            if (externalId == null) {
                throw new RuntimeException("Meta API no retornó message id. Response: " + response.getBody());
            }
            log.info("WhatsApp message sent to {}, externalId={}", phoneNumber, externalId);
            return externalId;
        } catch (HttpClientErrorException e) {
            // Mejor manejo de errores HTTP específicos
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.error("Token de WhatsApp expirado o inválido: {}", e.getMessage());
                throw new RuntimeException("Token de acceso expirado. Por favor actualizá las credenciales en Settings > WhatsApp.", e);
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                log.error("Sin permisos para enviar mensaje: {}", e.getMessage());
                throw new RuntimeException("Sin permisos. Verificá que el token tenga permisos de envío.", e);
            }
            log.error("Error HTTP al enviar WhatsApp message to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Error al enviar mensaje WhatsApp: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error sending WhatsApp message to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Error al enviar mensaje WhatsApp: " + e.getMessage(), e);
        }
    }

    /**
     * Envía un mensaje template usando las credenciales explícitas del workspace.
     * Para mensajes fuera de la ventana de 24h.
     *
     * @param phoneNumber   número destino normalizado (sin +)
     * @param templateName  nombre del template aprobado en Meta
     * @param language      código de idioma (ej: "en", "es", "en_US")
     * @param parameters    lista de parámetros para el body del template
     * @param phoneNumberId ID del número de Meta
     * @param accessToken   token de acceso (ya descifrado)
     * @return externalId retornado por Meta
     */
    public String sendTemplateMessage(String phoneNumber, String templateName, String language,
                                      List<SendWhatsAppRequest.TemplateParameter> parameters,
                                      String phoneNumberId, String accessToken) {
        String url = META_API_BASE + "/" + phoneNumberId + "/messages";

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("messaging_product", "whatsapp");
        payload.put("recipient_type", "individual");
        payload.put("to", normalizePhone(phoneNumber));
        payload.put("type", "template");

        Map<String, Object> template = new LinkedHashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", language));

        if (parameters != null && !parameters.isEmpty()) {
            List<Map<String, Object>> components = List.of(Map.of(
                    "type", "body",
                    "parameters", parameters.stream()
                            .map(p -> Map.of("type", p.type(), p.type(), p.value()))
                            .collect(Collectors.toList())
            ));
            template.put("components", components);
        }

        payload.put("template", template);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            String externalId = root.path("messages").path(0).path("id").asText(null);
            if (externalId == null) {
                throw new RuntimeException("Meta API no retornó message id. Response: " + response.getBody());
            }
            log.info("WhatsApp template '{}' sent to {}, externalId={}", templateName, phoneNumber, externalId);
            return externalId;
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                log.error("Token de WhatsApp expirado o inválido: {}", e.getMessage());
                throw new RuntimeException("Token de acceso expirado. Por favor actualizá las credenciales en Settings > WhatsApp.", e);
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                log.error("Sin permisos para enviar mensaje: {}", e.getMessage());
                throw new RuntimeException("Sin permisos. Verificá que el token tenga permisos de envío.", e);
            }
            log.error("Error HTTP al enviar WhatsApp template a {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Error al enviar template WhatsApp: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error sending WhatsApp template to {}: {}", phoneNumber, e.getMessage());
            throw new RuntimeException("Error al enviar template WhatsApp: " + e.getMessage(), e);
        }
    }

    /**
     * Req 20.1, 20.5: verifica firma HMAC-SHA256 del webhook.
     * Requiere el appSecret del workspace — usar verifyWebhookSignature(payload, signature, appSecret).
     */
    @Override
    public boolean verifyWebhookSignature(String payload, String signature) {
        throw new UnsupportedOperationException(
                "Use verifyWebhookSignature(payload, signature, appSecret) con el secret del workspace.");
    }

    /**
     * Verifica la firma HMAC-SHA256 con el appSecret explícito.
     * Req 20.5: X-Hub-Signature-256 = "sha256=<hex(HMAC-SHA256(appSecret, payload))>"
     */
    public boolean verifyWebhookSignature(String payload, String signature, String appSecret) {
        if (signature == null || signature.isBlank() || appSecret == null) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(), "HmacSHA256"));
            String expected = "sha256=" + HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            return MessageDigest.isEqual(expected.getBytes(), signature.getBytes());
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Req 19.3: verifica la conexión con Meta Cloud API antes de guardar la config.
     * Llama a GET /v22.0/{phoneNumberId} con el accessToken para validar credenciales.
     */
    @Override
    public void verifyConnection(WhatsAppConfig config) {
        String url = META_API_BASE + "/" + config.getPhoneNumberId();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(config.getAccessToken());

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Meta API retornó: " + response.getStatusCode());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText("Error desconocido");
                throw new RuntimeException("Meta API error: " + errorMsg);
            }

            log.info("WhatsApp connection verified for phoneNumberId={}", config.getPhoneNumberId());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("WhatsApp connection verification failed: {}", e.getMessage());
            throw new RuntimeException("No se pudo verificar la conexión con Meta: " + e.getMessage(), e);
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Normaliza el número removiendo prefijo "whatsapp:" o "+" */
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        return phone.replace("whatsapp:", "").replace("+", "").trim();
    }
}
