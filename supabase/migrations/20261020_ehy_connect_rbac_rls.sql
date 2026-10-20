-- ==============================================================================
-- EHY Connect — Row Level Security (RLS) & RBAC Security Policies
-- Migration: 20261020_ehy_connect_rbac_rls.sql
-- Description: Zero-trust multi-tenant isolation & role-based security policies
-- Specialist: Application Security Engineer (AppSec)
-- Stack: PostgreSQL 15+ / Supabase Auth
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL TABLES
-- ==============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. SECURITY DEFINER HELPER FUNCTIONS (Optimized Cache-Friendly Lookups)
-- ==============================================================================

-- Extract Current User's Organization ID
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Extract Current User's RBAC Role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if Current User is Admin or Supervisor
CREATE OR REPLACE FUNCTION is_admin_or_supervisor()
RETURNS BOOLEAN AS $$
    SELECT role IN ('admin', 'supervisor') FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if Current User is Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'admin' FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. ORGANIZATIONS POLICIES
-- ==============================================================================

-- Select: Users can view their own organization
CREATE POLICY "org_select_policy" ON organizations
    FOR SELECT USING (id = current_user_org_id());

-- Update: Only Admin can update organization details
CREATE POLICY "org_update_policy" ON organizations
    FOR UPDATE USING (id = current_user_org_id() AND is_admin());

-- ==============================================================================
-- 4. PROFILES POLICIES
-- ==============================================================================

-- Select: Users can view all team members in their organization
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (organization_id = current_user_org_id());

-- Insert: Admins can provision new users; or user can insert their own record on signup
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (
        id = auth.uid() OR is_admin()
    );

