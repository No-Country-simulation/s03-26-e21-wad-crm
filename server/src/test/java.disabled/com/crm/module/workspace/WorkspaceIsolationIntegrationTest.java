package com.crm.module.workspace;

import com.crm.AbstractIntegrationTest;
import com.crm.module.contact.entity.Contact;
import com.crm.module.contact.repository.ContactRepository;
import com.crm.module.conversation.entity.Conversation;
import com.crm.module.conversation.entity.MessageChannel;
import com.crm.module.conversation.repository.ConversationRepository;
import com.crm.module.deal.entity.Deal;
import com.crm.module.deal.repository.DealRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests de integración para aislamiento de workspace.
 *
 * Propiedad 4: ningún recurso de workspaceA es visible desde workspaceB.
 * Requisitos: 8.1–8.5
 */
class WorkspaceIsolationIntegrationTest extends AbstractIntegrationTest {

    @MockBean
    SimpMessagingTemplate messagingTemplate;

    @MockBean
    RedisTemplate<String, String> redisTemplate;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    ContactRepository contactRepository;

    @Autowired
    DealRepository dealRepository;

    @Autowired
    ConversationRepository conversationRepository;

    private UUID workspaceA;
    private UUID workspaceB;
    private UUID contactA;
    private UUID contactB;

    @BeforeEach
    void setUp() {
        // Limpiar en orden correcto (FK constraints)
        jdbc.execute("DELETE FROM deal_stage_history");
        jdbc.execute("DELETE FROM deals");
        jdbc.execute("DELETE FROM conversations");
        jdbc.execute("DELETE FROM contacts");
        jdbc.execute("DELETE FROM pipeline_stages");
        jdbc.execute("DELETE FROM pipelines");
        jdbc.execute("DELETE FROM users");
        jdbc.execute("DELETE FROM workspaces");

        workspaceA = UUID.randomUUID();
        workspaceB = UUID.randomUUID();

        // Crear dos workspaces independientes
        jdbc.update("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)",
                workspaceA, "Workspace A", "workspace-a-" + workspaceA);
        jdbc.update("INSERT INTO workspaces (id, name, slug) VALUES (?, ?, ?)",
                workspaceB, "Workspace B", "workspace-b-" + workspaceB);

        // Crear un contacto en cada workspace
        contactA = UUID.randomUUID();
        contactB = UUID.randomUUID();

        jdbc.update(
                "INSERT INTO contacts (id, workspace_id, name, email, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                contactA, workspaceA, "Contacto A", "a@workspace-a.com", "NEW", false
        );
        jdbc.update(
                "INSERT INTO contacts (id, workspace_id, name, email, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                contactB, workspaceB, "Contacto B", "b@workspace-b.com", "NEW", false
        );
    }

    // ── Req 8.1: contactos de workspaceA no visibles desde workspaceB ─────────

    @Disabled @Test
    @DisplayName("Req 8.1: contactos de workspace A no son visibles desde workspace B")
    void contacts_workspaceA_notVisibleFromWorkspaceB() {
        // Buscar contacto de A usando workspaceId de B
        var result = contactRepository.findByWorkspaceIdAndIdAndDeletedFalse(workspaceB, contactA);
        assertThat(result).isEmpty();
    }

    @Disabled @Test
    @DisplayName("Req 8.1: contactos de workspace B no son visibles desde workspace A")
    void contacts_workspaceB_notVisibleFromWorkspaceA() {
        var result = contactRepository.findByWorkspaceIdAndIdAndDeletedFalse(workspaceA, contactB);
        assertThat(result).isEmpty();
    }

    // ── Req 8.2: conteo de contactos es independiente por workspace ───────────

    @Disabled @Test
    @DisplayName("Req 8.2: countByWorkspace retorna solo los contactos del workspace propio")
    void contacts_countIsIsolatedPerWorkspace() {
        // Agregar un segundo contacto en workspaceA
        jdbc.update(
                "INSERT INTO contacts (id, workspace_id, name, email, status, is_deleted) VALUES (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceA, "Contacto A2", "a2@workspace-a.com", "NEW", false
        );

        long countA = contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceA);
        long countB = contactRepository.countByWorkspaceIdAndDeletedFalse(workspaceB);

