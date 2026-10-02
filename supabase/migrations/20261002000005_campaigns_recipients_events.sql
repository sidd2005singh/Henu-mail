-- HENU MAIL Migration 05: Campaigns, Campaign Recipients, Messages, Sending Attempts & Email Events
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'failed')),
    assigned_email_account_ids UUID[] NOT NULL DEFAULT '{}',
    schedule_config JSONB NOT NULL DEFAULT '{
        "timezone": "UTC",
        "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
        "hours": { "start": 9, "end": 17 },
        "min_delay_minutes": 2,
        "max_delay_minutes": 15
    }'::jsonb,
    stop_on_reply BOOLEAN NOT NULL DEFAULT TRUE,
    track_opens BOOLEAN NOT NULL DEFAULT TRUE,
    track_clicks BOOLEAN NOT NULL DEFAULT TRUE,
    total_recipients INTEGER NOT NULL DEFAULT 0 CHECK (total_recipients >= 0),
    sent_count INTEGER NOT NULL DEFAULT 0 CHECK (sent_count >= 0),
    open_count INTEGER NOT NULL DEFAULT 0 CHECK (open_count >= 0),
    click_count INTEGER NOT NULL DEFAULT 0 CHECK (click_count >= 0),
    reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
    bounce_count INTEGER NOT NULL DEFAULT 0 CHECK (bounce_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CAMPAIGN RECIPIENTS (Prospect state machine inside a campaign)
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_sequence', 'replied', 'unsubscribed', 'bounced', 'completed', 'halted')),
    current_step_index INTEGER NOT NULL DEFAULT 0 CHECK (current_step_index >= 0),
    tracking_token UUID NOT NULL DEFAULT gen_random_uuid(),
    last_event_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, contact_id)
);

-- 3. CAMPAIGN MESSAGES (Individual step emails generated for a recipient)
CREATE TABLE IF NOT EXISTS public.campaign_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.campaign_recipients(id) ON DELETE CASCADE,
    email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    step_index INTEGER NOT NULL DEFAULT 1 CHECK (step_index >= 1),
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'retrying', 'bounced', 'suppressed', 'unsubscribed')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    idempotency_key TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SENDING ATTEMPTS (Audit trail of every dispatch attempt with provider)
CREATE TABLE IF NOT EXISTS public.sending_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.campaign_messages(id) ON DELETE CASCADE,
    email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'rate_limited', 'rejected')),
    provider_response_code TEXT,
    provider_message_id TEXT,
    error_details JSONB,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMAIL EVENTS (Immutable time-series telemetry)
CREATE TABLE IF NOT EXISTS public.email_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE SET NULL,
    message_id UUID REFERENCES public.campaign_messages(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'soft_bounce', 'hard_bounce', 'failed', 'unsubscribed', 'spam_complaint')),
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
