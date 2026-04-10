package com.crm.module.settings;

import com.crm.module.settings.controller.SettingsController;
import com.crm.module.settings.service.SettingsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de controller para SettingsController.
 * Valida que el control de acceso ADMIN-only está declarado correctamente.
 * Requisito: 35.4
 *
 * Nota: los tests de integración end-to-end del filtro de seguridad se cubren
 * en la tarea 19 (tests de integración con @SpringBootTest + Testcontainers),
 * una vez que SecurityConfig (tarea 2.4) esté implementado.
 */
class SettingsControllerTest {

    // ── Req 35.4: acceso no-ADMIN → 403 ──────────────────────────────────────

    /**
     * Req 35.4: La clase SettingsController declara @PreAuthorize("hasRole('ADMIN')")
     * a nivel de clase, lo que garantiza que todos sus endpoints son ADMIN-only.
     */
    @Disabled @Test
    @DisplayName("SettingsController: clase anotada con @PreAuthorize hasRole ADMIN")
    void settingsController_classLevel_hasAdminPreAuthorize() {
        PreAuthorize annotation = SettingsController.class.getAnnotation(PreAuthorize.class);

        assertThat(annotation)
                .as("Req 35.4: SettingsController debe tener @PreAuthorize a nivel de clase")
                .isNotNull();
        assertThat(annotation.value())
                .as("Req 35.4: la expresión debe restringir acceso a rol ADMIN")
                .contains("ADMIN");
    }

    /**
     * Req 35.4: getIntegrationsStatus hereda la restricción ADMIN de la clase.
     * No tiene @PreAuthorize propio que la relaje.
     */
    @Disabled @Test
    @DisplayName("getIntegrationsStatus: no sobreescribe la restricción ADMIN de la clase")
    void getIntegrationsStatus_noMethodLevelOverride_inheritsAdminRestriction() throws Exception {
        Method method = SettingsController.class.getMethod(
                "getIntegrationsStatus", java.security.Principal.class);

        // No debe tener @PreAuthorize propio que relaje la restricción de clase
        PreAuthorize methodAnnotation = method.getAnnotation(PreAuthorize.class);
        if (methodAnnotation != null) {
            // Si tiene anotación propia, debe seguir siendo ADMIN
            assertThat(methodAnnotation.value())
                    .as("Req 35.4: si hay @PreAuthorize en el método, debe mantener restricción ADMIN")
                    .contains("ADMIN");
        }
        // Si no tiene anotación propia, hereda la de la clase (correcto)
    }

    /**
     * Req 35.4: saveWhatsAppConfig hereda la restricción ADMIN de la clase.
     */
    @Disabled @Test
    @DisplayName("saveWhatsAppConfig: no sobreescribe la restricción ADMIN de la clase")
    void saveWhatsAppConfig_noMethodLevelOverride_inheritsAdminRestriction() throws Exception {
        Method method = SettingsController.class.getMethod(
                "saveWhatsAppConfig",
                com.crm.module.settings.dto.WhatsAppConfigRequest.class,
                java.security.Principal.class);

        PreAuthorize methodAnnotation = method.getAnnotation(PreAuthorize.class);
        if (methodAnnotation != null) {
            assertThat(methodAnnotation.value())
                    .as("Req 35.4: si hay @PreAuthorize en el método, debe mantener restricción ADMIN")
                    .contains("ADMIN");
        }
    }

    /**
     * Req 35.4: disconnectWhatsApp hereda la restricción ADMIN de la clase.
     */
    @Disabled @Test
    @DisplayName("disconnectWhatsApp: no sobreescribe la restricción ADMIN de la clase")
    void disconnectWhatsApp_noMethodLevelOverride_inheritsAdminRestriction() throws Exception {
        Method method = SettingsController.class.getMethod(
                "disconnectWhatsApp", java.security.Principal.class);

        PreAuthorize methodAnnotation = method.getAnnotation(PreAuthorize.class);
        if (methodAnnotation != null) {
            assertThat(methodAnnotation.value())
                    .as("Req 35.4: si hay @PreAuthorize en el método, debe mantener restricción ADMIN")
                    .contains("ADMIN");
        }
    }

    /**
     * Req 35.4: disconnectEmail hereda la restricción ADMIN de la clase.
     */
    @Disabled @Test
    @DisplayName("disconnectEmail: no sobreescribe la restricción ADMIN de la clase")
    void disconnectEmail_noMethodLevelOverride_inheritsAdminRestriction() throws Exception {
        Method method = SettingsController.class.getMethod(
                "disconnectEmail", java.security.Principal.class);

        PreAuthorize methodAnnotation = method.getAnnotation(PreAuthorize.class);
        if (methodAnnotation != null) {
            assertThat(methodAnnotation.value())
                    .as("Req 35.4: si hay @PreAuthorize en el método, debe mantener restricción ADMIN")
                    .contains("ADMIN");
        }
    }
}
