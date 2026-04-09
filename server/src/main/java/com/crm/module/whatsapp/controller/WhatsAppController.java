package com.crm.module.whatsapp.controller;

import com.crm.common.security.JwtService;
import com.crm.common.security.WorkspaceContext;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.service.ConversationLockService;
import com.crm.module.user.repository.UserRepository;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    private final UserRepository userRepository;
    private final JwtService jwtService;

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
     * POST /api/whatsapp/conversations/{conversationId}/lock
     * Bloquea una conversación para el usuario actual (auto-lock cuando hace focus en input).
     */
    @PostMapping("/conversations/{conversationId}/lock")
    public ResponseEntity<Map<String, Object>> lockConversation(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada: " + conversationId));

        // Get current user from JWT
        String token = authHeader.substring(7);
        UUID userId = jwtService.extractUserId(token);

        boolean locked = conversationLockService.acquireLock(conversationId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("locked", locked);
        response.put("userId", userId);

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/whatsapp/conversations/{conversationId}/unlock
     * Desbloquea una conversación (auto-unlock después de enviar mensaje).
     */
    @PostMapping("/conversations/{conversationId}/unlock")
    public ResponseEntity<Map<String, Object>> unlockConversation(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada: " + conversationId));

        // Get current user from JWT
        String token = authHeader.substring(7);
        UUID userId = jwtService.extractUserId(token);

        conversationLockService.releaseLock(conversationId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("locked", false);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/whatsapp/conversations/{conversationId}/lock-status
     * Retorna el estado de lock de una conversación (para polling del frontend).
     * Response: { "locked": true/false, "lockedByUserId": "...", "lockedByUserName": "...", "lockedAt": "...", "lockedUntil": "..." }
     */
    @GetMapping("/conversations/{conversationId}/lock-status")
    public ResponseEntity<Map<String, Object>> getLockStatus(
            @PathVariable UUID conversationId) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada: " + conversationId));

        Optional<UUID> lockedByUser = conversationLockService.checkLock(conversationId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("locked", lockedByUser.isPresent());
        
        if (lockedByUser.isPresent()) {
            UUID userId = lockedByUser.get();
            response.put("lockedByUserId", userId);
            
            // Fetch user name
            var user = userRepository.findById(userId);
            response.put("lockedByUserName", user.map(u -> u.getName()).orElse("Agente desconocido"));
        } else {
            response.put("lockedByUserId", null);
            response.put("lockedByUserName", null);
        }
        
        response.put("lockedAt", conversation.getLockedAt());
        response.put("lockedUntil", conversation.getLockedUntil());

        return ResponseEntity.ok(response);
    }
}
