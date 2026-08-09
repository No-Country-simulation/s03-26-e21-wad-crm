-- V26__seed_test_users.sql
-- Seed test users with hashed passwords (BCrypt strength 10)
-- All users use password: password123

-- Get workspace ID (first workspace, usually from V1 seed or registration)
-- If no workspace exists, create default
INSERT INTO workspaces (name, slug, plan, timezone)
SELECT 'Nexo Default', 'nexo-default', 'FREE', 'UTC'
WHERE NOT EXISTS (SELECT 1 FROM workspaces WHERE slug = 'nexo-default');

-- Create roles (system roles)
INSERT INTO roles (workspace_id, name, description, permissions, is_system, is_active)
SELECT w.id, 'ADMIN', 'Administrator role', '["*"]', TRUE, TRUE
FROM workspaces w
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (
    SELECT 1 FROM roles r 
    WHERE r.workspace_id = w.id AND r.name = 'ADMIN' AND r.is_system = TRUE
  );

INSERT INTO roles (workspace_id, name, description, permissions, is_system, is_active)
SELECT w.id, 'MANAGER', 'Manager role', '["contacts:*","deals:*","tasks:*","conversations:*","analytics:read","settings:write"]', TRUE, TRUE
FROM workspaces w
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (
    SELECT 1 FROM roles r 
    WHERE r.workspace_id = w.id AND r.name = 'MANAGER' AND r.is_system = TRUE
  );

INSERT INTO roles (workspace_id, name, description, permissions, is_system, is_active)
SELECT w.id, 'AGENT', 'Agent role', '["contacts:read","conversations:*","tasks:*","appointments:*"]', TRUE, TRUE
FROM workspaces w
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (
    SELECT 1 FROM roles r 
    WHERE r.workspace_id = w.id AND r.name = 'AGENT' AND r.is_system = TRUE
  );

INSERT INTO roles (workspace_id, name, description, permissions, is_system, is_active)
SELECT w.id, 'VIEWER', 'Viewer role', '["contacts:read","conversations:read","tasks:read","appointments:read"]', TRUE, TRUE
FROM workspaces w
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (
    SELECT 1 FROM roles r 
    WHERE r.workspace_id = w.id AND r.name = 'VIEWER' AND r.is_system = TRUE
  );

-- Create test users
-- Hash: password123 with BCrypt strength 10
-- $2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO

INSERT INTO users (workspace_id, email, password_hash, name, role_id, is_active)
SELECT w.id, 'admin@nexo.com', '$2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO', 'Admin User', r.id, TRUE
FROM workspaces w
JOIN roles r ON r.workspace_id = w.id AND r.name = 'ADMIN'
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'admin@nexo.com');

INSERT INTO users (workspace_id, email, password_hash, name, role_id, is_active)
SELECT w.id, 'manager@nexo.com', '$2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO', 'Manager User', r.id, TRUE
FROM workspaces w
JOIN roles r ON r.workspace_id = w.id AND r.name = 'MANAGER'
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'manager@nexo.com');

INSERT INTO users (workspace_id, email, password_hash, name, role_id, is_active)
SELECT w.id, 'agent@nexo.com', '$2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO', 'Agent User', r.id, TRUE
FROM workspaces w
JOIN roles r ON r.workspace_id = w.id AND r.name = 'AGENT'
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'agent@nexo.com');

INSERT INTO users (workspace_id, email, password_hash, name, role_id, is_active)
SELECT w.id, 'viewer@nexo.com', '$2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO', 'Viewer User', r.id, TRUE
FROM workspaces w
JOIN roles r ON r.workspace_id = w.id AND r.name = 'VIEWER'
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'viewer@nexo.com');

INSERT INTO users (workspace_id, email, password_hash, name, role_id, is_active)
SELECT w.id, 'test@test.com', '$2a$10$dXjIr7SIUgSVvWAqJR1H.OVHoWrPJYM0H.f.KsKm8LjPoUXd2KKVO', 'Test User', r.id, TRUE
FROM workspaces w
JOIN roles r ON r.workspace_id = w.id AND r.name = 'ADMIN'
WHERE w.slug = 'nexo-default'
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'test@test.com');
