package com.crm.module.email.provider;

import com.crm.module.email.dto.EmailMessage;

/**
 * Interfaz de integración con proveedores de email.
 * Implementaciones: SmtpEmailProvider, GmailOAuthProvider
 */
public interface EmailProvider {

    /**
     * Envía un email usando el proveedor configurado.
     */
    void send(EmailMessage message);

    /**
     * Verifica que la conexión/credenciales son válidas.
     * Lanza RuntimeException con mensaje descriptivo si falla.
     */
    void testConnection();

    /**
     * Nombre del proveedor activo.
     */
    String getProviderName();
}
