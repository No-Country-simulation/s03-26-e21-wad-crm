package com.crm.module.contact.entity;

import com.crm.common.audit.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tag extends AuditableEntity {

    @Column(nullable = false)
    private String name;

    private String color;
}
