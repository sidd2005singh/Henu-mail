-- HENU MAIL Migration 06: Automations, Workflow Steps, Enrollments, Inbox Threads & Reply Events
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. AUTOMATIONS (Master Event Workflow)
CREATE TABLE IF NOT EXISTS public.automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('contact_created', 'tag_added', 'email_replied', 'email_opened', 'link_clicked', 'segment_entered')),
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- 2. AUTOMATION STEPS
CREATE TABLE IF NOT EXISTS public.automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL CHECK (step_index >= 1),
    action_type TEXT NOT NULL CHECK (action_type IN ('send_email', 'add_tag', 'remove_tag', 'wait_delay', 'condition_branch', 'webhook_dispatch', 'update_contact')),
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (automation_id, step_index)
);

-- 3. AUTOMATION ENROLLMENTS (Contact tracking inside workflow)
CREATE TABLE IF NOT EXISTS public.automation_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    current_step_id UUID REFERENCES public.automation_steps(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_evaluated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    UNIQUE (automation_id, contact_id)
);

-- 4. AUTOMATION EVENTS
CREATE TABLE IF NOT EXISTS public.automation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.automation_enrollments(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES public.automation_steps(id) ON DELETE CASCADE,
    event_status TEXT NOT NULL CHECK (event_status IN ('executed', 'skipped', 'failed')),
    result_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INBOX THREADS
CREATE TABLE IF NOT EXISTS public.inbox_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.campaign_recipients(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    email_account_id UUID REFERENCES public.email_accounts(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    snippet TEXT,
    sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'question', 'negative', 'out_of_office', 'neutral')),
    is_unread BOOLEAN NOT NULL DEFAULT TRUE,
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. INBOX MESSAGES
CREATE TABLE IF NOT EXISTS public.inbox_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.inbox_threads(id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    body_text TEXT,
    body_html TEXT,
    raw_headers JSONB DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. REPLY EVENTS (Analytics & Classification Logs)
CREATE TABLE IF NOT EXISTS public.reply_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES public.inbox_threads(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.inbox_messages(id) ON DELETE CASCADE,
    sentiment_score NUMERIC(4,3) CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
    classification_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
