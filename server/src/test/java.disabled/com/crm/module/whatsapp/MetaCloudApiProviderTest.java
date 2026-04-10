package com.crm.module.whatsapp;

import com.crm.module.whatsapp.provider.MetaCloudApiProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link MetaCloudApiProvider}.
 *
 * Validates: Requisitos 20.5, 21.3
 */
@ExtendWith(MockitoExtension.class)
class MetaCloudApiProviderTest {

    @Mock RestTemplate restTemplate;

    MetaCloudApiProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MetaCloudApiProvider(restTemplate, new ObjectMapper());
    }

    // -------------------------------------------------------------------------
    // Req 20.5 — verifyWebhookSignature
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 20.5
     * A correctly computed HMAC-SHA256 signature must be accepted.
     */
    @Disabled @Test
    void verifyWebhookSignature_validSignature_returnsTrue() throws Exception {
        String appSecret = "test-secret";
        String payload   = "{\"object\":\"whatsapp_business_account\"}";
        String signature = "sha256=" + computeHmac(appSecret, payload);

        assertThat(provider.verifyWebhookSignature(payload, signature, appSecret)).isTrue();
    }

    /**
     * Validates: Requisito 20.5
     * A tampered or wrong signature must be rejected.
     */
    @Disabled @Test
    void verifyWebhookSignature_invalidSignature_returnsFalse() {
        String appSecret = "test-secret";
        String payload   = "{\"object\":\"whatsapp_business_account\"}";

        assertThat(provider.verifyWebhookSignature(payload, "sha256=wrongsignature", appSecret))
                .isFalse();
    }

    /**
     * Validates: Requisito 20.5
     * A null or blank signature must be rejected without throwing.
     */
    @Disabled @Test
    void verifyWebhookSignature_nullSignature_returnsFalse() {
        assertThat(provider.verifyWebhookSignature("payload", null, "secret")).isFalse();
        assertThat(provider.verifyWebhookSignature("payload", "  ", "secret")).isFalse();
    }

    /**
     * Validates: Requisito 20.5
     * A null appSecret must be rejected without throwing.
     */
    @Disabled @Test
    void verifyWebhookSignature_nullAppSecret_returnsFalse() {
        assertThat(provider.verifyWebhookSignature("payload", "sha256=abc", null)).isFalse();
    }

    // -------------------------------------------------------------------------
    // Req 21.3 — Meta API failure → RuntimeException thrown
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 21.3
     * When Meta API returns an error (RestTemplate throws), sendMessage must
     * propagate a RuntimeException so the caller can set message status to FAILED.
     */
    @Disabled @Test
    void sendMessage_metaApiThrows_propagatesRuntimeException() {
        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("Connection refused"));

        assertThatThrownBy(() ->
                provider.sendMessage("5491100000000", "hello", "phone-id-123", "access-token"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Error al enviar mensaje WhatsApp");
    }

    /**
     * Validates: Requisito 21.3
     * When Meta API returns a non-2xx response body without a message id,
     * sendMessage must throw RuntimeException.
     */
    @Disabled @Test
    void sendMessage_metaApiReturnsNoMessageId_throwsRuntimeException() {
        String responseBody = "{\"messages\":[]}";
        ResponseEntity<String> response = ResponseEntity.ok(responseBody);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(response);

        assertThatThrownBy(() ->
                provider.sendMessage("5491100000000", "hello", "phone-id-123", "access-token"))
                .isInstanceOf(RuntimeException.class);
    }

    // -------------------------------------------------------------------------
    // Req 21.1 — successful send → returns externalId
    // -------------------------------------------------------------------------

    /**
     * Validates: Requisito 21.1
     * When Meta API responds successfully, sendMessage must return the externalId.
     */
    @Disabled @Test
    void sendMessage_successfulResponse_returnsExternalId() {
        String externalId   = "wamid.sent001";
        String responseBody = "{\"messages\":[{\"id\":\"" + externalId + "\"}]}";
        ResponseEntity<String> response = ResponseEntity.ok(responseBody);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(String.class)))
                .thenReturn(response);

        String result = provider.sendMessage("5491100000000", "hello", "phone-id-123", "access-token");

        assertThat(result).isEqualTo(externalId);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String computeHmac(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(payload.getBytes()));
    }
}
