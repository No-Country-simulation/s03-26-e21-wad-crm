package com.crm.module.user.entity;

/**
 * User roles for RBAC (Role-Based Access Control)
 * 
 * - ADMIN: Full access to all features (Send, Templates, Config, CRM, Logs)
 * - AGENT: Can send WhatsApp messages, read conversations
 * - USER: Can read conversations only (no send)
 * - VIEWER: Read-only access (no send, read-only conversations)
 * - MANAGER: (legacy, not used in WhatsApp module)
 * - SALES: (legacy, not used in WhatsApp module)
 */
public enum UserRole {
    ADMIN,      // Full access
    AGENT,      // Can send messages + read conversations
    USER,       // Can read conversations only
    VIEWER,     // Read-only access
    MANAGER,    // Legacy role
    SALES       // Legacy role
}
