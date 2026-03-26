package com.crm.common.security;

import java.util.UUID;

/**
 * ThreadLocal holder for workspace_id and role extracted from the JWT.
 * Must call {@link #clear()} after each request to avoid memory leaks.
 */
public final class WorkspaceContext {

    private static final ThreadLocal<UUID> WORKSPACE_ID = new ThreadLocal<>();
    private static final ThreadLocal<String> ROLE = new ThreadLocal<>();

    private WorkspaceContext() {}

    public static void setWorkspaceId(UUID workspaceId) {
        WORKSPACE_ID.set(workspaceId);
    }

    public static UUID getWorkspaceId() {
        return WORKSPACE_ID.get();
    }

    public static void setRole(String role) {
        ROLE.set(role);
    }

    public static String getRole() {
        return ROLE.get();
    }

    public static void clear() {
        WORKSPACE_ID.remove();
        ROLE.remove();
    }
}
