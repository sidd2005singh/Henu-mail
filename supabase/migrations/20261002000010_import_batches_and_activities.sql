-- HENU MAIL Migration 10: Import Batches & Contact Activity Logs
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. IMPORT BATCHES (Historical tracking of CSV / Excel import jobs)
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    created_by UUID,
    actor_email TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'xls', 'google_sheets')),
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    total_rows INTEGER NOT NULL DEFAULT 0 CHECK (total_rows >= 0),
    valid_count INTEGER NOT NULL DEFAULT 0 CHECK (valid_count >= 0),
    duplicate_count INTEGER NOT NULL DEFAULT 0 CHECK (duplicate_count >= 0),
    invalid_count INTEGER NOT NULL DEFAULT 0 CHECK (invalid_count >= 0),
    suppressed_count INTEGER NOT NULL DEFAULT 0 CHECK (suppressed_count >= 0),
    imported_count INTEGER NOT NULL DEFAULT 0 CHECK (imported_count >= 0),
    duplicate_strategy TEXT NOT NULL DEFAULT 'skip' CHECK (duplicate_strategy IN ('skip', 'update', 'import_as_new')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 2. CONTACT ACTIVITIES (Comprehensive audit timeline for individual contacts)
CREATE TABLE IF NOT EXISTS public.contact_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'imported', 'created', 'updated', 'tagged', 'untagged',
        'suppressed', 'unsubscribed', 'bounced',
        'enrolled_in_campaign', 'email_sent', 'email_opened',
        'email_clicked', 'email_replied', 'archived', 'restored'
    )),
    description TEXT NOT NULL,
    actor_email TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ENABLE ROW-LEVEL SECURITY
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_activities ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
CREATE POLICY "Import batches viewable"
ON public.import_batches FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:view'));

CREATE POLICY "Import batches insertable"
ON public.import_batches FOR INSERT TO authenticated
WITH CHECK (public.has_workspace_permission(workspace_id, 'contacts:import'));

CREATE POLICY "Contact activities viewable"
ON public.contact_activities FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:view'));

CREATE POLICY "Contact activities insertable"
ON public.contact_activities FOR INSERT TO authenticated
WITH CHECK (public.has_workspace_permission(workspace_id, 'contacts:manage'));

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_import_batches_ws_created ON public.import_batches(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact ON public.contact_activities(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_activities_ws_type ON public.contact_activities(workspace_id, activity_type);
