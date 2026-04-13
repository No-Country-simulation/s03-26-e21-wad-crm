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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Endpoints autenticados para envío de mensajes WhatsApp.
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

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'SALES')")
    public ResponseEntity<SendWhatsAppResponse> send(
            @Valid @RequestBody SendWhatsAppRequest request,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        String token = authHeader.substring(7);
        UUID userId = jwtService.extractUserId(token);
        SendWhatsAppResponse response = whatsAppService.sendMessage(request, workspaceId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations/{conversationId}/start")
    public ResponseEntity<Map<String, Object>> startAttending(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        String token = authHeader.substring(7);
        UUID agentId = jwtService.extractUserId(token);
        boolean started = conversationLockService.startAttending(conversationId, agentId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("started", started);
        response.put("agentId", agentId);

        if (!started) {
            Optional<UUID> currentAgent = conversationLockService.getAttendingAgent(conversationId);
            currentAgent.ifPresent(id -> {
                var user = userRepository.findById(id);
                response.put("attendingAgentName", user.map(u -> u.getName()).orElse("Otro agente"));
            });
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations/{conversationId}/stop")
    public ResponseEntity<Map<String, Object>> stopAttending(
            @PathVariable UUID conversationId,
            @RequestHeader("Authorization") String authHeader) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada"));

        String token = authHeader.substring(7);
        UUID agentId = jwtService.extractUserId(token);
        conversationLockService.stopAttending(conversationId, agentId);

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversationId);
        response.put("stopped", true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/{conversationId}/attending")
    public ResponseEntity<Map<String, Object>> getAttendingAgent(@PathVariable UUID conversationId) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        conversationRepository.findByIdAndWorkspaceId(conversationId, workspaceId)
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
    }
}
