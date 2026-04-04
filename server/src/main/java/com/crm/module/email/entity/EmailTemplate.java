package com.crm.module.email.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "email_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    @Builder.Default
    private TemplateCategory category = TemplateCategory.CUSTOM;

    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_default")
    @Builder.Default
    private boolean defaultTemplate = false;

    public enum TemplateCategory {
        WELCOME,
        FOLLOW_UP,
        PROPOSAL,
        CLOSING,
        MEETING,
        CUSTOM
    }
}
