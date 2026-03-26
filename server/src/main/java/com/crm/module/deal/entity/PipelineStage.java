package com.crm.module.deal.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Etapa del pipeline de ventas.
 * Requisitos: 31.2
 */
@Getter
@Setter
@Entity
@Table(name = "pipeline_stages")
public class PipelineStage extends AuditableEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "color")
    private String color;

    @Column(name = "position")
    private int position;

    @Column(name = "is_won")
    private boolean isWon = false;

    @Column(name = "is_lost")
    private boolean isLost = false;
}
