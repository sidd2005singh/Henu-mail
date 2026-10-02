-- HENU MAIL Migration 02: Contacts, Custom Fields, Tags, Contact Lists & Memberships
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    owner_name TEXT,
    company_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT,
    industry TEXT,
    website TEXT,
    source TEXT DEFAULT 'direct_import', -- 'csv_import', 'api', 'manual', 'form', 'automation'
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'suppressed', 'invalid', 'archived')),
    custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    engagement_score INTEGER NOT NULL DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    soft_bounce_count INTEGER NOT NULL DEFAULT 0 CHECK (soft_bounce_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, email)
);

-- 2. CONTACT CUSTOM FIELDS DEFINITION
CREATE TABLE IF NOT EXISTS public.contact_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'text' CHECK (data_type IN ('text', 'number', 'boolean', 'date', 'select', 'json')),
    options JSONB DEFAULT '[]'::jsonb, -- Options if data_type is select
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, key)
);

-- 3. TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#00d2ff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- 4. CONTACT TAGS (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.contact_tags (
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (contact_id, tag_id)
);

-- 5. CONTACT LISTS (Static & Dynamic Segments)
CREATE TABLE IF NOT EXISTS public.contact_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
    filter_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, name)
);

-- 6. CONTACT LIST MEMBERS (Membership for Static Lists)
CREATE TABLE IF NOT EXISTS public.contact_list_members (
    list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (list_id, contact_id)
);
