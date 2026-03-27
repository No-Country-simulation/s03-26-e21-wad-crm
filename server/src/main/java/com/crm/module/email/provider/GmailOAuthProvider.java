package com.crm.module.email.provider;

import com.crm.module.email.dto.EmailMessage;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.repository.GmailConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Proveedor de email vía Gmail OAuth2.
 * Gestiona el flujo OAuth2 completo: autorización, callback, refresh y revocación.
 * Requisitos: 24.1–24.4
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GmailOAuthProvider implements EmailProvider {

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
    private static final String GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    private static final String GMAIL_PROFILE_URL = "https://gmail.googleapis.com/gmail/v1/users/me/profile";

    private static final String SCOPE_SEND = "https://www.googleapis.com/auth/gmail.send";
    private static final String SCOPE_READONLY = "https://www.googleapis.com/auth/gmail.readonly";

    private final GmailConfigRepository gmailConfigRepository;
    private final RestTemplate restTemplate;

    @Value("${app.google.client-id:}")
    private String clientId;

    @Value("${app.google.client-secret:}")
    private String clientSecret;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private GmailConfig activeConfig;

    /**
     * Configura el proveedor con la GmailConfig activa del workspace.
     */
    public GmailOAuthProvider withConfig(GmailConfig config) {
        this.activeConfig = config;
        return this;
    }

    /**
     * Construye la URL de autorización OAuth2 de Google.
     * Requisito: 24.1
     */
    public String getAuthorizationUrl(String workspaceId) {
        String redirectUri = buildRedirectUri();
        String scopes = SCOPE_SEND + " " + SCOPE_READONLY;

        return GOOGLE_AUTH_URL
                + "?client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&response_type=code"
                + "&scope=" + scopes.replace(" ", "%20")
                + "&access_type=offline"
                + "&prompt=consent"
                + "&state=" + workspaceId;
    }

    /**
     * Intercambia el código de autorización por tokens y los almacena.
     * Requisito: 24.2
     */
    public GmailConfig handleCallback(String code, String workspaceId) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", buildRedirectUri());
        params.add("grant_type", "authorization_code");

        Map<String, Object> tokenResponse = exchangeTokens(params);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");

        // Fetch Gmail profile to get the email address
        String email = fetchGmailEmail(accessToken);

        // Deactivate any existing config for this workspace
        gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(UUID.fromString(workspaceId))
                .ifPresent(existing -> {
                    existing.setActive(false);
                    gmailConfigRepository.save(existing);
                });

        GmailConfig config = new GmailConfig();
        config.setWorkspaceId(UUID.fromString(workspaceId));
        config.setEmail(email);
        // TODO: cifrar accessToken con EncryptionService (AES-256) cuando esté disponible
        config.setAccessToken(accessToken);
        // TODO: cifrar refreshToken con EncryptionService (AES-256) cuando esté disponible
        config.setRefreshToken(refreshToken);
        config.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 3600));
        config.setActive(true);

        return gmailConfigRepository.save(config);
    }

    /**
     * Renueva el access token usando el refresh token.
     * Requisito: 24.3
     */
    public void refreshAccessToken(GmailConfig config) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        // TODO: descifrar refreshToken con EncryptionService cuando esté disponible
        params.add("refresh_token", config.getRefreshToken());
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", "refresh_token");

        Map<String, Object> tokenResponse = exchangeTokens(params);

        String newAccessToken = (String) tokenResponse.get("access_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");

        // TODO: cifrar newAccessToken con EncryptionService cuando esté disponible
        config.setAccessToken(newAccessToken);
        config.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn != null ? expiresIn : 3600));
        gmailConfigRepository.save(config);
        log.info("Gmail access token refreshed for config {}", config.getId());
    }

    /**
     * Revoca los tokens y elimina la configuración.
     * Requisito: 24.4
     */
    public void revokeTokens(GmailConfig config) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            // TODO: descifrar accessToken con EncryptionService cuando esté disponible
            params.add("token", config.getAccessToken());

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            restTemplate.postForEntity(GOOGLE_REVOKE_URL, request, String.class);
            log.info("Gmail tokens revoked for config {}", config.getId());
        } catch (Exception e) {
            log.warn("Failed to revoke Gmail tokens (proceeding with deletion): {}", e.getMessage());
        }
        gmailConfigRepository.delete(config);
    }

    @Override
    public void send(EmailMessage message) {
        if (activeConfig == null) {
            throw new IllegalStateException("GmailConfig no configurada para GmailOAuthProvider");
        }

        // Auto-refresh token if expired
        if (isTokenExpired(activeConfig)) {
            log.info("Gmail access token expired, refreshing...");
            refreshAccessToken(activeConfig);
        }

        try {
            String rawMessage = buildRfc2822Message(message);
            String encodedMessage = Base64.getUrlEncoder()
                    .encodeToString(rawMessage.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // TODO: descifrar accessToken con EncryptionService cuando esté disponible
            headers.setBearerAuth(activeConfig.getAccessToken());

            Map<String, String> body = Map.of("raw", encodedMessage);
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(GMAIL_SEND_URL, request, String.class);
            log.info("Email sent via Gmail API to {}", message.to());
        } catch (Exception e) {
            log.error("Failed to send email via Gmail API: {}", e.getMessage());
            throw new RuntimeException("Error al enviar email vía Gmail: " + e.getMessage(), e);
        }
    }

    @Override
    public void testConnection() {
        if (activeConfig == null) {
            throw new IllegalStateException("GmailConfig no configurada para GmailOAuthProvider");
        }

        if (isTokenExpired(activeConfig)) {
            refreshAccessToken(activeConfig);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            // TODO: descifrar accessToken con EncryptionService cuando esté disponible
            headers.setBearerAuth(activeConfig.getAccessToken());
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    GMAIL_PROFILE_URL, HttpMethod.GET, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Gmail API respondió con estado: " + response.getStatusCode());
            }
            log.info("Gmail connection test successful for {}", activeConfig.getEmail());
        } catch (Exception e) {
            throw new RuntimeException("No se pudo validar la conexión con Gmail: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "GMAIL";
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private boolean isTokenExpired(GmailConfig config) {
        return config.getTokenExpiresAt() != null
                && LocalDateTime.now().isAfter(config.getTokenExpiresAt().minusMinutes(2));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeTokens(MultiValueMap<String, String> params) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(GOOGLE_TOKEN_URL, request, Map.class);
        if (response.getBody() == null || !response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Error al intercambiar tokens con Google: " + response.getStatusCode());
        }
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    private String fetchGmailEmail(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<Void> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    GMAIL_PROFILE_URL, HttpMethod.GET, request, Map.class);

            if (response.getBody() != null) {
                return (String) response.getBody().get("emailAddress");
            }
        } catch (Exception e) {
            log.warn("Could not fetch Gmail profile email: {}", e.getMessage());
        }
        return "unknown@gmail.com";
    }

    private String buildRfc2822Message(EmailMessage message) {
        StringBuilder sb = new StringBuilder();
        sb.append("From: ").append(activeConfig.getEmail()).append("\r\n");
        sb.append("To: ").append(message.to()).append("\r\n");

        if (message.cc() != null && !message.cc().isEmpty()) {
            sb.append("Cc: ").append(String.join(", ", message.cc())).append("\r\n");
        }
        if (message.bcc() != null && !message.bcc().isEmpty()) {
            sb.append("Bcc: ").append(String.join(", ", message.bcc())).append("\r\n");
        }
        if (message.inReplyTo() != null) {
            sb.append("In-Reply-To: ").append(message.inReplyTo()).append("\r\n");
        }
        if (message.references() != null) {
            sb.append("References: ").append(message.references()).append("\r\n");
        }

        sb.append("Subject: ").append(message.subject()).append("\r\n");
        sb.append("Content-Type: text/html; charset=UTF-8\r\n");
        sb.append("MIME-Version: 1.0\r\n");
        sb.append("\r\n");
        sb.append(message.body());

        return sb.toString();
    }

    private String buildRedirectUri() {
        return frontendUrl.replace("localhost:3000", "localhost:8080")
                + "/api/settings/integrations/email/oauth/callback";
    }
}
