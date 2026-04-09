package com.crm.module.conversation.service;

import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Maneja locks de conversaciones para multi-agente.
 * Previene que múltiples agentes envíen mensajes simultáneamente a la misma conversación.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversationLockService {

    private final ConversationRepository conversationRepository;
    private static final int LOCK_TIMEOUT_MINUTES = 15;

    /**
     * Intenta lockear una conversación para un usuario.
     * Si ya está lockeada por otro user y no expiró, retorna false.
     * Si expiró, libera automáticamente y lockea para este user.
     */
    @Transactional
    public boolean acquireLock(UUID conversationId, UUID userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        // Si el mismo user ya tiene el lock, renovar
        if (userId.equals(conv.getLockedByUserId())) {
            conv.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIMEOUT_MINUTES));
            conversationRepository.save(conv);
            log.info("🔄 Lock renovado para conversación {}, user {}", conversationId, userId);
            return true;
        }

        // Si está lockeada por otro user
        if (conv.getLockedByUserId() != null) {
            // Verificar si expiró
            if (conv.getLockedUntil() != null && LocalDateTime.now().isAfter(conv.getLockedUntil())) {
                log.info("⏰ Lock expirado para conversación {}, liberando...", conversationId);
                releaseLock(conversationId);
            } else {
                // Sigue vigente, no puedo lockear
                log.warn("🔒 Conversación {} ya está lockeada por user {}", 
                    conversationId, conv.getLockedByUserId());
                return false;
            }
        }

        // Lockear para este user
        conv.setLockedByUserId(userId);
        conv.setLockedAt(LocalDateTime.now());
        conv.setLockedUntil(LocalDateTime.now().plusMinutes(LOCK_TIMEOUT_MINUTES));
        conversationRepository.save(conv);
        log.info("🔒 Conversación {} lockeada por user {}", conversationId, userId);
        return true;
    }

    /**
     * Libera el lock de una conversación si pertenece al usuario.
     */
    @Transactional
    public void releaseLock(UUID conversationId, UUID userId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        if (userId.equals(conv.getLockedByUserId())) {
            releaseLock(conversationId);
            log.info("🔓 Lock liberado para conversación {} por user {}", conversationId, userId);
        } else {
            log.warn("⚠️ User {} intenta liberar lock que no posee en conversación {}", userId, conversationId);
        }
    }

    /**
     * Libera el lock sin verificación (uso interno).
     */
    @Transactional
    public void releaseLock(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada: " + conversationId));

        conv.setLockedByUserId(null);
        conv.setLockedAt(null);
        conv.setLockedUntil(null);
        conversationRepository.save(conv);
    }

    /**
     * Verifica si una conversación está lockeada.
     * Retorna el user que la tiene lockeada, o empty si está libre.
     */
    public Optional<UUID> checkLock(UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElse(null);

        if (conv == null || conv.getLockedByUserId() == null) {
            return Optional.empty();
        }

        // Verificar si expiró
        if (conv.getLockedUntil() != null && LocalDateTime.now().isAfter(conv.getLockedUntil())) {
            // Liberar automáticamente
            releaseLock(conversationId);
            return Optional.empty();
        }

        return Optional.of(conv.getLockedByUserId());
    }

    /**
     * Verifica si un user puede enviar a esta conversación.
     * Retorna true si: no está lockeada O está lockeada por el mismo user
     */
    public boolean canUserSendMessage(UUID conversationId, UUID userId) {
        Optional<UUID> lockedByUser = checkLock(conversationId);
        
        if (lockedByUser.isEmpty()) {
            return true; // No está lockeada
        }

        return userId.equals(lockedByUser.get()); // Solo si es el mismo user
    }

    /**
     * Limpia locks expirados (ejecutar periódicamente).
     */
    @Transactional
    public void cleanupExpiredLocks() {
        // Encontrar conversaciones con lock expirado
        conversationRepository.findAll().stream()
                .filter(conv -> conv.getLockedUntil() != null && 
                               LocalDateTime.now().isAfter(conv.getLockedUntil()))
                .forEach(conv -> {
                    log.info("🧹 Limpiando lock expirado en conversación {}", conv.getId());
                    releaseLock(conv.getId());
                });
    }
}
