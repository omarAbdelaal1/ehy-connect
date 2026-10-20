-- ==============================================================================
-- EHY Connect — Master Database Schema Migration
-- Migration: 20261020_ehy_connect_core_schema.sql
-- Description: Core schema for Omnichannel Contact Center & Social Media Studio
-- Architect: Database Optimizer & AppSec Specialist
-- Stack: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUMS & DOMAINS
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'admin',
        'supervisor',
        'agent',
        'social_manager'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE channel_platform AS ENUM (
        'whatsapp',
        'instagram',
        'facebook',
        'tiktok',
        'youtube',
        'x_twitter',
        'linkedin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE channel_status AS ENUM (
        'connected',
        'disconnected',
        'expired',
        'error',
        'sandbox_test'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE conversation_status AS ENUM (
        'open',
        'pending',
        'resolved',
        'snoozed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE conversation_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_direction AS ENUM (
        'inbound',
        'outbound',
        'internal_note'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_delivery_status AS ENUM (
        'pending',
        'sent',
        'delivered',
        'read',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM (
        'draft',
        'pending_approval',
        'approved',
        'scheduled',
        'publishing',
        'published',
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE approval_decision AS ENUM (
        'approved',
        'rejected',
        'changes_requested'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. CORE MULTI-TENANCY & IDENTITY TABLES
-- ==============================================================================

-- Organizations Table (Tenant Isolation Root)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'enterprise',
    default_language VARCHAR(10) NOT NULL DEFAULT 'ar',
    logo_url TEXT,
    settings JSONB NOT NULL DEFAULT '{
        "operating_hours": {"start": "09:00", "end": "18:00", "timezone": "Asia/Riyadh"},
        "collision_timeout_seconds": 120,
        "auto_assign_enabled": true
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'agent',
    avatar_url TEXT,
    phone_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_online BOOLEAN NOT NULL DEFAULT false,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_email UNIQUE(organization_id, email)
);

-- Teams & Departments
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    lead_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Membership Mapping
CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- ==============================================================================
-- 3. CHANNELS & INTEGRATIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform channel_platform NOT NULL,
    account_id VARCHAR(255) NOT NULL, -- WABA Phone Number ID, IG Account ID, Page ID
    account_name VARCHAR(255) NOT NULL,
    account_handle VARCHAR(255),
    credentials_encrypted JSONB NOT NULL DEFAULT '{}'::jsonb,
    status channel_status NOT NULL DEFAULT 'connected',
    token_expires_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_channel UNIQUE(organization_id, platform, account_id)
);

-- ==============================================================================
-- 4. OMNICHANNEL CONTACT CENTER (MindBehind Pillar)
-- ==============================================================================

-- Conversations / Tickets
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE RESTRICT,
    assigned_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    customer_identifier VARCHAR(255) NOT NULL, -- WhatsApp Phone, IG User ID, FB PSID
    customer_name VARCHAR(255) NOT NULL DEFAULT 'عميل زائر',
    customer_avatar_url TEXT,
    status conversation_status NOT NULL DEFAULT 'open',
    priority conversation_priority NOT NULL DEFAULT 'medium',
    subject VARCHAR(500),
    tags TEXT[] NOT NULL DEFAULT '{}',
    unread_count INT NOT NULL DEFAULT 0,
    sentiment VARCHAR(20) DEFAULT 'neutral', -- positive, neutral, negative
    last_message_preview TEXT,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages (Omnichannel Inbound/Outbound Stream)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL if customer
    direction message_direction NOT NULL,
    content TEXT,
    media_attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    delivery_status message_delivery_status NOT NULL DEFAULT 'sent',
    platform_message_id VARCHAR(255), -- Meta wamid / Message ID for idempotency
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Collision Locks (Deterministic Real-time Lockout)
CREATE TABLE IF NOT EXISTS agent_locks (
    conversation_id UUID PRIMARY KEY REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. SOCIAL MEDIA STUDIO & SCHEDULER (Hootsuite Pillar)
-- ==============================================================================

-- Social Posts (Unified Cross-Platform Content)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_platforms JSONB NOT NULL, -- [{"platform": "instagram", "channel_id": "uuid", "type": "feed"}]
    status post_status NOT NULL DEFAULT 'draft',
    scheduled_for TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    publishing_results JSONB DEFAULT '{}'::jsonb,
    zernio_post_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Editorial Approvals Workflow
CREATE TABLE IF NOT EXISTS post_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    decision approval_decision NOT NULL,
    feedback_notes TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Post Comments (Moderation Triage)
CREATE TABLE IF NOT EXISTS social_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    platform_post_id VARCHAR(255) NOT NULL,
    platform_comment_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_avatar_url TEXT,
    content TEXT NOT NULL,
    sentiment VARCHAR(20) DEFAULT 'neutral',
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    converted_to_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    parent_comment_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. AUTOMATION & AUDIT LOGS
-- ==============================================================================

-- Automation Rules (Trigger -> Condition -> Action)
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    trigger_type VARCHAR(50) NOT NULL, -- message_received, post_created, sentiment_negative
    conditions JSONB NOT NULL DEFAULT '[]'::jsonb, -- keywords, channels, working_hours
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,    -- assign_agent, auto_reply, send_alert, apply_tag
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System & Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- lock_override, role_changed, post_approved, token_refreshed
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. PERFORMANCE INDEXES (Optimized for Query Plans)
-- ==============================================================================

-- Organizations & Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_org_role ON profiles(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON profiles(organization_id, is_online) WHERE is_online = true;

-- Conversations (Critical Indexing for Inbox Sorting & Filtering)
CREATE INDEX IF NOT EXISTS idx_conversations_org_status_updated 
    ON conversations(organization_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_agent 
    ON conversations(assigned_agent_id, status) WHERE status != 'resolved';
CREATE INDEX IF NOT EXISTS idx_conversations_channel 
    ON conversations(channel_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_customer 
    ON conversations(organization_id, customer_identifier);

-- Messages (Stream Retrieval & Deduplication)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON messages(conversation_id, created_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_platform_id 
    ON messages(platform_message_id) WHERE platform_message_id IS NOT NULL;

-- Agent Locks (Fast Lookup and Cleanup)
CREATE INDEX IF NOT EXISTS idx_agent_locks_expiry 
    ON agent_locks(expires_at ASC);
CREATE INDEX IF NOT EXISTS idx_agent_locks_agent 
    ON agent_locks(agent_id);

-- Social Posts & Calendar Scheduling
CREATE INDEX IF NOT EXISTS idx_posts_org_scheduled 
    ON social_posts(organization_id, scheduled_for ASC) 
    WHERE status IN ('scheduled', 'pending_approval');
CREATE INDEX IF NOT EXISTS idx_posts_status_published 
    ON social_posts(organization_id, status, published_at DESC);

-- Social Comments Moderation
CREATE INDEX IF NOT EXISTS idx_comments_post_created 
    ON social_comments(channel_id, platform_post_id, created_at DESC);

-- ==============================================================================
-- 8. AUTOMATED TIMESTAMPS TRIGGER
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_update_organizations BEFORE UPDATE ON organizations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_profiles BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_conversations BEFORE UPDATE ON conversations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_update_social_posts BEFORE UPDATE ON social_posts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null; END $$;
