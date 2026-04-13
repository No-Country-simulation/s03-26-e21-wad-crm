package com.crm.module.conversation.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Hilo de mensajes entre el CRM y un contacto por un canal específico.
 * Requisitos: 20.4, 21.4, 22.1, 22.4
 */
@Getter
@Setter
@Entity
@Table(name = "conversations")
public class Conversation extends AuditableEntity {

    @Column(name = "contact_id", nullable = false)
    private UUID contactId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private MessageChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ConversationStatus status = ConversationStatus.OPEN;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

<<<<<<< HEAD
    @Column(name = "locked_by")
    private UUID lockedBy;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;
=======
    /**
     * Multi-agente lock: User quien está atendiendo esta conversación (NULL = no locked)
     * Previene que múltiples agentes envíen mensajes simultáneamente
     */
    @Column(name = "locked_by_user_id")
    private UUID lockedByUserId;

    /**
     * Timestamp cuando se bloqueó (usado para timeout automático)
     */
    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    /**
     * Cuando expira el lock (después de 15 min por default)
     * Si lockedUntil < now(), el lock se libera automáticamente
     */
    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;
>>>>>>> origin/feat/startup-crm/whatsapp
}
