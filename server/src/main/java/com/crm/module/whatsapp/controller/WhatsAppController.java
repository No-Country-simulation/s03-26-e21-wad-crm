package com.crm.module.whatsapp.controller;

import com.crm.module.whatsapp.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints autenticados de WhatsApp.
 * POST /api/whatsapp/send  → enviar mensaje a un contacto
 * Requisitos: 21.1 – 21.5
 * Implementación completa en tarea 9.5.
 */
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    // Implementación en tarea 9.5
}
