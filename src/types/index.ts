// ==============================================================================
// EHY Connect — Master TypeScript Definitions
// Module: types/index.ts
// Stack: Next.js 14 / TypeScript 5+ / Supabase
// ==============================================================================

export type UserRole = 'admin' | 'supervisor' | 'agent' | 'social_manager';

export type ChannelPlatform = 
  | 'whatsapp' 
  | 'instagram' 
  | 'facebook' 
  | 'tiktok' 
  | 'youtube' 
  | 'x_twitter' 
  | 'linkedin';

export type ChannelStatus = 'connected' | 'disconnected' | 'expired' | 'error' | 'sandbox_test';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'snoozed';
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type Sentiment = 'positive' | 'neutral' | 'negative';

export type MessageDirection = 'inbound' | 'outbound' | 'internal_note';
export type MessageDeliveryStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type PostStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'scheduled' 
  | 'publishing' 
  | 'published' 
  | 'failed';

export type ApprovalDecision = 'approved' | 'rejected' | 'changes_requested';

export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone_number?: string;
  is_online: boolean;
  is_active: boolean;
  last_seen_at?: string;
}

export interface Channel {
  id: string;
  organization_id: string;
  platform: ChannelPlatform;
  account_id: string;
  account_name: string;
  account_handle?: string;
  status: ChannelStatus;
  token_expires_at?: string;
  metadata?: Record<string, any>;
}

export interface MediaAttachment {
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  filename?: string;
  mime_type?: string;
  size_bytes?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  organization_id: string;
  sender_id?: string;
  direction: MessageDirection;
  content: string;
  media_attachments?: MediaAttachment[];
  delivery_status: MessageDeliveryStatus;
  platform_message_id?: string;
  created_at: string;
}

export interface AgentLock {
  conversation_id: string;
  organization_id: string;
  agent_id: string;
  agent_name?: string;
  locked_at: string;
  expires_at: string;
  heartbeat_at: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  channel_id: string;
  channel?: Channel;
  assigned_agent_id?: string;
  assigned_agent?: UserProfile;
  assigned_team_id?: string;
  customer_identifier: string;
  customer_name: string;
  customer_avatar_url?: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  subject?: string;
  tags: string[];
  unread_count: number;
  sentiment: Sentiment;
  last_message_preview?: string;
  last_message_at: string;
  resolved_at?: string;
  created_at: string;
  active_lock?: AgentLock | null;
  messages?: Message[];
}

export interface SocialPostTarget {
  platform: ChannelPlatform;
  channel_id: string;
  type?: 'feed' | 'reel' | 'story' | 'carousel' | 'video';
}

export interface SocialPost {
  id: string;
  organization_id: string;
  author_id: string;
  author?: UserProfile;
  content: string;
  media_urls: string[];
  target_platforms: SocialPostTarget[];
  status: PostStatus;
  scheduled_for?: string;
  published_at?: string;
  publishing_results?: Record<string, any>;
  zernio_post_id?: string;
  created_at: string;
  updated_at: string;
  approvals?: PostApproval[];
}

export interface PostApproval {
  id: string;
  post_id: string;
  reviewer_id: string;
  reviewer?: UserProfile;
  decision: ApprovalDecision;
  feedback_notes?: string;
  reviewed_at: string;
}

export interface AutomationRule {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  trigger_type: string;
  conditions: Array<{
    field: string;
    operator: string;
    value?: any;
    values?: any[];
  }>;
  actions: Array<{
    action: string;
    [key: string]: any;
  }>;
}

export interface SupervisorMetricSummary {
  active_queue_count: number;
  open_tickets_count: number;
  urgent_tickets_count: number;
  avg_first_response_time_seconds: number;
  avg_resolution_time_minutes: number;
  csat_score: number;
  online_agents_count: number;
  busy_agents_count: number;
}
