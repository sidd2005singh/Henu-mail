-- HENU MAIL Migration 08: Row Level Security (RLS) Policies, Triggers & Performance Indexes
-- Organization: HENU OS Private Limited
-- Version: 1.0.0

-- 1. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$ 
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
          AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS tr_%I_updated_at ON public.%I;
            CREATE TRIGGER tr_%I_updated_at 
            BEFORE UPDATE ON public.%I 
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
        ', t, t, t, t);
    END LOOP;
END $$;

-- 2. SECURITY HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = p_workspace_id
          AND user_id = auth.uid()
          AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.has_workspace_permission(p_workspace_id UUID, p_permission_key TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.workspace_members wm
        JOIN public.role_permissions rp ON rp.role_id = wm.role_id
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE wm.workspace_id = p_workspace_id
          AND wm.user_id = auth.uid()
          AND wm.status = 'active'
          AND p.key = p_permission_key
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENABLE RLS ON ALL SCHEMAS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sending_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reply_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES

-- Permissions: Accessible to any authenticated user
CREATE POLICY "Permissions viewable by authenticated users" 
ON public.permissions FOR SELECT TO authenticated USING (TRUE);

-- Workspaces
CREATE POLICY "Users can view workspaces they belong to"
ON public.workspaces FOR SELECT TO authenticated
USING (public.is_workspace_member(id));

CREATE POLICY "Users can update workspaces if they have organization:manage permission"
ON public.workspaces FOR UPDATE TO authenticated
USING (public.has_workspace_permission(id, 'organization:manage'));

-- Profiles
CREATE POLICY "Profiles viewable by workspace members"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id) OR user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Roles & Role Permissions
CREATE POLICY "Roles viewable by workspace members"
ON public.roles FOR SELECT TO authenticated
USING (workspace_id IS NULL OR public.is_workspace_member(workspace_id));

CREATE POLICY "Role permissions viewable by workspace members"
ON public.role_permissions FOR SELECT TO authenticated
USING (TRUE);

-- Workspace Members
CREATE POLICY "Members viewable by active workspace members"
ON public.workspace_members FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Manage members with team:manage permission"
ON public.workspace_members FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'team:manage'));

-- Contacts & Custom Fields & Tags
CREATE POLICY "Contacts viewable with contacts:view"
ON public.contacts FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:view'));

CREATE POLICY "Contacts editable with contacts:manage"
ON public.contacts FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:manage'));

CREATE POLICY "Custom fields viewable by workspace members"
ON public.contact_custom_fields FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Custom fields editable with contacts:manage"
ON public.contact_custom_fields FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:manage'));

CREATE POLICY "Tags viewable by workspace members"
ON public.tags FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Tags editable with contacts:manage"
ON public.tags FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:manage'));

CREATE POLICY "Contact tags access"
ON public.contact_tags FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.contacts c 
    WHERE c.id = contact_tags.contact_id 
      AND public.has_workspace_permission(c.workspace_id, 'contacts:view')
));

-- Contact Lists & Members
CREATE POLICY "Contact lists viewable"
ON public.contact_lists FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:view'));

CREATE POLICY "Contact lists manageable"
ON public.contact_lists FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'contacts:manage'));

CREATE POLICY "List members access"
ON public.contact_list_members FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.contact_lists cl 
    WHERE cl.id = contact_list_members.list_id 
      AND public.has_workspace_permission(cl.workspace_id, 'contacts:view')
));

-- Suppression List
CREATE POLICY "Suppression viewable"
ON public.suppression_list FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'suppression:view'));

CREATE POLICY "Suppression manageable"
ON public.suppression_list FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'suppression:manage'));

-- Email Accounts
CREATE POLICY "Email accounts viewable"
ON public.email_accounts FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'email_accounts:view'));

CREATE POLICY "Email accounts manageable"
ON public.email_accounts FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'email_accounts:manage'));

-- Templates & Versions
CREATE POLICY "Templates viewable"
ON public.templates FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'templates:view'));

CREATE POLICY "Templates manageable"
ON public.templates FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'templates:manage'));

CREATE POLICY "Template versions viewable"
ON public.template_versions FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.templates t 
    WHERE t.id = template_versions.template_id 
      AND public.has_workspace_permission(t.workspace_id, 'templates:view')
));

CREATE POLICY "Template variables viewable"
ON public.template_variables FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.templates t 
    WHERE t.id = template_variables.template_id 
      AND public.has_workspace_permission(t.workspace_id, 'templates:view')
));

CREATE POLICY "Template assets viewable"
ON public.template_assets FOR ALL TO authenticated
USING (public.is_workspace_member(workspace_id));

