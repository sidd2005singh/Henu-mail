// HENU MAIL - Master Supabase Database Types
// Organization: HENU OS Private Limited
// Generated & Validated for PostgreSQL Schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: 'active' | 'suspended' | 'archived' | 'pending_deletion';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: 'active' | 'suspended' | 'archived' | 'pending_deletion';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: 'active' | 'suspended' | 'archived' | 'pending_deletion';
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          display_name: string;
          avatar: string | null;
          status: 'active' | 'invited' | 'suspended' | 'deactivated';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          display_name: string;
          avatar?: string | null;
          status?: 'active' | 'invited' | 'suspended' | 'deactivated';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          display_name?: string;
          avatar?: string | null;
          status?: 'active' | 'invited' | 'suspended' | 'deactivated';
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          workspace_id: string | null;
          name: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id?: string | null;
          name: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string | null;
          name?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          description: string;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          description: string;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          description?: string;
          category?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          status: 'active' | 'invited' | 'suspended' | 'left';
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role_id: string;
          status?: 'active' | 'invited' | 'suspended' | 'left';
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role_id?: string;
          status?: 'active' | 'invited' | 'suspended' | 'left';
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          workspace_id: string;
          first_name: string | null;
          last_name: string | null;
          owner_name: string | null;
          company_name: string | null;
          email: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          industry: string | null;
          website: string | null;
          source: string;
          status: 'active' | 'unsubscribed' | 'bounced' | 'suppressed' | 'invalid' | 'archived';
          custom_fields: Json;
          engagement_score: number;
          soft_bounce_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          first_name?: string | null;
          last_name?: string | null;
          owner_name?: string | null;
          company_name?: string | null;
          email: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          industry?: string | null;
          website?: string | null;
          source?: string;
          status?: 'active' | 'unsubscribed' | 'bounced' | 'suppressed' | 'invalid' | 'archived';
          custom_fields?: Json;
          engagement_score?: number;
          soft_bounce_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          owner_name?: string | null;
          company_name?: string | null;
          email?: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          industry?: string | null;
          website?: string | null;
          source?: string;
          status?: 'active' | 'unsubscribed' | 'bounced' | 'suppressed' | 'invalid' | 'archived';
          custom_fields?: Json;
          engagement_score?: number;
          soft_bounce_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppression_list: {
        Row: {
          id: string;
          workspace_id: string;
          email: string | null;
          domain: string | null;
          reason: 'unsubscribe' | 'bounce' | 'manual_suppression' | 'complaint' | 'invalid_address';
          source: 'campaign_header' | 'inbound_webhook' | 'manual_admin' | 'csv_import' | 'system_trigger';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email?: string | null;
          domain?: string | null;
          reason: 'unsubscribe' | 'bounce' | 'manual_suppression' | 'complaint' | 'invalid_address';
          source?: 'campaign_header' | 'inbound_webhook' | 'manual_admin' | 'csv_import' | 'system_trigger';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string | null;
          domain?: string | null;
          reason?: 'unsubscribe' | 'bounce' | 'manual_suppression' | 'complaint' | 'invalid_address';
          source?: 'campaign_header' | 'inbound_webhook' | 'manual_admin' | 'csv_import' | 'system_trigger';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_accounts: {
        Row: {
          id: string;
          workspace_id: string;
          provider: 'google_oauth' | 'microsoft_oauth' | 'custom_smtp' | 'amazon_ses' | 'resend';
          account_email: string;
          display_name: string;
          provider_account_identifier: string | null;
          token_references: Json;
          auth_credentials_encrypted: string | null;
          connection_status: 'active' | 'paused' | 'error' | 'disconnected' | 'rate_limited';
          last_health_check_at: string | null;
          sending_configuration: Json;
          sent_today: number;
          health_score: number;
          spf_verified: boolean;
          dkim_verified: boolean;
          dmarc_verified: boolean;
          mx_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          provider: 'google_oauth' | 'microsoft_oauth' | 'custom_smtp' | 'amazon_ses' | 'resend';
          account_email: string;
          display_name: string;
          provider_account_identifier?: string | null;
          token_references?: Json;
          auth_credentials_encrypted?: string | null;
          connection_status?: 'active' | 'paused' | 'error' | 'disconnected' | 'rate_limited';
          last_health_check_at?: string | null;
          sending_configuration?: Json;
          sent_today?: number;
          health_score?: number;
          spf_verified?: boolean;
          dkim_verified?: boolean;
          dmarc_verified?: boolean;
          mx_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          provider?: 'google_oauth' | 'microsoft_oauth' | 'custom_smtp' | 'amazon_ses' | 'resend';
          account_email?: string;
          display_name?: string;
          provider_account_identifier?: string | null;
          token_references?: Json;
          auth_credentials_encrypted?: string | null;
          connection_status?: 'active' | 'paused' | 'error' | 'disconnected' | 'rate_limited';
          last_health_check_at?: string | null;
          sending_configuration?: Json;
          sent_today?: number;
          health_score?: number;
          spf_verified?: boolean;
          dkim_verified?: boolean;
          dmarc_verified?: boolean;
          mx_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
          assigned_email_account_ids: string[];
          schedule_config: Json;
          stop_on_reply: boolean;
          track_opens: boolean;
          track_clicks: boolean;
          total_recipients: number;
          sent_count: number;
          open_count: number;
          click_count: number;
          reply_count: number;
          bounce_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
          assigned_email_account_ids?: string[];
          schedule_config?: Json;
          stop_on_reply?: boolean;
          track_opens?: boolean;
          track_clicks?: boolean;
          total_recipients?: number;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          reply_count?: number;
          bounce_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          status?: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
          assigned_email_account_ids?: string[];
          schedule_config?: Json;
          stop_on_reply?: boolean;
          track_opens?: boolean;
          track_clicks?: boolean;
          total_recipients?: number;
          sent_count?: number;
          open_count?: number;
          click_count?: number;
          reply_count?: number;
          bounce_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          actor_email: string;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          actor_email: string;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          actor_email?: string;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          workspace_id: string;
          company_name: string;
          platform_name: string;
          support_email: string;
          privacy_policy_url: string;
          terms_url: string;
          email_policy_url: string;
          default_daily_limit: number;
          warmup_default_increment: number;
          custom_branding: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_name?: string;
          platform_name?: string;
          support_email?: string;
          privacy_policy_url?: string;
          terms_url?: string;
          email_policy_url?: string;
          default_daily_limit?: number;
          warmup_default_increment?: number;
          custom_branding?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_name?: string;
          platform_name?: string;
          support_email?: string;
          privacy_policy_url?: string;
          terms_url?: string;
          email_policy_url?: string;
          default_daily_limit?: number;
          warmup_default_increment?: number;
          custom_branding?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
