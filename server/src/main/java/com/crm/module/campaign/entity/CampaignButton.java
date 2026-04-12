package com.crm.module.campaign.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "campaign_buttons")
public class CampaignButton extends AuditableEntity {

    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "button_type", nullable = false)
    private ButtonType buttonType;

    @Column(name = "label", nullable = false)
    private String label;

    @Column(name = "url")
    private String url;

    @Column(name = "whatsapp_number")
    private String whatsappNumber;

    @Column(name = "whatsapp_message", columnDefinition = "TEXT")
    private String whatsappMessage;

    @Column(name = "color")
    private String color = "#25D366";

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false)
    private ButtonPosition position;

    @Column(name = "show_on_desktop")
    private Boolean showOnDesktop = true;

    @Column(name = "show_on_mobile")
    private Boolean showOnMobile = true;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}