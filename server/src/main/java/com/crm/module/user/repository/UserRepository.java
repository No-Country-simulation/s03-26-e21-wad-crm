package com.crm.module.user.repository;

import com.crm.module.user.entity.User;
import com.crm.module.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    List<User> findByWorkspaceId(UUID workspaceId);

    boolean existsByEmail(String email);

    long countByWorkspaceIdAndRoleAndIsActiveTrue(UUID workspaceId, UserRole role);
}
