package com.crm.module.email.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Configuración de Gmail OAuth2 por workspace.
 * Los tokens se almacenan encriptados con AES-256 (EncryptionService — TODO).
 * Requisito: 24.1
 */
@Getter
@Setter
@Entity
@Table(name = "gmail_configs")
public class GmailConfig extends AuditableEntity {

    @Column(name = "email", nullable = false)
    private String email;

    /**
     * Access token de Gmail OAuth2 — TODO: cifrar/descifrar con EncryptionService (AES-256).
     * Por ahora se almacena como texto plano hasta que EncryptionService esté disponible.
     */
    @Column(name = "access_token", nullable = false, columnDefinition = "TEXT")
    private String accessToken;

    /**
     * Refresh token de Gmail OAuth2 — TODO: cifrar/descifrar con EncryptionService (AES-256).
     * Por ahora se almacena como texto plano hasta que EncryptionService esté disponible.
     */
    @Column(name = "refresh_token", nullable = false, columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(name = "is_active")
    private boolean isActive = true;
}
