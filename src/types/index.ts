// HENU MAIL - Master TypeScript Definitions
// Organization: HENU OS Private Limited

export type UserRole =
  | 'owner'
  | 'super_admin'
  | 'admin'
  | 'campaign_manager'
  | 'outreach_manager'
  | 'analyst'
  | 'viewer';

export interface UserSession {
  id: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: UserRole;
}

export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'aborted';

export interface SystemTelemetry {
  todaySending: {
    sent: number;
    limit: number;
    queued: number;
    failed: number;
  };
  campaigns: {
    active: number;
    total: number;
    paused: number;
  };
  engagement: {
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    unsubscribed: number;
  };
  providerHealth: {
    overallScore: number;
    connectedAccounts: number;
    warmingAccounts: number;
    criticalAccounts: number;
  };
  systemStatus: 'nominal' | 'degraded' | 'maintenance' | 'paused';
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  invitedBy?: string;
  createdAt: string;
}

export interface ContactList {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  contactCount: number;
  contactIds: string[];
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  workspaceId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  tags: string[];
  listIds?: string[];
  customFields: Record<string, unknown>;
  status: 'active' | 'unsubscribed' | 'bounced' | 'suppressed' | 'invalid' | 'archived';
  engagementScore: number;
  softBounceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailAccount {
  id: string;
  workspaceId: string;
  emailAddress: string;
  displayName: string;
  providerType: 'google_oauth' | 'microsoft_oauth' | 'custom_smtp';
  dailyLimit: number;
  sentToday: number;
  warmupEnabled: boolean;
  warmupStage: number;
  healthScore: number;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  mxVerified: boolean;
  status: 'active' | 'paused' | 'error' | 'disconnected';
  createdAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  segmentId?: string;
  assignedEmailAccountIds: string[];
  steps: CampaignStep[];
  scheduleConfig: {
    timezone: string;
    days: string[];
    hours: { start: number; end: number };
  };
  stopOnReply: boolean;
  trackOpens: boolean;
  trackClicks: boolean;
  totalLeads: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  bounceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStep {
  stepNumber: number;
  delayHours: number;
  templateId?: string;
  subject: string;
  bodyHtml: string;
  variants?: {
    id: string;
    subject: string;
    bodyHtml: string;
    weight: number;
  }[];
}

export interface Template {
  id: string;
  workspaceId: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  category: string;
  isServiceCatalog: boolean;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SuppressionItem {
  id: string;
  workspaceId: string;
  email?: string;
  domain?: string;
  reason: 'manual_unsubscribe' | 'hard_bounce' | 'repeated_soft_bounce' | 'spam_complaint' | 'manual_admin' | 'domain_blacklist';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  actorId?: string;
  actorEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  payloadBefore?: Record<string, unknown>;
  payloadAfter?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemSettings {
  id: string;
  workspaceId: string;
  companyName: string;
  platformName: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsUrl: string;
  emailPolicyUrl: string;
  defaultDailyLimit: number;
  warmupDefaultIncrement: number;
  customBranding: {
    primaryColor?: string;
    logoUrl?: string;
    footerNote?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export * from "./scrapper";
