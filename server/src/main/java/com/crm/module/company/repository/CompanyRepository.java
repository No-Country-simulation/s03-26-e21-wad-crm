package com.crm.module.company.repository;

import com.crm.module.company.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    List<Company> findByWorkspaceId(UUID workspaceId);

    Optional<Company> findByWorkspaceIdAndId(UUID workspaceId, UUID id);
}
