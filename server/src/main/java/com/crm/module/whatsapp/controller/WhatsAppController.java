package com.crm.module.whatsapp.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Endpoints autenticados para envío de mensajes WhatsApp.
 * Requisitos: 21.1–21.5
 */
@Slf4j
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppService whatsAppService;

    /**
     * POST /api/whatsapp/send
     * Envía un mensaje de WhatsApp a un contacto del workspace.
     * Registra el mensaje con estado SENDING → SENT/FAILED.
     * Req 21.1–21.5
     */
    @PostMapping("/send")
    public ResponseEntity<SendWhatsAppResponse> send(
            @Valid @RequestBody SendWhatsAppRequest request) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        if (workspaceId == null) {
            throw new IllegalStateException("workspaceId no disponible en el contexto");
        }

        SendWhatsAppResponse response = whatsAppService.sendMessage(request, workspaceId);
        return ResponseEntity.ok(response);
    }
}
