package com.crm.module.email.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Configuración SMTP por workspace.
 * Las credenciales se almacenan encriptadas con AES-256 (EncryptionService — TODO).
 * Requisitos: 23.1, 23.4, 23.5
 */
@Getter
@Setter
@Entity
@Table(name = "email_smtp_configs")
public class EmailConfig extends AuditableEntity {

    @Column(name = "host", nullable = false)
    private String host;

    @Column(name = "port", nullable = false)
    private int port;

    @Column(name = "username", nullable = false)
    private String username;

    /**
     * Contraseña SMTP — TODO: cifrar/descifrar con EncryptionService (AES-256).
     * Por ahora se almacena como texto plano hasta que EncryptionService esté disponible.
     */
    @Column(name = "password", nullable = false, columnDefinition = "TEXT")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "encryption", nullable = false)
    private EmailEncryption encryption = EmailEncryption.TLS;

    @Column(name = "is_active")
    private boolean isActive = true;
}
