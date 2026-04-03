package com.crm.module.conversation.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.conversation.dto.AddMessageRequest;
import com.crm.module.conversation.dto.ConversationDto;
import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.entity.MessageDirection;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.conversation.service.ConversationService;
import com.crm.module.whatsapp.dto.SendWhatsAppRequest;
import com.crm.module.whatsapp.dto.SendWhatsAppResponse;
import com.crm.module.whatsapp.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;
    private final ConversationRepository conversationRepository;
    private final WhatsAppService whatsAppService;

    @GetMapping
    public ResponseEntity<Page<ConversationDto>> listConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        return ResponseEntity.ok(conversationService.listConversations(WorkspaceContext.getWorkspaceId(), pageable));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<Page<MessageDto>> listMessages(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "sentAt"));
        return ResponseEntity.ok(conversationService.listMessages(id, WorkspaceContext.getWorkspaceId(), pageable));
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable UUID conversationId,
            @RequestBody SendMessageRequest request) {
        UUID workspaceId = WorkspaceContext.getWorkspaceId();

        // 1. Get conversation to find contact
        Conversation conversation = conversationRepository
                .findByIdAndWorkspaceId(conversationId, workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("Conversación no encontrada: " + conversationId));

        // 2. Send via WhatsApp API (Meta)
        SendWhatsAppRequest waRequest = new SendWhatsAppRequest(
                conversation.getContactId(),
                request.body(),
                null, null, null
        );
        SendWhatsAppResponse waResponse = whatsAppService.sendMessage(waRequest, workspaceId);

        // 3. Save message to DB with externalId from Meta response
        AddMessageRequest addRequest = new AddMessageRequest(
                conversationId,
                request.body(),
                MessageDirection.OUTBOUND,
                MessageChannel.WHATSAPP,
                null,
                waResponse.externalId(),
                null
        );
        MessageDto savedMessage = conversationService.addMessage(addRequest, workspaceId);

        log.info("[CONVERSATION] Mensaje enviado a conversationId={}, waId={}", conversationId, waResponse.externalId());
        return ResponseEntity.ok(savedMessage);
    }

    // DTO for sending message
    public record SendMessageRequest(String body) {}
}
