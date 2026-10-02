-- ====================================================================
-- HENU MAIL / HENU SCRAPPER - Core Intelligence & Enrichment Schema
-- Migration: 20261002000011_henu_scrapper_schema.sql
-- Organization: HENU OS Private Limited
-- ====================================================================

-- 1. Research Profiles (Reusable research configurations)
CREATE TABLE IF NOT EXISTS public.research_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    depth_level VARCHAR(50) NOT NULL DEFAULT 'standard' CHECK (depth_level IN ('quick', 'standard', 'deep', 'exhaustive')),
    verify_directors BOOLEAN NOT NULL DEFAULT true,
    find_director_emails BOOLEAN NOT NULL DEFAULT true,
    find_director_phones BOOLEAN NOT NULL DEFAULT true,
    find_linkedin_profiles BOOLEAN NOT NULL DEFAULT true,
    verify_active_status BOOLEAN NOT NULL DEFAULT true,
    find_company_website BOOLEAN NOT NULL DEFAULT true,
    max_search_queries_per_company INT NOT NULL DEFAULT 5,
    min_confidence_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Scrapper Imports (Batch ingestion sessions)
CREATE TABLE IF NOT EXISTS public.scrapper_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('xlsx', 'xls', 'csv')),
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    missing_cin_rows INT NOT NULL DEFAULT 0,
    ready_rows INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'analyzed', 'mapped', 'imported', 'failed')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Companies (Preserves all original MCA/ROC fields + verified enrichment)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    import_id UUID REFERENCES public.scrapper_imports(id) ON DELETE SET NULL,
    
    -- Original MCA / ROC columns (Preserved exactly as imported)
    cin VARCHAR(50),
    original_company_name VARCHAR(500) NOT NULL,
    company_category VARCHAR(255),
    company_roc_code VARCHAR(100),
    company_sub_category VARCHAR(255),
    company_class VARCHAR(100),
    authorized_capital DECIMAL(18, 2),
    registration_date DATE,
    registered_office_address TEXT,
    state_code VARCHAR(50),
    industrial_classification VARCHAR(500),

    -- Normalized Fields
    normalized_company_name VARCHAR(500),
    normalized_address TEXT,

    -- Verified Enrichment Fields
    verified_company_name VARCHAR(500),
    verified_address TEXT,
    website VARCHAR(500),
    domain VARCHAR(255),
    phone VARCHAR(100),
    email VARCHAR(255),
    linkedin_url VARCHAR(500),
    company_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, STRUCK_OFF, DORMANT, UNDER_LIQUIDATION
    
    -- Verification Telemetry
    verification_status VARCHAR(50) NOT NULL DEFAULT 'unresearched' CHECK (verification_status IN ('unresearched', 'in_progress', 'verified', 'partially_verified', 'flagged_mismatch', 'unverified')),
    verification_confidence DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    verification_notes TEXT,
    
    -- Research Execution Status
    research_status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' CHECK (research_status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'NEEDS_REVIEW', 'FAILED', 'SKIPPED', 'CANCELLED')),
    director_count INT NOT NULL DEFAULT 0,
    contact_count INT NOT NULL DEFAULT 0,
    evidence_count INT NOT NULL DEFAULT 0,
    last_researched_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Directors (Individual directors discovered)
CREATE TABLE IF NOT EXISTS public.directors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    din VARCHAR(50), -- Director Identification Number (DIN / DPIN)
    name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),
    designation VARCHAR(255) DEFAULT 'Director', -- Managing Director, Director, Whole-time Director, Nominee, CFO, CEO
    pan_masked VARCHAR(20),
    gender VARCHAR(20),
    nationality VARCHAR(100) DEFAULT 'Indian',
    email VARCHAR(255),
    phone VARCHAR(100),
    mobile VARCHAR(100),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active',
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    verification_status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Director-Company Relationships (Many-to-many with provenance)
CREATE TABLE IF NOT EXISTS public.director_company_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    director_id UUID NOT NULL REFERENCES public.directors(id) ON DELETE CASCADE,
    din VARCHAR(50),
    designation VARCHAR(255) DEFAULT 'Director',
    appointment_date DATE,
    cessation_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_signatory BOOLEAN NOT NULL DEFAULT false,
    source_name VARCHAR(255) DEFAULT 'MCA Registry',
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.90,
    verification_status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, director_id)
);

-- 6. Contact Points (Emails, Direct Phones, Mobiles, Social Handles)
CREATE TABLE IF NOT EXISTS public.contact_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    director_id UUID REFERENCES public.directors(id) ON DELETE CASCADE,
    point_type VARCHAR(50) NOT NULL CHECK (point_type IN ('email', 'direct_phone', 'mobile', 'office_phone', 'website', 'linkedin', 'twitter', 'github', 'facebook')),
    value VARCHAR(500) NOT NULL,
    normalized_value VARCHAR(500) NOT NULL,
    label VARCHAR(100) DEFAULT 'Primary', -- Official MCA, Direct Work, Personal, Corporate Reception, WHOIS, Website Contact
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_deliverable BOOLEAN DEFAULT true,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'deliverable', 'catch_all', 'undeliverable', 'unverified', 'risky')),
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.70,
    evidence_snippet TEXT,
    source_url VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Research Sources (Registry of intelligence sources)
