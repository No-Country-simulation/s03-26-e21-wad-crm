package com.crm.module.deal.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Oportunidad de venta dentro de un workspace.
 * Requisitos: 14.1–14.5, 15.1–15.4, 16.1–16.4, 17.1–17.4
 */
@Entity
@Table(name = "deals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deal extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(precision = 15, scale = 2)
    private BigDecimal value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private Stage stage;

    @Column(name = "contact_id", nullable = false)
    private UUID contactId;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;
}