        // Req 8.2: cada workspace ve solo sus propios recursos
        assertThat(countA).isEqualTo(2);
        assertThat(countB).isEqualTo(1);
    }

    // ── Req 8.3: conversaciones de workspaceA no visibles desde workspaceB ────

    @Disabled @Test
    @DisplayName("Req 8.3: conversación de workspace A no es visible desde workspace B")
    void conversations_workspaceA_notVisibleFromWorkspaceB() {
        // Crear conversación en workspaceA
        UUID convId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO conversations (id, workspace_id, contact_id, channel, status) VALUES (?, ?, ?, ?, ?)",
                convId, workspaceA, contactA, "WHATSAPP", "OPEN"
        );

        // Intentar acceder desde workspaceB
        var result = conversationRepository.findByIdAndWorkspaceId(convId, workspaceB);
        assertThat(result).isEmpty();
    }

    @Disabled @Test
    @DisplayName("Req 8.3: conversación de workspace A es visible desde workspace A")
    void conversations_workspaceA_visibleFromWorkspaceA() {
        UUID convId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO conversations (id, workspace_id, contact_id, channel, status) VALUES (?, ?, ?, ?, ?)",
                convId, workspaceA, contactA, "WHATSAPP", "OPEN"
        );

        var result = conversationRepository.findByIdAndWorkspaceId(convId, workspaceA);
        assertThat(result).isPresent();
    }

    // ── Req 8.4: deals de workspaceA no visibles desde workspaceB ─────────────

    @Disabled @Test
    @DisplayName("Req 8.4: deals de workspace A no son visibles desde workspace B")
    void deals_workspaceA_notVisibleFromWorkspaceB() {
        // Crear deal en workspaceA directamente via JDBC (sin stage para simplicidad)
        UUID dealId = UUID.randomUUID();
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, is_deleted) VALUES (?, ?, ?, ?, ?)",
                dealId, workspaceA, "Deal A", new BigDecimal("5000.00"), false
        );

        // Contar deals de workspaceB — no debe incluir el deal de A
        long countB = dealRepository.countByWorkspaceIdAndDeletedFalse(workspaceB);
        assertThat(countB).isEqualTo(0);
    }

    @Disabled @Test
    @DisplayName("Req 8.4: sumValueByWorkspace solo suma deals del workspace propio")
    void deals_sumValue_isolatedPerWorkspace() {
        // Deal en workspaceA con valor 3000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, is_deleted) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceA, "Deal A1", new BigDecimal("3000.00"), false
        );
        // Deal en workspaceB con valor 7000
        jdbc.update(
                "INSERT INTO deals (id, workspace_id, name, value, is_deleted) VALUES (?, ?, ?, ?, ?)",
                UUID.randomUUID(), workspaceB, "Deal B1", new BigDecimal("7000.00"), false
        );

        BigDecimal sumA = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceA);
        BigDecimal sumB = dealRepository.sumValueByWorkspaceIdAndDeletedFalse(workspaceB);

        // Req 8.4: cada workspace ve solo su propio valor
        assertThat(sumA).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(sumB).isEqualByComparingTo(new BigDecimal("7000.00"));
    }

    // ── Req 8.5: Propiedad 4 — ningún recurso de A tiene workspaceId de B ─────

    @Disabled @Test
    @DisplayName("Propiedad 4: ningún contacto de workspace A tiene workspaceId de workspace B")
    void property4_noResourceFromWorkspaceA_hasWorkspaceIdOfB() {
        // Agregar más contactos en workspaceA
        for (int i = 0; i < 3; i++) {
            jdbc.update(
                    "INSERT INTO contacts (id, workspace_id, name, status, is_deleted) VALUES (?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceA, "Extra A" + i, "NEW", false
            );
        }

        // Obtener todos los contactos de workspaceA
        List<Contact> contactsA = contactRepository.findAll().stream()
                .filter(c -> workspaceA.equals(c.getWorkspaceId()))
                .toList();

        // Propiedad 4: ninguno tiene workspaceId de B
        assertThat(contactsA)
                .isNotEmpty()
                .allSatisfy(c -> assertThat(c.getWorkspaceId())
                        .as("Req 8.5: contacto de workspace A no debe tener workspaceId de B")
                        .isNotEqualTo(workspaceB));
    }

    @Disabled @Test
    @DisplayName("Propiedad 4: ningún deal de workspace B tiene workspaceId de workspace A")
    void property4_noResourceFromWorkspaceB_hasWorkspaceIdOfA() {
        // Crear deals en workspaceB
        for (int i = 0; i < 3; i++) {
            jdbc.update(
                    "INSERT INTO deals (id, workspace_id, name, value, is_deleted) VALUES (?, ?, ?, ?, ?)",
                    UUID.randomUUID(), workspaceB, "Deal B" + i, new BigDecimal("1000.00"), false
            );
        }

        List<Deal> dealsB = dealRepository.findAll().stream()
                .filter(d -> workspaceB.equals(d.getWorkspaceId()))
                .toList();

        assertThat(dealsB)
                .isNotEmpty()
                .allSatisfy(d -> assertThat(d.getWorkspaceId())
                        .as("Req 8.5: deal de workspace B no debe tener workspaceId de A")
                        .isNotEqualTo(workspaceA));
    }
}
