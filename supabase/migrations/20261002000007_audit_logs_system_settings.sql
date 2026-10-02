-- HENU MAIL Migration 07: Audit Logs & System Governance Settings
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. AUDIT LOGS (Immutable Administrative Security Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SYSTEM SETTINGS (Workspace & Global Governance Defaults)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL DEFAULT 'HENU OS Private Limited',
    platform_name TEXT NOT NULL DEFAULT 'HENU MAIL',
    support_email TEXT NOT NULL DEFAULT 'support@henuos.com',
    privacy_policy_url TEXT NOT NULL DEFAULT '/privacy',
    terms_url TEXT NOT NULL DEFAULT '/terms',
    email_policy_url TEXT NOT NULL DEFAULT '/email-policy',
    default_daily_limit INTEGER NOT NULL DEFAULT 200 CHECK (default_daily_limit > 0),
    warmup_default_increment INTEGER NOT NULL DEFAULT 5 CHECK (warmup_default_increment > 0),
    custom_branding JSONB NOT NULL DEFAULT '{"footerNote": "Precision outreach engineering by HENU OS Private Limited"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id)
);
