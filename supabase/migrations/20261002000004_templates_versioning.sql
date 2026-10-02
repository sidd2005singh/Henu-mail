-- HENU MAIL Migration 04: Templates, Template Versioning, Variables & Assets
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. TEMPLATES (Master Template Record)
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    is_service_catalog BOOLEAN NOT NULL DEFAULT FALSE,
    current_version_id UUID, -- Forward reference updated upon version creation
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- 2. TEMPLATE VERSIONS (Immutable historical snapshots)
CREATE TABLE IF NOT EXISTS public.template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number >= 1),
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    preheader TEXT,
    created_by UUID,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, version_number)
);

-- Circular foreign key linkage for current_version_id
DO $$ BEGIN
    ALTER TABLE public.templates 
    ADD CONSTRAINT fk_template_current_version 
    FOREIGN KEY (current_version_id) 
    REFERENCES public.template_versions(id) 
    ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TEMPLATE VARIABLES
CREATE TABLE IF NOT EXISTS public.template_variables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    variable_key TEXT NOT NULL, -- e.g., 'firstName', 'company', 'service_interest'
    fallback_value TEXT,
    description TEXT,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, variable_key)
);

-- 4. TEMPLATE ASSETS (Images & Documents)
CREATE TABLE IF NOT EXISTS public.template_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
