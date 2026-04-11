package com.crm.module.conversation.service;

import com.crm.common.exception.ResourceNotFoundException;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationLockService {

    private final ConversationRepository conversationRepository;

    @Transactional
    public Conversation lock(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));

        if (conversation.getLockedBy() != null && !conversation.getLockedBy().equals(userId)) {
            throw new IllegalStateException("Conversation is already locked by another user");
        }

        conversation.setLockedBy(userId);
        conversation.setLockedAt(LocalDateTime.now());
        log.info("Conversation {} locked by user {}", conversationId, userId);

        return conversationRepository.save(conversation);
    }

    @Transactional
    public Conversation unlock(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));

        if (conversation.getLockedBy() == null) {
            return conversation;
        }

        if (!conversation.getLockedBy().equals(userId)) {
            throw new IllegalStateException("Cannot unlock: conversation locked by another user");
        }

        conversation.setLockedBy(null);
        conversation.setLockedAt(null);
        log.info("Conversation {} unlocked by user {}", conversationId, userId);

        return conversationRepository.save(conversation);
    }

    public boolean isLockedBy(UUID conversationId, UUID userId) {
        return conversationRepository.findById(conversationId)
                .map(c -> c.getLockedBy() != null && c.getLockedBy().equals(userId))
                .orElse(false);
    }

    public boolean isLockedByAnother(UUID conversationId, UUID userId) {
        return conversationRepository.findById(conversationId)
                .map(c -> c.getLockedBy() != null && !c.getLockedBy().equals(userId))
                .orElse(false);
    }
}
