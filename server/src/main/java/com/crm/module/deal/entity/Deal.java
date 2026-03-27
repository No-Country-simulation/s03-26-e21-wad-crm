package com.crm.module.deal.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Oportunidad de venta dentro de un workspace.
 * Requisitos: 31.1–31.5
 */
@Getter
@Setter
@Entity
@Table(name = "deals")
public class Deal extends AuditableEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "value", precision = 15, scale = 2)
    private BigDecimal value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id")
    private PipelineStage stage;

    @Column(name = "contact_id")
    private UUID contactId;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "expected_close_date")
    private LocalDate expectedCloseDate;

    @Column(name = "is_deleted")
    private boolean deleted = false;
}
