package com.crm.module.whatsapp.controller;

import com.crm.common.security.JwtService;
import com.crm.common.security.WorkspaceContext;
<<<<<<< HEAD
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.service.ConversationLockService;
=======
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.service.ConversationLockService;
import com.crm.module.user.repository.UserRepository;
>>>>>>> origin/feat/startup-crm/whatsapp
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
<<<<<<< HEAD
import org.springframework.security.core.annotation.AuthenticationPrincipal;
=======
>>>>>>> origin/feat/startup-crm/whatsapp
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

<<<<<<< HEAD
=======
/**
 * Endpoints autenticados para envío de mensajes WhatsApp.
 */
>>>>>>> origin/feat/startup-crm/whatsapp
@Slf4j
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    private final ConversationLockService conversationLockService;
<<<<<<< HEAD

=======
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * POST /api/whatsapp/send
     * Only ADMIN and AGENT roles can send messages
     */
>>>>>>> origin/feat/startup-crm/whatsapp
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<SendWhatsAppResponse> send(
            @Valid @RequestBody SendWhatsAppRequest request,
            @AuthenticationPrincipal UUID userId) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        SendWhatsAppResponse response = whatsAppService.sendMessage(request, workspaceId, userId);
        return ResponseEntity.ok(response);
    }

<<<<<<< HEAD
    @PostMapping("/conversations/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Conversation> lockConversation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        Conversation conversation = conversationLockService.lock(id, userId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/conversations/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<Conversation> unlockConversation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        Conversation conversation = conversationLockService.unlock(id, userId);
        return ResponseEntity.ok(conversation);
=======
    /**
     * POST /api/whatsapp/conversations/{conversationId}/start
     * Inicia la atención de una conversación por el agente actual.
     */
    @PostMapping("/conversations/{conversationId}/start")
    public ResponseEntity<Map<String, Object>> startAttending(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        String token = authHeader.substring(7);
        UUID agentId = jwtService.extractUserId(token);

        boolean started = conversationLockService.startAttending(conversationId, agentId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("started", started);
        response.put("agentId", agentId);

        if (!started) {
            // Obtener nombre del agente que la está atendiendo
            Optional<UUID> currentAgent = conversationLockService.getAttendingAgent(conversationId);
            if (currentAgent.isPresent()) {
                var user = userRepository.findById(currentAgent.get());
                response.put("attendingAgentName", user.map(u -> u.getName()).orElse("Otro agente"));
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/whatsapp/conversations/{conversationId}/stop
     * Cierra la atención de una conversación.
     */
    @PostMapping("/conversations/{conversationId}/stop")
    public ResponseEntity<Map<String, Object>> stopAttending(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        String token = authHeader.substring(7);
        UUID agentId = jwtService.extractUserId(token);

        conversationLockService.stopAttending(conversationId, agentId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("stopped", true);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/whatsapp/conversations/{conversationId}/attending
     * Retorna quién está atendiendo la conversación.
     */
    @GetMapping("/conversations/{conversationId}/attending")
    public ResponseEntity<Map<String, Object>> getAttendingAgent(
            @PathVariable UUID conversationId) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        var conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        Optional<UUID> attendingAgent = conversationLockService.getAttendingAgent(conversationId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("isAttending", attendingAgent.isPresent());
        response.put("agentId", attendingAgent.orElse(null));

        if (attendingAgent.isPresent()) {
            var user = userRepository.findById(attendingAgent.get());
            response.put("agentName", user.map(u -> u.getName()).orElse("Agente desconocido"));
        } else {
            response.put("agentName", null);
        }

        return ResponseEntity.ok(response);
>>>>>>> origin/feat/startup-crm/whatsapp
    }
}
