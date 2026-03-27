package com.crm.module.contact.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Registro de lead o cliente dentro de un workspace.
 * Requisitos: 9.1, 9.4, 8.4
 */
@Getter
@Setter
@Entity
@Table(name = "contacts")
public class Contact extends AuditableEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "job_title")
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ContactStatus status = ContactStatus.NEW;

    @Column(name = "company_id")
    private UUID companyId;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "is_deleted")
    private boolean deleted = false;
}
