-- Add role_id foreign key to users table
-- This allows linking users to roles with full RBAC flexibility

-- Step 1: Add role_id column to users table (nullable initially)
ALTER TABLE users
ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Step 2: For existing ADMIN users, find and link to ADMIN role
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role = 'ADMIN'
  AND r.name = 'ADMIN'
  AND r.is_system = TRUE;

-- Step 2b: For MANAGER users, link to AGENT role
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role = 'MANAGER'
  AND r.name = 'AGENT'
  AND r.is_system = TRUE;

-- Step 3: For other users, assign USER role as default
UPDATE users u
SET role_id = r.id
FROM roles r
WHERE u.role_id IS NULL
  AND r.name = 'USER'
  AND r.is_system = TRUE;

-- Step 4: Make role_id NOT NULL (all users now have a role)
ALTER TABLE users
ALTER COLUMN role_id SET NOT NULL;

-- Step 5: Drop old role column and check constraint
ALTER TABLE users
DROP CONSTRAINT users_role_check;

ALTER TABLE users
DROP COLUMN role;

-- Step 6: Create index on role_id for performance
CREATE INDEX idx_users_role_id ON users(role_id);
