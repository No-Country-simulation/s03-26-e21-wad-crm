package com.crm.module.whatsapp;

import com.crm.AbstractIntegrationTest;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.repository.MessageRepository;
import com.crm.module.contact.repository.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HexFormat;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

/**
 * Tests de integración HTTP para el flujo del webhook de WhatsApp.
 *
 * Cubre: firma válida/inválida, creación de contacto+mensaje, idempotencia, verificación GET.
 * Requisitos: 20.1–20.6
 */
class WhatsAppWebhookIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    SimpMessagingTemplate messagingTemplate;

    @MockBean
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    TestRestTemplate restTemplate;

    @Autowired
    MessageRepository messageRepository;

    @Autowired
    ContactRepository contactRepository;

    private static final String APP_SECRET      = "test-app-secret-12345";
    private static final String PHONE_NUMBER_ID = "PHONE_NUMBER_ID_TEST";
    private static final String VERIFY_TOKEN    = "my-verify-token";
    private static final String KNOWN_PHONE     = "521234567890";

    private UUID workspaceId;
    private UUID knownContactId;

    @BeforeEach
    void setUp() {
        // Clean in FK order
        jdbc.execute("DELETE FROM messages");
        jdbc.execute("DELETE FROM conversations");
        jdbc.execute("DELETE FROM contacts");
        jdbc.execute("DELETE FROM whatsapp_configs");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM workspaces");

        workspaceId = UUID.randomUUID();

        jdbc.update("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)",
                workspaceId, "WA Workspace", "wa-ws-" + workspaceId);

        // WhatsApp config with known app_secret and phone_number_id
        jdbc.update(
                "INSERT INTO whatsapp_configs "
                + "(id, workspace_id, phone_number_id, access_token, webhook_verify_token, app_secret, is_active) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceId, PHONE_NUMBER_ID,
                "access-token-test", VERIFY_TOKEN, APP_SECRET, true
        );

        // Known contact with KNOWN_PHONE already in DB
        knownContactId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO contacts (id, workspace_id, name, phone, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                knownContactId, workspaceId, "Known User", KNOWN_PHONE, "CONTACTED", false
        );
    }

    // ── Req 20.1 + 20.2: webhook válido con contacto existente ───────────────

    @Test
    @DisplayName("Req 20.1/20.2: POST con firma válida y contacto existente → 200, mensaje INBOUND creado")
    void post_validSignature_knownContact_returns200AndCreatesMessage() throws Exception {
        String externalId = "wamid.KNOWN_CONTACT_" + UUID.randomUUID();
        String payload = buildPayload(PHONE_NUMBER_ID, KNOWN_PHONE, externalId, "Hello from WhatsApp");

        ResponseEntity<Void> response = restTemplate.exchange(
                "/webhooks/whatsapp",
                HttpMethod.POST,
                new HttpEntity<>(payload, headersWithSignature(payload, APP_SECRET)),
                Void.class
        );

        // Req 20.1: HTTP 200
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Req 20.4: mensaje creado con dirección INBOUND y canal WHATSAPP
        var msg = messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP);
        assertThat(msg).isPresent();
        assertThat(msg.get().getDirection().name()).isEqualTo("INBOUND");
        assertThat(msg.get().getChannel()).isEqualTo(MessageChannel.WHATSAPP);
        assertThat(msg.get().getBody()).isEqualTo("Hello from WhatsApp");
        assertThat(msg.get().getWorkspaceId()).isEqualTo(workspaceId);
    }

    // ── Req 20.3: webhook válido con número desconocido crea contacto NEW ─────

    @Test
    @DisplayName("Req 20.3: POST con número desconocido → 200, nuevo contacto con status NEW creado")
    void post_validSignature_unknownPhone_createsNewContactWithStatusNew() throws Exception {
        String newPhone   = "5299887766" + UUID.randomUUID().toString().substring(0, 4);
        String externalId = "wamid.NEW_CONTACT_" + UUID.randomUUID();
        String payload    = buildPayload(PHONE_NUMBER_ID, newPhone, externalId, "First message");

        ResponseEntity<Void> response = restTemplate.exchange(
                "/webhooks/whatsapp",
                HttpMethod.POST,
                new HttpEntity<>(payload, headersWithSignature(payload, APP_SECRET)),
                Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Req 20.3: nuevo contacto creado con status NEW
        Integer contactCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM contacts WHERE workspace_id = ? AND phone = ? AND status = 'NEW'",
                Integer.class, workspaceId, newPhone
        );
        assertThat(contactCount).isEqualTo(1);

        // Req 20.4: mensaje también creado
        assertThat(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .isPresent();
    }

    // ── Req 20.5: firma inválida → 403, nada persistido ──────────────────────

    @Test
    @DisplayName("Req 20.5: POST con firma inválida → 403, ningún mensaje persistido")
    void post_invalidSignature_returns403_nothingPersisted() throws Exception {
        String externalId = "wamid.INVALID_SIG_" + UUID.randomUUID();
        String payload    = buildPayload(PHONE_NUMBER_ID, KNOWN_PHONE, externalId, "Should not persist");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Hub-Signature-256", "sha256=invalidsignaturevalue");

        ResponseEntity<Void> response = restTemplate.exchange(
                "/webhooks/whatsapp",
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                Void.class
        );

        // Req 20.5: HTTP 403
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Nothing persisted
        assertThat(messageRepository.findByExternalIdAndChannel(externalId, MessageChannel.WHATSAPP))
                .isEmpty();
    }

    // ── Req 20.5: sin header de firma → 403 ──────────────────────────────────

    @Test
    @DisplayName("Req 20.5: POST sin header X-Hub-Signature-256 → 403")
    void post_missingSignature_returns403() throws Exception {
        String payload = buildPayload(PHONE_NUMBER_ID, KNOWN_PHONE, "wamid.NO_SIG", "No sig");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Void> response = restTemplate.exchange(
                "/webhooks/whatsapp",
                HttpMethod.POST,
                new HttpEntity<>(payload, headers),
                Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    // ── Req 20.4: idempotencia — mismo externalId no crea duplicado ───────────

    @Test
    @DisplayName("Req 20.4: POST mismo payload dos veces → solo un mensaje en BD (idempotencia)")
    void post_sameExternalIdTwice_onlyOneMessageCreated() throws Exception {
        String externalId = "wamid.IDEMPOTENT_" + UUID.randomUUID();
        String payload    = buildPayload(PHONE_NUMBER_ID, KNOWN_PHONE, externalId, "Idempotent message");

        HttpEntity<String> request = new HttpEntity<>(payload, headersWithSignature(payload, APP_SECRET));

        // First call
        ResponseEntity<Void> first = restTemplate.exchange(
                "/webhooks/whatsapp", HttpMethod.POST, request, Void.class);
        assertThat(first.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Second call with identical payload
        ResponseEntity<Void> second = restTemplate.exchange(
                "/webhooks/whatsapp", HttpMethod.POST, request, Void.class);
        assertThat(second.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Req 20.4: exactly one message in DB
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM messages WHERE external_id = ?",
                Integer.class, externalId
        );
        assertThat(count).isEqualTo(1);
    }

    // ── Req 20.6: verificación GET del webhook ────────────────────────────────

    @Test
    @DisplayName("Req 20.6: GET con hub.challenge correcto → 200, body = challenge")
    void get_webhookVerification_returnsChallenge() {
        String challenge = "CHALLENGE_" + UUID.randomUUID();

        ResponseEntity<String> response = restTemplate.getForEntity(
                "/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}",
                String.class,
                VERIFY_TOKEN, challenge
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(challenge);
    }

    // ── Req 21.5: notificación WebSocket al recibir mensaje ──────────────────

    @Test
    @DisplayName("Req 21.5: POST válido → notificación WebSocket publicada en /topic/workspace/{id}/conversations")
    void post_validWebhook_publishesWebSocketNotification() throws Exception {
        String externalId = "wamid.WS_NOTIFY_" + UUID.randomUUID();
        String payload    = buildPayload(PHONE_NUMBER_ID, KNOWN_PHONE, externalId, "WebSocket test");

        restTemplate.exchange(
                "/webhooks/whatsapp",
                HttpMethod.POST,
                new HttpEntity<>(payload, headersWithSignature(payload, APP_SECRET)),
                Void.class
        );

        // Req 21.5: SimpMessagingTemplate.convertAndSend invocado con el topic del workspace
        String expectedTopic = "/topic/workspace/" + workspaceId + "/conversations";
        verify(messagingTemplate).convertAndSend(eq(expectedTopic), any(Object.class));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Construye el payload JSON de Meta con el formato estándar. */
    private String buildPayload(String phoneNumberId, String fromPhone,
                                String messageId, String body) {
        return """
                {
                  "object": "whatsapp_business_account",
                  "entry": [{
                    "id": "WBA_ID",
                    "changes": [{
                      "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                          "display_phone_number": "15550000000",
                          "phone_number_id": "%s"
                        },
                        "contacts": [{
                          "profile": { "name": "Test User" },
                          "wa_id": "%s"
                        }],
                        "messages": [{
                          "from": "%s",
                          "id": "%s",
                          "timestamp": "1700000000",
                          "text": { "body": "%s" },
                          "type": "text"
                        }]
                      },
                      "field": "messages"
                    }]
                  }]
                }
                """.formatted(phoneNumberId, fromPhone, fromPhone, messageId, body);
    }

    /** Computa HMAC-SHA256 y devuelve headers con Content-Type + X-Hub-Signature-256. */
    private HttpHeaders headersWithSignature(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
        String sig = "sha256=" + HexFormat.of().formatHex(mac.doFinal(payload.getBytes()));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Hub-Signature-256", sig);
        return headers;
    }
}
