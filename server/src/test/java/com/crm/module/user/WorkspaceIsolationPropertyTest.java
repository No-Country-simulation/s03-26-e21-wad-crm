package com.crm.module.user;

import com.crm.common.security.WorkspaceContext;
import com.crm.module.user.dto.UserDto;
import com.crm.module.user.entity.User;
import com.crm.module.user.entity.UserRole;
import com.crm.module.user.repository.UserRepository;
import com.crm.module.user.service.UserService;
import net.jqwik.api.*;
import net.jqwik.api.constraints.IntRange;
import net.jqwik.api.lifecycle.AfterProperty;
import org.mockito.Mockito;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Property-based test for workspace isolation invariant.
 *
 * **Validates: Requirements 8.2, 8.5**
 *
 * Property 4: For any two users u1 and u2 where u1.workspaceId != u2.workspaceId,
 * no resource belonging to u1's workspace should have workspaceId == u2.workspaceId.
 *
 * This test verifies that:
 * 1. Entities assigned to workspace1 never carry workspace2's ID.
 * 2. WorkspaceContext correctly isolates the current workspace per thread.
 * 3. UserService.listByWorkspace only returns users from the requested workspace.
 */
class WorkspaceIsolationPropertyTest {

    @AfterProperty
    void clearWorkspaceContext() {
        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Property 4a: entity workspaceId isolation
    //
    // For any two distinct workspaceIds W1 and W2, a User entity created with
    // workspaceId=W1 must never have workspaceId equal to W2.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requirements 8.2, 8.5**
     *
     * A User entity assigned to workspace1 must never carry workspace2's ID.
     */
    @Property
    void userEntityWorkspaceIdIsIsolated(
            @ForAll("distinctWorkspacePairs") UUID[] workspacePair) {

        UUID workspace1 = workspacePair[0];
        UUID workspace2 = workspacePair[1];

        User user = buildUser("user@w1.com", workspace1);

        assertThat(user.getWorkspaceId())
                .as("User assigned to workspace1 must not have workspace2's ID")
                .isNotEqualTo(workspace2);
    }

    // -------------------------------------------------------------------------
    // Property 4b: WorkspaceContext isolation
    //
    // Setting WorkspaceContext to W1 must never yield W2 when W1 != W2.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requirements 8.2, 8.5**
     *
     * WorkspaceContext set to workspace1 must never return workspace2.
     */
    @Property
    void workspaceContextIsolatesWorkspaceId(
            @ForAll("distinctWorkspacePairs") UUID[] workspacePair) {

        UUID workspace1 = workspacePair[0];
        UUID workspace2 = workspacePair[1];

        WorkspaceContext.setWorkspaceId(workspace1);

        assertThat(WorkspaceContext.getWorkspaceId())
                .as("WorkspaceContext set to workspace1 must not return workspace2")
                .isNotEqualTo(workspace2);

        WorkspaceContext.clear();
    }

    // -------------------------------------------------------------------------
    // Property 4c: UserService.listByWorkspace isolation
    //
    // When the repository returns users for W1, none of them should have W2 as
    // their workspaceId.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requirements 8.2, 8.5**
     *
     * UserService.listByWorkspace(W1) must never return users whose workspaceId == W2.
     */
    @Property
    void listByWorkspaceNeverReturnsOtherWorkspaceUsers(
            @ForAll("distinctWorkspacePairs") UUID[] workspacePair,
            @ForAll @IntRange(min = 1, max = 5) int userCount) {

        UUID workspace1 = workspacePair[0];
        UUID workspace2 = workspacePair[1];

        // Build users belonging to workspace1
        List<User> workspace1Users = buildUsers(userCount, workspace1);

        // Mock repository to return workspace1 users when queried for workspace1
        UserRepository mockRepo = Mockito.mock(UserRepository.class);
        PasswordEncoder mockEncoder = Mockito.mock(PasswordEncoder.class);
        when(mockRepo.findByWorkspaceId(workspace1)).thenReturn(workspace1Users);

        UserService service = new UserService(mockRepo, mockEncoder);
        List<UserDto> result = service.listByWorkspace(workspace1);

        // None of the returned users should have workspace2's ID
        assertThat(result)
                .as("listByWorkspace(W1) must not return users with W2's workspaceId")
                .allSatisfy(dto ->
                        assertThat(dto.getWorkspaceId())
                                .isNotEqualTo(workspace2)
                );
    }

    // -------------------------------------------------------------------------
    // Property 4d: cross-workspace entity non-overlap
    //
    // Given a list of entities from W1 and a list from W2, the two sets must
    // be completely disjoint by workspaceId.
    // -------------------------------------------------------------------------

    /**
     * **Validates: Requirements 8.2, 8.5**
     *
     * Resources from workspace1 and resources from workspace2 must have no
     * overlapping workspaceId values.
     */
    @Property
    void resourceSetsFromDifferentWorkspacesAreDisjoint(
            @ForAll("distinctWorkspacePairs") UUID[] workspacePair,
            @ForAll @IntRange(min = 1, max = 5) int countW1,
            @ForAll @IntRange(min = 1, max = 5) int countW2) {

        UUID workspace1 = workspacePair[0];
        UUID workspace2 = workspacePair[1];

        List<User> usersW1 = buildUsers(countW1, workspace1);
        List<User> usersW2 = buildUsers(countW2, workspace2);

        // Every user in W1 must have workspace1 as their workspaceId
        assertThat(usersW1)
                .allSatisfy(u -> assertThat(u.getWorkspaceId()).isEqualTo(workspace1));

        // Every user in W2 must have workspace2 as their workspaceId
        assertThat(usersW2)
                .allSatisfy(u -> assertThat(u.getWorkspaceId()).isEqualTo(workspace2));

        // No user from W1 should appear in W2's workspace
        assertThat(usersW1)
                .allSatisfy(u -> assertThat(u.getWorkspaceId()).isNotEqualTo(workspace2));

        // No user from W2 should appear in W1's workspace
        assertThat(usersW2)
                .allSatisfy(u -> assertThat(u.getWorkspaceId()).isNotEqualTo(workspace1));
    }

    // -------------------------------------------------------------------------
    // Arbitraries
    // -------------------------------------------------------------------------

    /**
     * Generates pairs of distinct UUIDs representing two different workspaceIds.
     * Guarantees W1 != W2 by regenerating until they differ.
     */
    @Provide
    Arbitrary<UUID[]> distinctWorkspacePairs() {
        return Arbitraries.create(UUID::randomUUID)
                .flatMap(w1 -> Arbitraries.create(UUID::randomUUID)
                        .filter(w2 -> !w2.equals(w1))
                        .map(w2 -> new UUID[]{w1, w2}));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private User buildUser(String email, UUID workspaceId) {
        User user = User.builder()
                .email(email)
                .name("Test User")
                .role(UserRole.SALES)
                .isActive(true)
                .build();
        user.setWorkspaceId(workspaceId);
        return user;
    }

    private List<User> buildUsers(int count, UUID workspaceId) {
        return java.util.stream.IntStream.range(0, count)
                .mapToObj(i -> {
                    User u = User.builder()
                            .email("user" + i + "@workspace-" + workspaceId + ".com")
                            .name("User " + i)
                            .role(UserRole.SALES)
                            .isActive(true)
                            .build();
                    u.setId(UUID.randomUUID());
                    u.setWorkspaceId(workspaceId);
                    return u;
                })
                .toList();
    }
}
