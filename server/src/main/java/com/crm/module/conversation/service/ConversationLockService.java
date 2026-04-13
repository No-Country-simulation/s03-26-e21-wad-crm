package com.crm.module.conversation.service;

import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Maneja el agente que está atendiendo cada conversación.
 * Simplificado: sin timeout, solo iniciar/cerrar manual.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationLockService {

    private final ConversationRepository conversationRepository;

    @Transactional
    public boolean startAttending(UUID conversationId, UUID agentId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        if (agentId.equals(conv.getLockedByUserId())) {
            log.info("✅ Agente {} ya está atendiendo conversación {}", agentId, conversationId);
            return true;
        }

        if (conv.getLockedByUserId() != null) {
            log.warn("⚠️ Conversación {} ya está siendo atendida por agente {}", conversationId, conv.getLockedByUserId());
            return false;
        }

        conv.setLockedByUserId(agentId);
        conversationRepository.save(conv);
        log.info("🟢 Agente {} inició atención de conversación {}", agentId, conversationId);
        return true;
    }

    @Transactional
    public void stopAttending(UUID conversationId, UUID agentId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        if (!agentId.equals(conv.getLockedByUserId())) {
            log.warn("⚠️ Agente {} intenta cerrar conversación que no está atendiendo", agentId);
            return;
        }

        conv.setLockedByUserId(null);
        conversationRepository.save(conv);
        log.info("🔴 Agente {} cerró atención de conversación {}", agentId, conversationId);
    }

    public Optional<UUID> getAttendingAgent(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId).orElse(null);
        if (conv == null || conv.getLockedByUserId() == null) return Optional.empty();
        return Optional.of(conv.getLockedByUserId());
    }

    public boolean canAgentSendMessage(UUID conversationId, UUID agentId) {
        Optional<UUID> attendingAgent = getAttendingAgent(conversationId);
        if (attendingAgent.isEmpty()) return false;
        return agentId.equals(attendingAgent.get());
    }
}
