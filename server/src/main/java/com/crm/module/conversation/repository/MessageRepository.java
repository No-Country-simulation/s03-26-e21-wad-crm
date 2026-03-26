package com.crm.module.conversation.repository;

import com.crm.module.conversation.entity.Message;
import com.crm.module.conversation.entity.MessageChannel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de mensajes.
 * Requisitos: 20.4, 21.4, 22.1, 22.2
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /** Mensajes de una conversación ordenados por sentAt asc con paginación. Req 22.1 */
    Page<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId, Pageable pageable);

    /** Mensajes de una conversación filtrados por workspace, ordenados por sentAt asc. Req 22.1, 22.3 */
    Page<Message> findByConversationIdAndWorkspaceIdOrderBySentAtAsc(
            UUID conversationId, UUID workspaceId, Pageable pageable);

    /** Idempotencia: verificar externalId antes de insertar para evitar duplicados. Req 20.4 */
    Optional<Message> findByExternalIdAndChannel(String externalId, MessageChannel channel);

    /** Verificar pertenencia al workspace. Req 8.3 */
    boolean existsByConversationIdAndWorkspaceId(UUID conversationId, UUID workspaceId);
}
