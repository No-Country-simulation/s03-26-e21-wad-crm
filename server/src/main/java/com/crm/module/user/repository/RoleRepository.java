package com.crm.module.user.repository;

import com.crm.module.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Role entity
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    
    /**
     * Find all roles in a workspace
     */
    List<Role> findByWorkspaceIdAndIsActiveTrue(UUID workspaceId);
    
    /**
     * Find a role by name in a workspace
     */
    Optional<Role> findByWorkspaceIdAndNameAndIsActiveTrue(UUID workspaceId, String name);
    
    /**
     * Find a role by ID and workspace
     */
    Optional<Role> findByIdAndWorkspaceId(UUID id, UUID workspaceId);
}
