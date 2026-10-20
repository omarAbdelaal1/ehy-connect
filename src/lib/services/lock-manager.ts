// ==============================================================================
// EHY Connect — Real-time Agent Collision Lock Service
// Module: lib/services/lock-manager.ts
// Specialist: Backend Architect & AppSec Engineer
// Description: Concurrency control preventing duplicate responses to customers
// ==============================================================================

import { AgentLock } from '@/types';

export interface LockAcquisitionResult {
  success: boolean;
  status?: 'acquired' | 'renewed';
  reason?: 'unauthenticated' | 'locked_by_other' | 'error';
  locked_by_agent_id?: string;
  locked_by_agent_name?: string;
  expires_at?: string;
  remaining_seconds?: number;
}

export class LockManager {
  private static DEFAULT_LOCK_DURATION_SECONDS = 120;
  private static inMemoryLocks: Map<string, AgentLock> = new Map();

  /**
   * Acquire or renew a lock on a conversation.
   * If running with Supabase client, invokes the Postgres atomic function `acquire_conversation_lock`.
   * Otherwise falls back to safe in-memory simulator.
   */
  public static async acquireLock(
    conversationId: string,
    agentId: string,
    agentName: string,
    supabaseClient?: any,
    durationSeconds = this.DEFAULT_LOCK_DURATION_SECONDS
  ): Promise<LockAcquisitionResult> {
    const now = new Date();

    // 1. Production Mode: PostgreSQL / Supabase RPC
    if (supabaseClient && typeof supabaseClient.rpc === 'function') {
      try {
        const { data, error } = await supabaseClient.rpc('acquire_conversation_lock', {
          target_conversation_id: conversationId,
          lock_duration_seconds: durationSeconds,
        });

        if (error) {
          console.error('[LockManager] Supabase RPC Error:', error);
          return { success: false, reason: 'error' };
        }

        return data as LockAcquisitionResult;
      } catch (err) {
        console.error('[LockManager] Exception calling RPC:', err);
      }
    }

    // 2. Resilient Sandbox / Fallback Mode (Deterministic in-memory lock table)
    const existing = this.inMemoryLocks.get(conversationId);

    if (existing) {
      const expiresAt = new Date(existing.expires_at);
      if (expiresAt > now) {
        if (existing.agent_id === agentId) {
          // Renew existing lock for current agent
          const newExpiresAt = new Date(now.getTime() + durationSeconds * 1000).toISOString();
          existing.expires_at = newExpiresAt;
          existing.heartbeat_at = now.toISOString();
          this.inMemoryLocks.set(conversationId, existing);

          return {
            success: true,
            status: 'renewed',
            expires_at: newExpiresAt,
            remaining_seconds: durationSeconds,
          };
        } else {
          // Locked by another agent!
          const remaining = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000));
          return {
            success: false,
            reason: 'locked_by_other',
            locked_by_agent_id: existing.agent_id,
            locked_by_agent_name: existing.agent_name || 'موظف آخر',
            expires_at: existing.expires_at,
            remaining_seconds: remaining,
          };
        }
      }
    }

    // Grant new lock
    const newExpiresAt = new Date(now.getTime() + durationSeconds * 1000).toISOString();
    const newLock: AgentLock = {
      conversation_id: conversationId,
      organization_id: 'org_demo',
      agent_id: agentId,
      agent_name: agentName,
      locked_at: now.toISOString(),
      expires_at: newExpiresAt,
      heartbeat_at: now.toISOString(),
    };

    this.inMemoryLocks.set(conversationId, newLock);

    return {
      success: true,
      status: 'acquired',
      expires_at: newExpiresAt,
      remaining_seconds: durationSeconds,
    };
  }

  /**
   * Send heartbeat to keep lock alive while agent is typing.
   */
  public static async sendHeartbeat(
    conversationId: string,
    agentId: string,
    supabaseClient?: any,
    extendSeconds = this.DEFAULT_LOCK_DURATION_SECONDS
  ): Promise<boolean> {
    if (supabaseClient && typeof supabaseClient.rpc === 'function') {
      try {
        const { data } = await supabaseClient.rpc('heartbeat_conversation_lock', {
          target_conversation_id: conversationId,
          extend_seconds: extendSeconds,
        });
        return !!data;
      } catch (err) {
        console.error('[LockManager] Heartbeat RPC Error:', err);
      }
    }

    const existing = this.inMemoryLocks.get(conversationId);
    if (existing && existing.agent_id === agentId) {
      const now = new Date();
      existing.expires_at = new Date(now.getTime() + extendSeconds * 1000).toISOString();
      existing.heartbeat_at = now.toISOString();
      this.inMemoryLocks.set(conversationId, existing);
      return true;
    }

    return false;
  }

  /**
   * Release lock when agent navigates away or resolves ticket.
   */
  public static async releaseLock(
    conversationId: string,
    agentId: string,
    supabaseClient?: any
  ): Promise<boolean> {
    if (supabaseClient && typeof supabaseClient.rpc === 'function') {
      try {
        const { data } = await supabaseClient.rpc('release_conversation_lock', {
          target_conversation_id: conversationId,
        });
        return !!data;
      } catch (err) {
        console.error('[LockManager] Release RPC Error:', err);
      }
    }

    const existing = this.inMemoryLocks.get(conversationId);
    if (existing && (existing.agent_id === agentId || !agentId)) {
      this.inMemoryLocks.delete(conversationId);
      return true;
    }

    return false;
  }

  /**
   * Supervisor or Admin force break lock to handle emergency tickets.
   */
  public static async forceOverrideLock(
    conversationId: string,
    supervisorId: string,
    supervisorName: string,
    supabaseClient?: any
  ): Promise<boolean> {
    // Release existing
    this.inMemoryLocks.delete(conversationId);
    // Acquire for supervisor
    const res = await this.acquireLock(conversationId, supervisorId, supervisorName, supabaseClient);
    return res.success;
  }

  /**
   * Helper: Check if conversation is locked by a different agent
   */
  public static isLockedByOther(
    lock: AgentLock | null | undefined,
    currentAgentId: string
  ): boolean {
    if (!lock) return false;
    const now = new Date();
    const expiresAt = new Date(lock.expires_at);
    if (expiresAt <= now) return false;
    return lock.agent_id !== currentAgentId;
  }

  /**
   * Helper: Calculate remaining TTL in seconds
   */
  public static getRemainingSeconds(lock: AgentLock | null | undefined): number {
    if (!lock) return 0;
    const now = new Date();
    const expiresAt = new Date(lock.expires_at);
    return Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000));
  }
}
