package com.crm.module.contact.dto;

import com.crm.module.contact.entity.ContactStatus;

import java.util.List;
import java.util.UUID;

public record ContactFilterRequest(

        ContactStatus status,

        List<UUID> tagIds,

        UUID assignedTo,

        String search,

        String sort
) {}
