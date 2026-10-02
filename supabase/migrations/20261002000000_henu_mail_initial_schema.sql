-- HENU MAIL: PostgreSQL Initial Production Schema & RLS Security
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'owner',
        'super_admin',
        'admin',
        'campaign_manager',
        'outreach_manager',
        'analyst',
        'viewer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM (
        'draft',
        'scheduled',
        'running',
        'paused',
        'completed',
        'aborted'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE email_event_type AS ENUM (
        'queued',
        'sent',
        'delivered',
        'opened',
        'clicked',
        'replied',
        'soft_bounce',
        'hard_bounce',
        'failed',
        'unsubscribed',
        'spam_complaint'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE suppression_reason AS ENUM (
        'manual_unsubscribe',
        'hard_bounce',
        'repeated_soft_bounce',
        'spam_complaint',
        'manual_admin',
        'domain_blacklist'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. WORKSPACES (Tenancy)
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. USERS & WORKSPACE MEMBERSHIPS (RBAC)
CREATE TABLE IF NOT EXISTS public.users_workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, user_id)
);

-- 5. SYSTEM SETTINGS (Legal, Branding, Deliverability Defaults)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL DEFAULT 'HENU OS Private Limited',
    platform_name TEXT NOT NULL DEFAULT 'HENU MAIL',
    support_email TEXT NOT NULL DEFAULT 'support@henuos.com',
    privacy_policy_url TEXT DEFAULT '/privacy',
    terms_url TEXT DEFAULT '/terms',
    email_policy_url TEXT DEFAULT '/email-policy',
    default_daily_limit INTEGER NOT NULL DEFAULT 200,
    warmup_default_increment INTEGER NOT NULL DEFAULT 5,
    custom_branding JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id)
);

-- 6. EMAIL ACCOUNTS (Connected Senders)
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    display_name TEXT NOT NULL,
    provider_type TEXT NOT NULL, -- 'google_oauth', 'microsoft_oauth', 'custom_smtp'
    auth_credentials_encrypted TEXT, -- AES-256 encrypted payload
    daily_limit INTEGER NOT NULL DEFAULT 200,
    sent_today INTEGER NOT NULL DEFAULT 0,
    warmup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    warmup_stage INTEGER NOT NULL DEFAULT 1,
    health_score INTEGER NOT NULL DEFAULT 100, -- 0-100 score
    spf_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dkim_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dmarc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mx_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'error', 'disconnected'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    job_title TEXT,
    phone TEXT,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced', 'suppressed'
    engagement_score INTEGER NOT NULL DEFAULT 50, -- 0-100
    soft_bounce_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, email)
);

-- 8. SEGMENTS
CREATE TABLE IF NOT EXISTS public.segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    filter_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_dynamic BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TEMPLATES
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    category TEXT DEFAULT 'general',
    is_service_catalog BOOLEAN NOT NULL DEFAULT FALSE,
    variables TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status campaign_status NOT NULL DEFAULT 'draft',
    segment_id UUID REFERENCES public.segments(id) ON DELETE SET NULL,
    assigned_email_account_ids UUID[] DEFAULT '{}',
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    schedule_config JSONB NOT NULL DEFAULT '{"timezone":"UTC","days":["Mon","Tue","Wed","Thu","Fri"],"hours":{"start":9,"end":17}}'::jsonb,
    stop_on_reply BOOLEAN NOT NULL DEFAULT TRUE,
    track_opens BOOLEAN NOT NULL DEFAULT TRUE,
    track_clicks BOOLEAN NOT NULL DEFAULT TRUE,
    total_leads INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    open_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    bounce_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CAMPAIGN LEADS
CREATE TABLE IF NOT EXISTS public.campaign_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    current_step INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_sequence', 'replied', 'unsubscribed', 'bounced', 'completed'
    tracking_id UUID NOT NULL DEFAULT gen_random_uuid(),
    last_event_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, contact_id)
);

-- 12. EMAIL QUEUE
CREATE TABLE IF NOT EXISTS public.email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.campaign_leads(id) ON DELETE CASCADE,
    email_account_id UUID NOT NULL REFERENCES public.email_accounts(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'sent', 'failed', 'cancelled'
    attempts INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    idempotency_key TEXT NOT NULL UNIQUE,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. EMAIL LOGS (Immutable Event Stream)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.campaign_leads(id) ON DELETE SET NULL,
    email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    event_type email_event_type NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SUPPRESSION LIST
CREATE TABLE IF NOT EXISTS public.suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT,
    domain TEXT,
    reason suppression_reason NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_suppression_target CHECK (email IS NOT NULL OR domain IS NOT NULL)
);

-- 15. AUDIT LOGS (Immutable Security Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_id UUID,
    actor_email TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    payload_before JSONB,
    payload_after JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. INBOX THREADS & MESSAGES
CREATE TABLE IF NOT EXISTS public.inbox_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.campaign_leads(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    snippet TEXT,
    sentiment TEXT DEFAULT 'neutral', -- 'positive', 'question', 'negative', 'out_of_office', 'neutral'
    is_unread BOOLEAN NOT NULL DEFAULT TRUE,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.inbox_threads(id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    body_text TEXT,
    body_html TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. ENABLE ROW-LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- 18. HELPER SECURITY FUNCTION TO CHECK WORKSPACE ACCESS & ROLES
CREATE OR REPLACE FUNCTION public.check_user_workspace_role(
    p_workspace_id UUID,
    p_allowed_roles user_role[]
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users_workspaces
        WHERE workspace_id = p_workspace_id
          AND user_id = auth.uid()
          AND is_active = TRUE
          AND role = ANY(p_allowed_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. WORKSPACE ISOLATION RLS POLICIES
CREATE POLICY "Workspace Members View Access" ON public.workspaces
    FOR SELECT USING (
        id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Workspace Members Table Access" ON public.users_workspaces
    FOR SELECT USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Campaigns Access Policy" ON public.campaigns
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Contacts Access Policy" ON public.contacts
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Email Accounts Access Policy" ON public.email_accounts
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Templates Access Policy" ON public.templates
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Suppression Access Policy" ON public.suppression_list
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "Audit Logs View Policy" ON public.audit_logs
    FOR SELECT USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );

CREATE POLICY "System Settings Policy" ON public.system_settings
    FOR ALL USING (
        workspace_id IN (SELECT workspace_id FROM public.users_workspaces WHERE user_id = auth.uid() AND is_active = TRUE)
    );
