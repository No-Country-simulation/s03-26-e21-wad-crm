package com.crm.module.conversation.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mensaje individual dentro de una conversación.
 * Requisitos: 20.4, 22.2, 25.2
 */
@Getter
@Setter
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private MessageChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private MessageDirection direction;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    /** Tipo de mensaje: text, image, audio, video, document, sticker */
    @Column(name = "type")
    private String type = "text";

    /** URL del archivo multimedia (imagen, audio, video, documento) */
    @Column(name = "media_url")
    private String mediaUrl;

    /** Tipo MIME del archivo multimedia */
    @Column(name = "mime_type")
    private String mimeType;

    /** Caption o descripción del archivo multimedia */
    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption;

    /** ID externo del proveedor (Meta, Gmail Message-ID, etc.) */
    @Column(name = "external_id")
    private String externalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;
}
