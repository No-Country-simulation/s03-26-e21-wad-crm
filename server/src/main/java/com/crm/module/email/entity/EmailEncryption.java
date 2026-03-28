package com.crm.module.email.entity;

/**
 * Tipos de encriptación soportados para conexiones SMTP.
 * Requisito: 23.4
 */
public enum EmailEncryption {
    NONE,
    SSL,
    TLS
}