-- Campaigns, Recipients, Messages, Attempts, Events
CREATE POLICY "Campaigns viewable"
ON public.campaigns FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'campaigns:view'));

CREATE POLICY "Campaigns manageable"
ON public.campaigns FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'campaigns:create') OR public.has_workspace_permission(workspace_id, 'campaigns:control'));

CREATE POLICY "Campaign recipients access"
ON public.campaign_recipients FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_recipients.campaign_id 
      AND public.has_workspace_permission(c.workspace_id, 'campaigns:view')
));

CREATE POLICY "Campaign messages access"
ON public.campaign_messages FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_messages.campaign_id 
      AND public.has_workspace_permission(c.workspace_id, 'campaigns:view')
));

CREATE POLICY "Sending attempts access"
ON public.sending_attempts FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.campaign_messages cm
    JOIN public.campaigns c ON c.id = cm.campaign_id
    WHERE cm.id = sending_attempts.message_id 
      AND public.has_workspace_permission(c.workspace_id, 'campaigns:view')
));

CREATE POLICY "Email events access"
ON public.email_events FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'analytics:view'));

-- Automations & Steps
CREATE POLICY "Automations viewable"
ON public.automations FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'campaigns:view'));

CREATE POLICY "Automations manageable"
ON public.automations FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'campaigns:create'));

CREATE POLICY "Automation steps access"
ON public.automation_steps FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.automations a 
    WHERE a.id = automation_steps.automation_id 
      AND public.has_workspace_permission(a.workspace_id, 'campaigns:view')
));

CREATE POLICY "Automation enrollments access"
ON public.automation_enrollments FOR ALL TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.automations a 
    WHERE a.id = automation_enrollments.automation_id 
      AND public.has_workspace_permission(a.workspace_id, 'campaigns:view')
));

CREATE POLICY "Automation events access"
ON public.automation_events FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.automation_enrollments ae
    JOIN public.automations a ON a.id = ae.automation_id
    WHERE ae.id = automation_events.enrollment_id 
      AND public.has_workspace_permission(a.workspace_id, 'campaigns:view')
));

-- Inbox Threads & Messages
CREATE POLICY "Inbox threads viewable"
ON public.inbox_threads FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'inbox:view'));

CREATE POLICY "Inbox threads manageable"
ON public.inbox_threads FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'inbox:reply'));

CREATE POLICY "Inbox messages viewable"
ON public.inbox_messages FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.inbox_threads it 
    WHERE it.id = inbox_messages.thread_id 
      AND public.has_workspace_permission(it.workspace_id, 'inbox:view')
));

CREATE POLICY "Inbox messages insertable"
ON public.inbox_messages FOR INSERT TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.inbox_threads it 
    WHERE it.id = inbox_messages.thread_id 
      AND public.has_workspace_permission(it.workspace_id, 'inbox:reply')
));

CREATE POLICY "Reply events viewable"
ON public.reply_events FOR SELECT TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.inbox_threads it 
    WHERE it.id = reply_events.thread_id 
      AND public.has_workspace_permission(it.workspace_id, 'analytics:view')
));

-- Audit Logs
CREATE POLICY "Audit logs viewable"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_workspace_permission(workspace_id, 'audit_logs:view'));

-- System Settings
CREATE POLICY "System settings viewable by workspace members"
ON public.system_settings FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id));

CREATE POLICY "System settings manageable with system_settings:edit"
ON public.system_settings FOR ALL TO authenticated
USING (public.has_workspace_permission(workspace_id, 'system_settings:edit'));

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_ws ON public.workspace_members(user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON public.workspace_members(role_id);

CREATE INDEX IF NOT EXISTS idx_contacts_workspace_id ON public.contacts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(workspace_id, email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suppression_lookup ON public.suppression_list(workspace_id, email);
CREATE INDEX IF NOT EXISTS idx_suppression_domain ON public.suppression_list(workspace_id, domain);

CREATE INDEX IF NOT EXISTS idx_email_accounts_ws_status ON public.email_accounts(workspace_id, connection_status);

CREATE INDEX IF NOT EXISTS idx_campaigns_ws_status ON public.campaigns(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_camp_status ON public.campaign_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_status_sched ON public.campaign_messages(status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_idempotency ON public.campaign_messages(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_email_events_camp_occurred ON public.email_events(campaign_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_ws_type ON public.email_events(workspace_id, event_type);

CREATE INDEX IF NOT EXISTS idx_inbox_threads_ws_last_msg ON public.inbox_threads(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_messages_thread_id ON public.inbox_messages(thread_id, received_at ASC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_ws_created ON public.audit_logs(workspace_id, created_at DESC);
