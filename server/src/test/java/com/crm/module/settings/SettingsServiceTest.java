package com.crm.module.settings;

import com.crm.module.email.entity.EmailConfig;
import com.crm.module.email.entity.GmailConfig;
import com.crm.module.email.provider.GmailOAuthProvider;
import com.crm.module.email.repository.EmailConfigRepository;
import com.crm.module.email.repository.GmailConfigRepository;
import com.crm.module.settings.dto.IntegrationsStatusDto;
import com.crm.module.settings.dto.WhatsAppConfigRequest;
import com.crm.module.settings.service.SettingsService;
import com.crm.module.whatsapp.entity.WhatsAppConfig;
import com.crm.module.whatsapp.provider.WhatsAppProvider;
import com.crm.module.whatsapp.repository.WhatsAppConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para SettingsService.
 * Casos: guardar WhatsApp con verificación fallida → 422, listar integraciones sin exponer tokens,
 * acceso no-ADMIN → 403 (validado en SettingsControllerTest).
 * Requisitos: 19.3, 19.4, 35.4
 */
@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    @Mock
    WhatsAppConfigRepository whatsAppConfigRepository;

    @Mock
    EmailConfigRepository emailConfigRepository;

    @Mock
    GmailConfigRepository gmailConfigRepository;

    @Mock
    WhatsAppProvider whatsAppProvider;

    @Mock
    GmailOAuthProvider gmailOAuthProvider;

    @InjectMocks
    SettingsService settingsService;

    private UUID workspaceId;

    @BeforeEach
    void setUp() {
        workspaceId = UUID.randomUUID();
    }

    // ── Req 19.3: verificación fallida con Meta Cloud API → excepción ─────────

    /**
     * Req 19.3: Cuando la verificación con Meta Cloud API falla,
     * saveWhatsAppConfig lanza WhatsAppVerificationException (→ HTTP 422 en el controller).
     */
    @Test
    @DisplayName("saveWhatsAppConfig: verificación Meta falla — lanza WhatsAppVerificationException")
    void saveWhatsAppConfig_metaVerificationFails_throwsVerificationException() {
        // Arrange
        when(whatsAppProvider.verifyConnection()).thenReturn(false);
        WhatsAppConfigRequest request = new WhatsAppConfigRequest(
                "123456789", "meta-access-token", "verify-token-secret");

        // Act & Assert — Req 19.3: debe lanzar excepción cuando Meta rechaza la conexión
        assertThatThrownBy(() -> settingsService.saveWhatsAppConfig(workspaceId, request))
                .isInstanceOf(SettingsService.WhatsAppVerificationException.class)
                .hasMessageContaining("Meta Cloud API");
    }

    /**
     * Req 19.3: Cuando la verificación falla, no se persiste ninguna configuración.
     */
    @Test
    @DisplayName("saveWhatsAppConfig: verificación Meta falla — no persiste la configuración")
    void saveWhatsAppConfig_metaVerificationFails_doesNotPersistConfig() {
        // Arrange
        when(whatsAppProvider.verifyConnection()).thenReturn(false);
        WhatsAppConfigRequest request = new WhatsAppConfigRequest(
                "123456789", "meta-access-token", "verify-token-secret");

        // Act
        try {
            settingsService.saveWhatsAppConfig(workspaceId, request);
        } catch (SettingsService.WhatsAppVerificationException ignored) {}

        // Assert — Req 19.3: no se debe guardar nada si la verificación falla
        verify(whatsAppConfigRepository, never()).save(any());
    }

    /**
     * Req 19.1/19.2: Cuando la verificación es exitosa, la configuración se persiste.
     */
    @Test
    @DisplayName("saveWhatsAppConfig: verificación Meta exitosa — persiste la configuración")
    void saveWhatsAppConfig_metaVerificationSucceeds_persistsConfig() {
        // Arrange
        when(whatsAppProvider.verifyConnection()).thenReturn(true);
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(whatsAppConfigRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        // stub para getIntegrationsStatus llamado al final
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        WhatsAppConfigRequest request = new WhatsAppConfigRequest(
                "123456789", "meta-access-token", "verify-token-secret");

        // Act
        settingsService.saveWhatsAppConfig(workspaceId, request);

        // Assert — se guardó exactamente una vez
        verify(whatsAppConfigRepository, times(1)).save(any(WhatsAppConfig.class));
    }

    /**
     * Req 19.2: Cuando ya existe una config activa, se desactiva antes de guardar la nueva.
     */
    @Test
    @DisplayName("saveWhatsAppConfig: config existente — se desactiva antes de guardar la nueva")
    void saveWhatsAppConfig_existingConfig_deactivatesBeforeSavingNew() {
        // Arrange
        WhatsAppConfig existing = new WhatsAppConfig();
        existing.setPhoneNumberId("old-phone-id");
        existing.setAccessToken("old-token");
        existing.setWebhookVerifyToken("old-verify");
        existing.setActive(true);

        when(whatsAppProvider.verifyConnection()).thenReturn(true);
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.of(existing));
        when(whatsAppConfigRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        WhatsAppConfigRequest request = new WhatsAppConfigRequest(
                "new-phone-id", "new-token", "new-verify");

        // Act
        settingsService.saveWhatsAppConfig(workspaceId, request);

        // Assert — la config existente fue desactivada
        assertThat(existing.isActive()).isFalse();
        // save fue llamado al menos dos veces: una para desactivar la existente, otra para la nueva
        verify(whatsAppConfigRepository, atLeast(2)).save(any());
    }

    // ── Req 19.4: listar integraciones sin exponer tokens ─────────────────────

    /**
     * Req 19.4: getIntegrationsStatus no expone accessToken ni webhookVerifyToken de WhatsApp.
     */
    @Test
    @DisplayName("getIntegrationsStatus: WhatsApp conectado — no expone tokens en el DTO")
    void getIntegrationsStatus_whatsappConnected_doesNotExposeTokens() {
        // Arrange
        WhatsAppConfig config = new WhatsAppConfig();
        config.setPhoneNumberId("123456789");
        config.setAccessToken("super-secret-access-token");
        config.setWebhookVerifyToken("super-secret-verify-token");
        config.setConnectedAt(LocalDateTime.now());
        config.setActive(true);

        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.of(config));
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        // Act
        IntegrationsStatusDto result = settingsService.getIntegrationsStatus(workspaceId);

        // Assert — Req 19.4: el DTO solo expone phoneNumberId y connectedAt, nunca tokens
        assertThat(result.whatsapp().connected()).isTrue();
        assertThat(result.whatsapp().phoneNumberId()).isEqualTo("123456789");
        assertThat(result.whatsapp().connectedAt()).isNotNull();

        // Verificar que el DTO no contiene los tokens (no hay campo para ellos en el record)
        // El record WhatsAppStatus solo tiene: connected, phoneNumberId, connectedAt
        assertThat(result.whatsapp()).isNotNull();
        // Los tokens no son accesibles desde el DTO — validado por la estructura del record
    }

    /**
     * Req 19.4: getIntegrationsStatus no expone password SMTP ni tokens Gmail.
     */
    @Test
    @DisplayName("getIntegrationsStatus: SMTP conectado — no expone password en el DTO")
    void getIntegrationsStatus_smtpConnected_doesNotExposePassword() {
        // Arrange
        EmailConfig smtpConfig = new EmailConfig();
        smtpConfig.setHost("smtp.example.com");
        smtpConfig.setPort(587);
        smtpConfig.setUsername("user@example.com");
        smtpConfig.setPassword("super-secret-smtp-password");
        smtpConfig.setActive(true);

        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(smtpConfig));

        // Act
        IntegrationsStatusDto result = settingsService.getIntegrationsStatus(workspaceId);

        // Assert — Req 19.4: solo expone tipo y host, nunca la contraseña
        assertThat(result.email().connected()).isTrue();
        assertThat(result.email().type()).isEqualTo("SMTP");
        assertThat(result.email().identifier()).isEqualTo("smtp.example.com");
        // El record EmailStatus solo tiene: connected, type, identifier — sin password
    }

    /**
     * Req 19.4: getIntegrationsStatus con Gmail conectado — no expone access/refresh tokens.
     */
    @Test
    @DisplayName("getIntegrationsStatus: Gmail conectado — no expone tokens OAuth en el DTO")
    void getIntegrationsStatus_gmailConnected_doesNotExposeOAuthTokens() {
        // Arrange
        GmailConfig gmailConfig = new GmailConfig();
        gmailConfig.setEmail("user@gmail.com");
        gmailConfig.setAccessToken("ya29.super-secret-access-token");
        gmailConfig.setRefreshToken("1//super-secret-refresh-token");
        gmailConfig.setActive(true);

        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(gmailConfig));

        // Act
        IntegrationsStatusDto result = settingsService.getIntegrationsStatus(workspaceId);

        // Assert — Req 19.4: solo expone tipo y email, nunca los tokens OAuth
        assertThat(result.email().connected()).isTrue();
        assertThat(result.email().type()).isEqualTo("GMAIL");
        assertThat(result.email().identifier()).isEqualTo("user@gmail.com");
        // El record EmailStatus no tiene campos para access/refresh token
    }

    /**
     * Req 19.4: Cuando no hay integraciones configuradas, retorna estado desconectado.
     */
    @Test
    @DisplayName("getIntegrationsStatus: sin integraciones — retorna todo desconectado")
    void getIntegrationsStatus_noIntegrations_returnsAllDisconnected() {
        // Arrange
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        // Act
        IntegrationsStatusDto result = settingsService.getIntegrationsStatus(workspaceId);

        // Assert
        assertThat(result.whatsapp().connected()).isFalse();
        assertThat(result.whatsapp().phoneNumberId()).isNull();
        assertThat(result.email().connected()).isFalse();
        assertThat(result.email().type()).isNull();
    }

    /**
     * Req 19.4: Gmail tiene prioridad sobre SMTP cuando ambos están activos.
     */
    @Test
    @DisplayName("getIntegrationsStatus: Gmail y SMTP activos — Gmail tiene prioridad")
    void getIntegrationsStatus_gmailAndSmtpBothActive_gmailTakesPriority() {
        // Arrange
        GmailConfig gmailConfig = new GmailConfig();
        gmailConfig.setEmail("user@gmail.com");
        gmailConfig.setAccessToken("token");
        gmailConfig.setRefreshToken("refresh");
        gmailConfig.setActive(true);

        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.of(gmailConfig));
        // emailConfigRepository no debe ser consultado cuando Gmail está activo

        // Act
        IntegrationsStatusDto result = settingsService.getIntegrationsStatus(workspaceId);

        // Assert — Gmail tiene prioridad
        assertThat(result.email().type()).isEqualTo("GMAIL");
        // SMTP no fue consultado
        verify(emailConfigRepository, never()).findByWorkspaceIdAndIsActiveTrue(workspaceId);
    }

    // ── Req 35.4: aislamiento de workspace ────────────────────────────────────

    /**
     * Req 35.4: getIntegrationsStatus siempre consulta con el workspaceId correcto,
     * nunca con el de otro workspace.
     */
    @Test
    @DisplayName("getIntegrationsStatus: consulta repositorios solo con el workspaceId del usuario")
    void getIntegrationsStatus_alwaysQueriesWithCorrectWorkspaceId() {
        // Arrange
        UUID otherWorkspaceId = UUID.randomUUID();
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(gmailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());
        when(emailConfigRepository.findByWorkspaceIdAndIsActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        // Act
        settingsService.getIntegrationsStatus(workspaceId);

        // Assert — Req 35.4: nunca se consulta con el workspaceId de otro workspace
        verify(whatsAppConfigRepository).findByWorkspaceIdAndActiveTrue(workspaceId);
        verify(whatsAppConfigRepository, never()).findByWorkspaceIdAndActiveTrue(otherWorkspaceId);
        verify(gmailConfigRepository).findByWorkspaceIdAndIsActiveTrue(workspaceId);
        verify(gmailConfigRepository, never()).findByWorkspaceIdAndIsActiveTrue(otherWorkspaceId);
    }

    // ── Req 35.2/35.3: desconexión de integraciones ───────────────────────────

    /**
     * Req 35.2: disconnectWhatsApp desactiva la config activa del workspace.
     */
    @Test
    @DisplayName("disconnectWhatsApp: config activa — la desactiva correctamente")
    void disconnectWhatsApp_activeConfig_deactivatesIt() {
        // Arrange
        WhatsAppConfig config = new WhatsAppConfig();
        config.setActive(true);
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.of(config));
        when(whatsAppConfigRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Act
        settingsService.disconnectWhatsApp(workspaceId);

        // Assert
        assertThat(config.isActive()).isFalse();
        verify(whatsAppConfigRepository).save(config);
    }

    /**
     * Req 35.2: disconnectWhatsApp es idempotente cuando no hay config activa.
     */
    @Test
    @DisplayName("disconnectWhatsApp: sin config activa — no lanza excepción (idempotente)")
    void disconnectWhatsApp_noActiveConfig_isIdempotent() {
        // Arrange
        when(whatsAppConfigRepository.findByWorkspaceIdAndActiveTrue(workspaceId))
                .thenReturn(Optional.empty());

        // Act & Assert — no debe lanzar excepción
        settingsService.disconnectWhatsApp(workspaceId);
        verify(whatsAppConfigRepository, never()).save(any());
    }
}
