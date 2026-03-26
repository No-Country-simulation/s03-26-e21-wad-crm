package com.crm.module.company.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Empresa asociada a contactos del workspace.
 * Requisito: 9.4
 */
@Getter
@Setter
@Entity
@Table(name = "companies")
public class Company extends AuditableEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "domain")
    private String domain;

    @Column(name = "industry")
    private String industry;
}