CREATE TABLE IF NOT EXISTS public.research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('official_registry', 'search_engine', 'company_website', 'corporate_directory', 'social_network', 'whois', 'news_media', 'custom_api')),
    domain VARCHAR(255) NOT NULL,
    base_url VARCHAR(500),
    reliability_score DECIMAL(3,2) NOT NULL DEFAULT 0.90,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'throttled', 'inactive')),
    rate_limit_per_minute INT NOT NULL DEFAULT 30,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Research Evidence (Immutable provenance and discovery trails)
CREATE TABLE IF NOT EXISTS public.research_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    director_id UUID REFERENCES public.directors(id) ON DELETE SET NULL,
    contact_point_id UUID REFERENCES public.contact_points(id) ON DELETE SET NULL,
    source_id UUID REFERENCES public.research_sources(id) ON DELETE SET NULL,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(1000) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN ('text_snippet', 'table_row', 'html_meta', 'whois_record', 'api_payload', 'pdf_filing', 'screenshot')),
    snippet TEXT NOT NULL,
    attribute_discovered VARCHAR(100) NOT NULL, -- company_website, director_email, director_phone, linkedin_profile, roc_status, active_directors
    discovered_value TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'accepted' CHECK (verification_status IN ('accepted', 'needs_review', 'rejected', 'superseded')),
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Research Jobs (Batch research execution orchestration)
CREATE TABLE IF NOT EXISTS public.research_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.research_profiles(id) ON DELETE SET NULL,
    import_id UUID REFERENCES public.scrapper_imports(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED')),
    total_companies INT NOT NULL DEFAULT 0,
    processed_companies INT NOT NULL DEFAULT 0,
    successful_companies INT NOT NULL DEFAULT 0,
    failed_companies INT NOT NULL DEFAULT 0,
    needs_review_companies INT NOT NULL DEFAULT 0,
    total_directors_found INT NOT NULL DEFAULT 0,
    total_emails_found INT NOT NULL DEFAULT 0,
    total_phones_found INT NOT NULL DEFAULT 0,
    total_websites_found INT NOT NULL DEFAULT 0,
    progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    error_summary TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Research Job Items (Individual company items within a job)
CREATE TABLE IF NOT EXISTS public.research_job_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.research_jobs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'NEEDS_REVIEW', 'FAILED', 'SKIPPED', 'CANCELLED')),
    attempt_count INT NOT NULL DEFAULT 0,
    directors_found INT NOT NULL DEFAULT 0,
    contacts_found INT NOT NULL DEFAULT 0,
    confidence_score DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    error_message TEXT,
    execution_duration_ms INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Provider Configs & Usage (Search, AI & Web Scraping backends)
CREATE TABLE IF NOT EXISTS public.scrapper_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL, -- google_search, bing_search, serper, custom_scraping_cluster, mca_direct, whois_xml
    provider_type VARCHAR(50) NOT NULL,
    encrypted_api_key TEXT,
    api_endpoint VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    monthly_budget_usd DECIMAL(10, 2) DEFAULT 100.00,
    used_month_to_date_usd DECIMAL(10, 2) DEFAULT 0.00,
    rate_limit_per_minute INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_companies_cin ON public.companies(cin);
CREATE INDEX IF NOT EXISTS idx_companies_workspace ON public.companies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(verification_status, research_status);
CREATE INDEX IF NOT EXISTS idx_directors_din ON public.directors(din);
CREATE INDEX IF NOT EXISTS idx_directors_workspace ON public.directors(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contact_points_company ON public.contact_points(company_id);
CREATE INDEX IF NOT EXISTS idx_contact_points_director ON public.contact_points(director_id);
CREATE INDEX IF NOT EXISTS idx_evidence_company ON public.research_evidence(company_id);
CREATE INDEX IF NOT EXISTS idx_job_items_job ON public.research_job_items(job_id, status);

-- 13. Row Level Security (RLS) Policies
ALTER TABLE public.research_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrapper_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.director_company_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_job_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrapper_provider_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace isolation for research_profiles" ON public.research_profiles FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for scrapper_imports" ON public.scrapper_imports FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for companies" ON public.companies FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for directors" ON public.directors FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for director_company_relationships" ON public.director_company_relationships FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for contact_points" ON public.contact_points FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for research_sources" ON public.research_sources FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for research_evidence" ON public.research_evidence FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for research_jobs" ON public.research_jobs FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for research_job_items" ON public.research_job_items FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
CREATE POLICY "Workspace isolation for scrapper_provider_configs" ON public.scrapper_provider_configs FOR ALL USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