-- Update: Users can update their own personal details; Admins can update roles
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (
        (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
        OR (organization_id = current_user_org_id() AND is_admin())
    );

-- ==============================================================================
-- 5. CHANNELS (CONNECTED ACCOUNTS) POLICIES
-- ==============================================================================

-- Select: All authenticated organization members can view channels
CREATE POLICY "channels_select_policy" ON channels
    FOR SELECT USING (organization_id = current_user_org_id());

-- Insert/Update/Delete: Only Admins can connect or modify accounts
CREATE POLICY "channels_admin_modify_policy" ON channels
    FOR ALL USING (organization_id = current_user_org_id() AND is_admin());

-- ==============================================================================
-- 6. CONVERSATIONS & TICKETS POLICIES
-- ==============================================================================

-- Select:
-- - Admins & Supervisors: View all in organization
-- - Agents: View assigned to them, unassigned tickets, or tickets assigned to their team
-- - Social Media Managers: View conversations linked to social comments
CREATE POLICY "conversations_select_policy" ON conversations
    FOR SELECT USING (
        organization_id = current_user_org_id()
        AND (
            is_admin_or_supervisor()
            OR assigned_agent_id = auth.uid()
            OR assigned_agent_id IS NULL
            OR assigned_team_id IN (
                SELECT team_id FROM team_members WHERE user_id = auth.uid()
            )
            OR current_user_role() = 'social_manager'
        )
    );

-- Update: Agents can update assigned tickets; Supervisors & Admins can update all
CREATE POLICY "conversations_update_policy" ON conversations
    FOR UPDATE USING (
        organization_id = current_user_org_id()
        AND (
            is_admin_or_supervisor()
            OR assigned_agent_id = auth.uid()
            OR assigned_agent_id IS NULL
        )
    );

-- Insert: Authenticated members or background services
CREATE POLICY "conversations_insert_policy" ON conversations
    FOR INSERT WITH CHECK (organization_id = current_user_org_id());

-- ==============================================================================
-- 7. MESSAGES STREAM POLICIES
-- ==============================================================================

-- Select: Users can view messages of accessible conversations
CREATE POLICY "messages_select_policy" ON messages
    FOR SELECT USING (
        organization_id = current_user_org_id()
        AND EXISTS (
            SELECT 1 FROM conversations c
            WHERE c.id = messages.conversation_id
            AND c.organization_id = current_user_org_id()
        )
    );

-- Insert: Agents and managers can post outbound replies and internal notes
CREATE POLICY "messages_insert_policy" ON messages
    FOR INSERT WITH CHECK (
        organization_id = current_user_org_id()
        AND (
            direction = 'inbound' -- Webhook system role
            OR is_admin_or_supervisor()
            OR sender_id = auth.uid()
        )
    );

-- ==============================================================================
-- 8. AGENT COLLISION LOCKS & ATOMIC LOCK FUNCTIONS
-- ==============================================================================

CREATE POLICY "locks_select_policy" ON agent_locks
    FOR SELECT USING (organization_id = current_user_org_id());

CREATE POLICY "locks_manage_policy" ON agent_locks
    FOR ALL USING (organization_id = current_user_org_id());

-- Function: Atomic Lock Acquisition
CREATE OR REPLACE FUNCTION acquire_conversation_lock(
    target_conversation_id UUID,
    lock_duration_seconds INT DEFAULT 120
)
RETURNS JSONB AS $$
DECLARE
    current_agent_id UUID;
    caller_org_id UUID;
    existing_lock agent_locks%ROWTYPE;
    result JSONB;
BEGIN
    current_agent_id := auth.uid();
    caller_org_id := current_user_org_id();

    IF current_agent_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'reason', 'unauthenticated');
    END IF;

    -- Clean up any expired locks on this conversation
    DELETE FROM agent_locks 
    WHERE conversation_id = target_conversation_id 
    AND expires_at < NOW();

    -- Check for existing active lock
    SELECT * INTO existing_lock 
    FROM agent_locks 
    WHERE conversation_id = target_conversation_id;

    IF FOUND THEN
        IF existing_lock.agent_id = current_agent_id THEN
            -- Renew current agent's lock
            UPDATE agent_locks 
            SET expires_at = NOW() + (lock_duration_seconds || ' seconds')::INTERVAL,
                heartbeat_at = NOW()
            WHERE conversation_id = target_conversation_id;

            RETURN jsonb_build_object(
                'success', true, 
                'status', 'renewed',
                'expires_at', NOW() + (lock_duration_seconds || ' seconds')::INTERVAL
            );
        ELSE
            -- Locked by another agent
            RETURN jsonb_build_object(
                'success', false, 
                'reason', 'locked_by_other',
                'locked_by_agent_id', existing_lock.agent_id,
                'expires_at', existing_lock.expires_at
            );
        END IF;
    ELSE
        -- Insert new lock atomically
        INSERT INTO agent_locks (conversation_id, organization_id, agent_id, locked_at, expires_at, heartbeat_at)
        VALUES (
            target_conversation_id, 
            caller_org_id, 
            current_agent_id, 
            NOW(), 
            NOW() + (lock_duration_seconds || ' seconds')::INTERVAL, 
            NOW()
        );

        RETURN jsonb_build_object(
            'success', true, 
            'status', 'acquired',
            'expires_at', NOW() + (lock_duration_seconds || ' seconds')::INTERVAL
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Heartbeat Lock Renewal
CREATE OR REPLACE FUNCTION heartbeat_conversation_lock(
    target_conversation_id UUID,
    extend_seconds INT DEFAULT 120
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE agent_locks
    SET expires_at = NOW() + (extend_seconds || ' seconds')::INTERVAL,
        heartbeat_at = NOW()
    WHERE conversation_id = target_conversation_id
    AND agent_id = auth.uid();

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Release Lock
CREATE OR REPLACE FUNCTION release_conversation_lock(
    target_conversation_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM agent_locks
    WHERE conversation_id = target_conversation_id
    AND (agent_id = auth.uid() OR is_admin_or_supervisor());

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. SOCIAL POSTS & EDITORIAL APPROVAL POLICIES (Hootsuite Pillar)
-- ==============================================================================

-- Select: All org members can view social posts
CREATE POLICY "posts_select_policy" ON social_posts
    FOR SELECT USING (organization_id = current_user_org_id());

-- Insert: Social Managers, Agents, Supervisors, Admins can create drafts
CREATE POLICY "posts_insert_policy" ON social_posts
    FOR INSERT WITH CHECK (
        organization_id = current_user_org_id()
        AND author_id = auth.uid()
        AND (
            status = 'draft' 
            OR status = 'pending_approval' 
            OR is_admin_or_supervisor()
        )
    );

-- Update: 
-- - Authors can modify their own drafts
-- - Only Supervisors & Admins can change status to 'approved' or 'scheduled'
CREATE POLICY "posts_update_policy" ON social_posts
    FOR UPDATE USING (
        organization_id = current_user_org_id()
        AND (
            is_admin_or_supervisor()
            OR (author_id = auth.uid() AND status IN ('draft', 'changes_requested'))
        )
    );

-- Post Approvals: Viewable by org, insertable only by Supervisors and Admins
CREATE POLICY "approvals_select_policy" ON post_approvals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM social_posts p 
            WHERE p.id = post_approvals.post_id 
            AND p.organization_id = current_user_org_id()
        )
    );

CREATE POLICY "approvals_insert_policy" ON post_approvals
    FOR INSERT WITH CHECK (
        is_admin_or_supervisor()
        AND reviewer_id = auth.uid()
    );

-- ==============================================================================
-- 10. AUTOMATION RULES & AUDIT LOGS POLICIES
-- ==============================================================================

-- Automation Rules: Visible to Supervisors & Admins; manageable only by Admin
CREATE POLICY "automation_select_policy" ON automation_rules
    FOR SELECT USING (
        organization_id = current_user_org_id() 
        AND is_admin_or_supervisor()
    );

CREATE POLICY "automation_modify_policy" ON automation_rules
    FOR ALL USING (
        organization_id = current_user_org_id() 
        AND is_admin()
    );

-- Audit Logs: Viewable only by Admins & Supervisors
CREATE POLICY "audit_select_policy" ON audit_logs
    FOR SELECT USING (
        organization_id = current_user_org_id() 
        AND is_admin_or_supervisor()
    );

CREATE POLICY "audit_insert_policy" ON audit_logs
    FOR INSERT WITH CHECK (
        organization_id = current_user_org_id()
    );
