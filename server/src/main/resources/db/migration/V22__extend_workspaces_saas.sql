-- V22: Extend workspaces for SaaS multi-tenant

ALTER TABLE workspaces ADD COLUMN plan VARCHAR(20) DEFAULT 'STARTER' CHECK (plan IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM'));
ALTER TABLE workspaces ADD COLUMN status VARCHAR(20) DEFAULT 'TRIAL' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TRIAL', 'PAST_DUE'));
ALTER TABLE workspaces ADD COLUMN trial_ends_at TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN subscription_ends_at TIMESTAMPTZ;
ALTER TABLE workspaces ADD COLUMN stripe_customer_id VARCHAR(100);
ALTER TABLE workspaces ADD COLUMN custom_domain VARCHAR(255);
ALTER TABLE workspaces ADD COLUMN max_agents INTEGER DEFAULT 3;
ALTER TABLE workspaces ADD COLUMN max_contacts INTEGER DEFAULT 1000;
ALTER TABLE workspaces ADD COLUMN primary_color VARCHAR(20) DEFAULT '#2563EB';

CREATE INDEX idx_workspaces_plan ON workspaces(plan);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);