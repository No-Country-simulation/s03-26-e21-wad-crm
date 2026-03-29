package com.crm.module.whatsapp.provider;

import com.crm.module.whatsapp.entity.WhatsAppConfig;

/**
 * Interfaz de integración con Meta Cloud API (WhatsApp Business).
 * Requisitos: 19.2, 19.3, 20.1, 20.5, 21.1
 */
public interface WhatsAppProvider {

    /**
     * Envía un mensaje de texto a un número de teléfono.
     * Req 21.1: POST https://graph.facebook.com/v19.0/{phoneNumberId}/messages
     *
     * @param phoneNumber número destino (sin prefijo +, ej: "521234567890")
     * @param body        texto del mensaje
     * @return externalId retornado por Meta (messages[0].id)
     */
    String sendMessage(String phoneNumber, String body);

    /**
     * Verifica la firma HMAC-SHA256 del payload del webhook.
     * Req 20.1, 20.5: header X-Hub-Signature-256 = "sha256=<hex>"
     *
     * @param payload   cuerpo raw del request
     * @param signature valor del header X-Hub-Signature-256
     * @return true si la firma es válida
     */
    boolean verifyWebhookSignature(String payload, String signature);

    /**
     * Verifica la conexión con Meta Cloud API usando las credenciales dadas.
     * Req 19.3: llamada de prueba antes de guardar la configuración.
     *
     * @param config configuración a validar (tokens en texto plano, ya descifrados)
     * @throws RuntimeException si la verificación falla, con mensaje descriptivo
     */
    void verifyConnection(WhatsAppConfig config);
}
