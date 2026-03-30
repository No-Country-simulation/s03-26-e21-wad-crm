package com.crm.module.conversation.controller;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.conversation.dto.ConversationDto;
import com.crm.module.conversation.dto.MessageDto;
import com.crm.module.conversation.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

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
}
