package com.crm.module.workspace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workspaces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String slug;

    private String timezone;

    private String plan;

    @Enumerated(EnumType.STRING)
    private WorkspaceStatus status;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "subscription_ends_at")
    private LocalDateTime subscriptionEndsAt;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Column(name = "custom_domain")
    private String customDomain;

    @Column(name = "max_agents")
    private Integer maxAgents = 3;

    @Column(name = "max_contacts")
    private Integer maxContacts = 1000;

    @Column(name = "primary_color")
    private String primaryColor = "#2563EB";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
