package com.crm.module.conversation.controller;

import com.crm.module.conversation.dto.ConversationDto;
import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

/**
 * Controlador de conversaciones y mensajes.
 * Requisitos: 22.1, 22.4
 */
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    /**
     * GET /api/conversations — lista conversaciones del workspace ordenadas por lastMessageAt desc.
     * Requisito: 22.4
     */
    @GetMapping
    public ResponseEntity<Page<ConversationDto>> listConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        return ResponseEntity.ok(conversationService.listConversations(workspaceId, pageable));
    }

    /**
     * GET /api/conversations/{id}/messages — mensajes paginados ordenados por sentAt asc.
     * Requisito: 22.1, 22.3
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<Page<MessageDto>> listMessages(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {

        UUID workspaceId = extractWorkspaceId(principal);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sentAt"));
        return ResponseEntity.ok(conversationService.listMessages(id, workspaceId, pageable));
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private UUID extractWorkspaceId(Principal principal) {
        // TODO: replace with WorkspaceContext.get() once WorkspaceFilter is implemented (task 2.2)
        if (principal == null) {
            throw new IllegalStateException("Usuario no autenticado");
        }
        try {
            var auth = (org.springframework.security.core.Authentication) principal;
            Object details = auth.getDetails();
            if (details instanceof Map<?, ?> map && map.containsKey("workspaceId")) {
                return UUID.fromString(map.get("workspaceId").toString());
            }
        } catch (Exception ignored) {
            // fall through
        }
        throw new IllegalStateException(
                "workspaceId no disponible en el contexto. Asegúrese de que WorkspaceFilter esté configurado.");
    }
}
