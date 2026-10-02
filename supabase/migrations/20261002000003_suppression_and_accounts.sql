-- HENU MAIL Migration 03: Global Suppression Guard & Connected Email Accounts
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. SUPPRESSION LIST
CREATE TABLE IF NOT EXISTS public.suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    email TEXT,
    domain TEXT,
    reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'manual_suppression', 'complaint', 'invalid_address')),
    source TEXT NOT NULL DEFAULT 'system_trigger' CHECK (source IN ('campaign_header', 'inbound_webhook', 'manual_admin', 'csv_import', 'system_trigger')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_suppression_entity CHECK (email IS NOT NULL OR domain IS NOT NULL)
);

-- 2. EMAIL ACCOUNTS (Secure Provider Senders)
CREATE TABLE IF NOT EXISTS public.email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google_oauth', 'microsoft_oauth', 'custom_smtp', 'amazon_ses', 'resend')),
    account_email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    provider_account_identifier TEXT, -- Remote user id or subject id
    token_references JSONB DEFAULT '{}'::jsonb, -- Secure external key vault or token identifier
    auth_credentials_encrypted TEXT, -- AES-256-GCM encrypted payload (Never store plaintext passwords)
    connection_status TEXT NOT NULL DEFAULT 'active' CHECK (connection_status IN ('active', 'paused', 'error', 'disconnected', 'rate_limited')),
    last_health_check_at TIMESTAMPTZ,
    sending_configuration JSONB NOT NULL DEFAULT '{
        "daily_limit": 200,
        "hourly_limit": 30,
        "min_delay_seconds": 45,
        "max_delay_seconds": 180,
        "warmup_enabled": true,
        "warmup_stage": 1,
        "custom_headers": {}
    }'::jsonb,
    sent_today INTEGER NOT NULL DEFAULT 0 CHECK (sent_today >= 0),
    health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    spf_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dkim_verified BOOLEAN NOT NULL DEFAULT FALSE,
    dmarc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mx_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, account_email)
);
