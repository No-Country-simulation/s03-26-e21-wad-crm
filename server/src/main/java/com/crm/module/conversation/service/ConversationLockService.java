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

    /**
     * Inicia la atención de una conversación por un agente.
     * Guarda el agentId en la conversación.
     * Retorna true si tuvo éxito, false si ya está siendo atendida por otro.
     */
    @Transactional
    public boolean startAttending(UUID conversationId, UUID agentId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        // Si ya está siendo atendida por el mismo agente, OK
        if (agentId.equals(conv.getLockedByUserId())) {
            log.info("✅ Agente {} ya está atendiendo conversación {}", agentId, conversationId);
            return true;
        }

        // Si está siendo atendida por otro agente
        if (conv.getLockedByUserId() != null) {
            log.warn("⚠️ Conversación {} ya está siendo atendida por agente {}", 
                    conversationId, conv.getLockedByUserId());
            return false;
        }

        // Iniciar atención
        conv.setLockedByUserId(agentId);
        conversationRepository.save(conv);
        log.info("🟢 Agente {} inició atención de conversación {}", agentId, conversationId);
        return true;
    }

    /**
     * Cierra la atención de una conversación.
     * Solo el agente que la está atendiendo puede cerrarla.
     */
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

    /**
     * Obtiene el agente que está atendiendo una conversación.
     * Retorna Optional.empty() si no hay nadie atendiéndola.
     */
    public Optional<UUID> getAttendingAgent(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElse(null);

        if (conv == null || conv.getLockedByUserId() == null) {
            return Optional.empty();
        }

        return Optional.of(conv.getLockedByUserId());
    }

    /**
     * Verifica si un agente puede enviar mensajes a esta conversación.
     * Solo puede enviar si es el agente que la está atendiendo.
     */
    public boolean canAgentSendMessage(UUID conversationId, UUID agentId) {
        Optional<UUID> attendingAgent = getAttendingAgent(conversationId);

        if (attendingAgent.isEmpty()) {
            return false; // Nadie la está atendiendo, hay que iniciar primero
        }

        return agentId.equals(attendingAgent.get());
    }
}
