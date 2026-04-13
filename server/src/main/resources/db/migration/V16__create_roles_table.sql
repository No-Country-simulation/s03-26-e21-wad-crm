-- 1. Crear tabla de roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    permissions TEXT,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_roles_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    CONSTRAINT uq_roles_workspace_name UNIQUE (workspace_id, name)
);

CREATE INDEX idx_roles_workspace_id ON roles(workspace_id);
CREATE INDEX idx_roles_is_system ON roles(is_system);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- 2. Seed de roles por defecto
INSERT INTO roles (workspace_id, name, is_system)
SELECT w.id, 'ADMIN', TRUE FROM workspaces w
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.workspace_id = w.id AND r.name = 'ADMIN');

INSERT INTO roles (workspace_id, name, is_system)
SELECT w.id, 'USER', TRUE FROM workspaces w
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.workspace_id = w.id AND r.name = 'USER');

INSERT INTO roles (workspace_id, name, is_system)
SELECT w.id, 'AGENT', TRUE FROM workspaces w
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.workspace_id = w.id AND r.name = 'AGENT');

-- 3. Vincular usuarios a roles (Migración de la antigua V17 a V16)
ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

UPDATE users u SET role_id = r.id FROM roles r 
WHERE u.role = 'ADMIN' AND r.name = 'ADMIN' AND r.is_system = TRUE;

UPDATE users u SET role_id = r.id FROM roles r 
WHERE u.role = 'MANAGER' AND r.name = 'AGENT' AND r.is_system = TRUE;

-- Fallback para usuarios sin rol
UPDATE users u SET role_id = (
    SELECT r.id FROM roles r 
    WHERE r.workspace_id = u.workspace_id AND r.is_system = TRUE
    ORDER BY CASE r.name WHEN 'USER' THEN 1 WHEN 'AGENT' THEN 2 WHEN 'ADMIN' THEN 3 ELSE 4 END LIMIT 1
) WHERE u.role_id IS NULL;

-- 4. Limpieza final de la tabla users
ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users DROP COLUMN role;
CREATE INDEX idx_users_role_id ON users(role_id);