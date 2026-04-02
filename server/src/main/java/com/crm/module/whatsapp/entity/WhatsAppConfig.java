package com.crm.module.whatsapp.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Configuración de WhatsApp Business por workspace.
 * Las credenciales se almacenan encriptadas con AES-256 (EncryptionService).
 * Requisito: 19.1, NFR-6
 */
@Getter
@Setter
@Entity
@Table(name = "whatsapp_configs")
public class WhatsAppConfig extends AuditableEntity {

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "phone_number_id", nullable = false)
    private String phoneNumberId;

    /** Access token de Meta — almacenado encriptado */
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    /** Token de verificación del webhook — almacenado encriptado */
    @Column(name = "webhook_verify_token", nullable = false, columnDefinition = "TEXT")
    private String webhookVerifyToken;

    /** App Secret de Meta para verificar firma HMAC-SHA256 del webhook. Req 20.1, 20.5 */
    @Column(name = "app_secret", columnDefinition = "TEXT")
    private String appSecret;

    @Column(name = "connected_at")
    private LocalDateTime connectedAt;

    @Column(name = "is_active")
    private boolean active = true;
}
