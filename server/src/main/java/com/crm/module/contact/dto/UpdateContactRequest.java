package com.crm.module.contact.dto;

import com.crm.module.contact.entity.ContactStatus;
import jakarta.validation.constraints.Email;

import java.util.UUID;

public record UpdateContactRequest(

        String name,

        @Email(message = "Invalid email format")
        String email,

        String phone,

        String jobTitle,

        ContactStatus status,

        UUID companyId,

        UUID assignedTo
) {}
