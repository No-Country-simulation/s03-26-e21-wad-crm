package com.crm.module.whatsapp.provider;

/**
 * Interfaz de integración con proveedores de WhatsApp.
 * Implementación actual: MetaCloudWhatsAppProvider (Meta Cloud API v20.0)
 */
public interface WhatsAppProvider {

    /**
     * Envía un mensaje de texto a un número de teléfono.
     */
    String sendTextMessage(String phoneNumber, String body);

    /**
     * Verifica la firma HMAC del webhook entrante.
     */
    boolean verifyWebhookSignature(String payload, String signature);

    /**
     * Verifica que las credenciales configuradas son válidas contra la API.
     */
    boolean verifyConnection();

    /**
     * Nombre del proveedor activo.
     */
    String getProviderName();
}
