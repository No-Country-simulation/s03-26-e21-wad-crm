package com.crm.module.company.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    private String domain;

    private String industry;
}
