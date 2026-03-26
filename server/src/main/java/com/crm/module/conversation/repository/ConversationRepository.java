package com.crm.module.conversation.repository;

import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositorio de conversaciones.
 * Requisitos: 20.4, 21.4, 22.1, 22.4
 */
@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    /** findOrCreate: buscar conversación activa por contactId + channel dentro del workspace. Req 21.4 */
    Optional<Conversation> findByWorkspaceIdAndContactIdAndChannel(
            UUID workspaceId, UUID contactId, MessageChannel channel);

    /** Listar conversaciones del workspace ordenadas por lastMessageAt desc. Req 22.4 */
    Page<Conversation> findByWorkspaceIdOrderByLastMessageAtDesc(UUID workspaceId, Pageable pageable);

    /** Verificar pertenencia al workspace antes de retornar (evita exponer recursos de otro workspace). Req 8.3, 22.3 */
    Optional<Conversation> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
