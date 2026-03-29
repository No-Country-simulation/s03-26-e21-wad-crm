package com.crm.module.contact.entity;

import com.crm.common.audit.AuditableEntity;
import com.crm.module.company.entity.Company;
import com.crm.module.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "contacts",
    uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "email"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    private String email;

    private String phone;

    @Column(name = "job_title")
    private String jobTitle;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContactStatus status = ContactStatus.NEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "contact_tags",
        joinColumns = @JoinColumn(name = "contact_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    /** Convenience accessor used by services that only need the company FK. */
    public java.util.UUID getCompanyId() {
        return company != null ? company.getId() : null;
    }
}
