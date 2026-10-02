-- HENU MAIL Migration 09: System Permissions, Standard Role Templates & RBAC Seed Mappings
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. SEED SYSTEM PERMISSIONS
INSERT INTO public.permissions (key, description, category) VALUES
    ('organization:manage', 'Full organization deletion, billing, and root configuration', 'admin'),
    ('system_settings:edit', 'Configure legal branding, deliverability limits, and policy URLs', 'admin'),
    ('team:manage', 'Invite, modify, and remove workspace members and assign roles', 'team'),
    ('team:view', 'View workspace member rosters and role assignments', 'team'),
    ('email_accounts:manage', 'Connect, authenticate, and disconnect sending email accounts', 'infrastructure'),
    ('email_accounts:view', 'View connected email account status and health metrics', 'infrastructure'),
    ('campaigns:create', 'Author and construct sequence campaigns and A/B variants', 'campaigns'),
    ('campaigns:edit', 'Modify draft campaigns and sequence schedule parameters', 'campaigns'),
    ('campaigns:control', 'Execute real-time controls (PAUSE, RESUME, STOP, ABORT)', 'campaigns'),
    ('campaigns:view', 'View campaign schedules, progress, and performance tables', 'campaigns'),
    ('contacts:import', 'Upload and map CSV contact batches with suppression scrub', 'contacts'),
    ('contacts:export', 'Export contact records and lead intelligence to CSV', 'contacts'),
    ('contacts:manage', 'Create, update, tag, and organize contacts and custom fields', 'contacts'),
    ('contacts:view', 'View contact lists, engagement scores, and metadata', 'contacts'),
    ('templates:manage', 'Create, version, and edit email templates and service catalogs', 'templates'),
    ('templates:view', 'View email template library and pre-built service assets', 'templates'),
    ('inbox:reply', 'Compose and dispatch direct replies in unified outreach inbox', 'inbox'),
    ('inbox:view', 'Read inbound prospect replies and sentiment classifications', 'inbox'),
    ('suppression:manage', 'Add, import, and remove global bounce and unsubscribe blocks', 'compliance'),
    ('suppression:view', 'View global suppression lists and blacklist records', 'compliance'),
    ('analytics:view', 'Access deliverability telemetry, conversion charts, and stats', 'analytics'),
    ('audit_logs:view', 'Examine immutable administrative and security audit trail', 'security')
ON CONFLICT (key) DO UPDATE 
SET description = EXCLUDED.description, category = EXCLUDED.category;

-- 2. SEED SYSTEM GLOBAL ROLES (workspace_id = NULL means default system template)
INSERT INTO public.roles (id, workspace_id, name, description, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'Owner', 'Organization founder with absolute authority over workspace', TRUE),
    ('00000000-0000-0000-0000-000000000002', NULL, 'Super Admin', 'Platform administrator with full configuration and governance rights', TRUE),
    ('00000000-0000-0000-0000-000000000003', NULL, 'Admin', 'Workspace administrator managing team, campaigns, and infrastructure', TRUE),
    ('00000000-0000-0000-0000-000000000004', NULL, 'Campaign Manager', 'Outreach architect responsible for campaign creation and audience management', TRUE),
    ('00000000-0000-0000-0000-000000000005', NULL, 'Outreach Manager', 'Sales representative managing live sequence dispatches and inbox replies', TRUE),
    ('00000000-0000-0000-0000-000000000006', NULL, 'Analyst', 'Growth specialist analyzing deliverability reports and conversion telemetry', TRUE),
    ('00000000-0000-0000-0000-000000000007', NULL, 'Viewer', 'Read-only stakeholder reviewing campaign performance summaries', TRUE)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, is_system = EXCLUDED.is_system;

-- 3. SEED ROLE PERMISSION MAPPINGS

-- Owner (All Permissions)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- Super Admin (All except organization:manage)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000002', id FROM public.permissions
WHERE key != 'organization:manage'
ON CONFLICT DO NOTHING;

-- Admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000003', id FROM public.permissions
WHERE key NOT IN ('organization:manage', 'system_settings:edit')
ON CONFLICT DO NOTHING;

-- Campaign Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000004', id FROM public.permissions
WHERE key IN (
    'campaigns:create', 'campaigns:edit', 'campaigns:control', 'campaigns:view',
    'contacts:import', 'contacts:manage', 'contacts:view',
    'templates:manage', 'templates:view',
    'inbox:reply', 'inbox:view',
    'suppression:manage', 'suppression:view',
    'analytics:view', 'team:view', 'email_accounts:view'
)
ON CONFLICT DO NOTHING;

-- Outreach Manager
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000005', id FROM public.permissions
WHERE key IN (
    'campaigns:control', 'campaigns:view',
    'contacts:view', 'templates:view',
    'inbox:reply', 'inbox:view',
    'suppression:view', 'analytics:view'
)
ON CONFLICT DO NOTHING;

-- Analyst
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000006', id FROM public.permissions
WHERE key IN (
    'campaigns:view', 'contacts:view', 'templates:view', 'analytics:view'
)
ON CONFLICT DO NOTHING;

-- Viewer
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000007', id FROM public.permissions
WHERE key IN (
    'campaigns:view', 'contacts:view', 'analytics:view'
)
ON CONFLICT DO NOTHING;
