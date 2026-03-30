package com.crm.module.deal.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "pipeline_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stage extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "position", nullable = false)
    private int order;

    @Column(name = "is_won", nullable = false)
    @Builder.Default
    private boolean isWon = false;

    @Column(name = "is_lost", nullable = false)
    @Builder.Default
    private boolean isLost = false;

    @Column(name = "pipeline_id", nullable = false)
    private UUID pipelineId;
}
