package com.crm.module.whatsapp.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.service.ConversationLockService;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/whatsapp")
@RequiredArgsConstructor
public class WhatsAppController {

    private final WhatsAppService whatsAppService;
    private final ConversationLockService conversationLockService;

    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<SendWhatsAppResponse> send(
            @Valid @RequestBody SendWhatsAppRequest request,
            @AuthenticationPrincipal UUID userId) {

        UUID workspaceId = WorkspaceContext.getWorkspaceId();
        SendWhatsAppResponse response = whatsAppService.sendMessage(request, workspaceId, userId);
        return ResponseEntity.ok(response);
    }

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
    }
}
