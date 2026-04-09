package com.crm.module.whatsapp.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.service.ConversationLockService;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
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
    private final ConversationLockService conversationLockService;
    private final ConversationRepository conversationRepository;

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

    /**
     * GET /api/whatsapp/conversations/{conversationId}/lock-status
     * Retorna el estado de lock de una conversación (para polling del frontend).
     * Response: { "locked": true/false, "lockedByUserId": "...", "lockedAt": "...", "lockedUntil": "..." }
     */
    @GetMapping("/conversations/{conversationId}/lock-status")
    public ResponseEntity<Map<String, Object>> getLockStatus(
            @PathVariable UUID conversationId) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada: " + conversationId));

        Optional<UUID> lockedByUser = conversationLockService.checkLock(conversationId);

        return ResponseEntity.ok(Map.of(
                "conversationId", conversationId,
                "locked", lockedByUser.isPresent(),
                "lockedByUserId", lockedByUser.orElse(null),
                "lockedAt", conversation.getLockedAt(),
                "lockedUntil", conversation.getLockedUntil()
        ));
    }
}
