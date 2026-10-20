'use client';

// ==============================================================================
// EHY Connect — Master Omnichannel Contact Center & Inbox (MindBehind Hub)
// Module: components/inbox/unified-inbox.tsx
// Specialist: Frontend Developer & Systems Architect
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Conversation, UserProfile, Message } from '@/types';
import { ConversationList } from './conversation-list';
import { ChatPane } from './chat-pane';
import { CustomerSidebar } from './customer-sidebar';
import { LockManager } from '@/lib/services/lock-manager';

interface UnifiedInboxProps {
  initialConversations?: Conversation[];
  currentUser?: UserProfile;
  availableAgents?: UserProfile[];
}

export const UnifiedInbox: React.FC<UnifiedInboxProps> = ({
  initialConversations,
  currentUser: initialUser,
  availableAgents: initialAgents,
}) => {
  // Default fallback mock user (Ahmed - Agent)
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    initialUser || {
      id: '33333333-3333-3333-3333-333333333333',
      organization_id: 'org_enterprise_sa',
      email: 'ahmed.agent@ehyconnect.com',
      full_name: 'أحمد زكي (Ahmed Zaki)',
      role: 'agent',
      is_online: true,
      is_active: true,
    }
  );

  useEffect(() => {
    if (initialUser) setCurrentUser(initialUser);
  }, [initialUser]);

  const [availableAgents] = useState<UserProfile[]>(
    initialAgents || [
      {
        id: '11111111-1111-1111-1111-111111111111',
        organization_id: 'org_demo',
        email: 'khalid.admin@ehyconnect.com',
        full_name: 'خالد المنصور (Khalid Al-Mansoor)',
        role: 'admin',
        is_online: true,
        is_active: true,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        organization_id: 'org_demo',
        email: 'layla.supervisor@ehyconnect.com',
        full_name: 'ليلى حسن (Layla Hassan)',
        role: 'supervisor',
        is_online: true,
        is_active: true,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        organization_id: 'org_demo',
        email: 'ahmed.agent@ehyconnect.com',
        full_name: 'أحمد زكي (Ahmed Zaki)',
        role: 'agent',
        is_online: true,
        is_active: true,
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        organization_id: 'org_demo',
        email: 'nour.smm@ehyconnect.com',
        full_name: 'نور الصباح (Nour Al-Sabah)',
        role: 'social_manager',
        is_online: true,
        is_active: true,
      },
    ]
  );

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations || [
      {
        id: 'd1111111-1111-1111-1111-111111111111',
        organization_id: 'org_demo',
        channel_id: 'c1',
        channel: {
          id: 'c1',
          organization_id: 'org_demo',
          platform: 'whatsapp',
          account_id: 'waba_1',
          account_name: 'WhatsApp Cloud API (Saudi Number)',
          status: 'connected',
        },
        assigned_agent_id: '33333333-3333-3333-3333-333333333333',
        assigned_agent: {
          id: '33333333-3333-3333-3333-333333333333',
          organization_id: 'org_demo',
          email: 'ahmed.agent@ehyconnect.com',
          full_name: 'أحمد زكي (Ahmed Zaki)',
          role: 'agent',
          is_online: true,
          is_active: true,
        },
        customer_identifier: '+966551234567',
        customer_name: 'عبدالعزيز الشمري',
        customer_avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        status: 'open',
        priority: 'high',
        tags: ['مبيعات', 'عرض_سعر'],
        unread_count: 1,
        sentiment: 'positive',
        last_message_preview: 'السلام عليكم، نحتاج عرض سعر رسمي لباقة 25 موظف ومميزات الأتمتة المتقدمة.',
        last_message_at: new Date(Date.now() - 5 * 60000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
        active_lock: null,
        messages: [
          {
            id: 'm1',
            conversation_id: 'd1111111-1111-1111-1111-111111111111',
            organization_id: 'org_demo',
            direction: 'inbound',
            content: 'مرحباً، اطلعت على منصة EHY Connect ومهتم بالاشتراك لشركتنا في الرياض.',
            delivery_status: 'read',
            created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          },
          {
            id: 'm2',
            conversation_id: 'd1111111-1111-1111-1111-111111111111',
            organization_id: 'org_demo',
            sender_id: '33333333-3333-3333-3333-333333333333',
            direction: 'outbound',
            content: 'أهلاً بك أستاذ عبدالعزيز، يسعدنا تواصلك معنا! بالتأكيد باقة الشركات تدعم حتى 50 موظفاً مع ربط واتساب الرسمي وتوزيع التذاكر التلقائي.',
            delivery_status: 'read',
            created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          },
          {
            id: 'm3',
            conversation_id: 'd1111111-1111-1111-1111-111111111111',
            organization_id: 'org_demo',
            direction: 'inbound',
            content: 'السلام عليكم، نحتاج عرض سعر رسمي لباقة 25 موظف ومميزات الأتمتة المتقدمة.',
            delivery_status: 'delivered',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          },
        ],
      },
      {
        id: 'd2222222-2222-2222-2222-222222222222',
        organization_id: 'org_demo',
        channel_id: 'c2',
        channel: {
          id: 'c2',
          organization_id: 'org_demo',
          platform: 'instagram',
          account_id: 'ig_1',
          account_name: 'Instagram Direct (@ehy_connect)',
          status: 'connected',
        },
        assigned_agent_id: '22222222-2222-2222-2222-222222222222',
        customer_identifier: 'ig_sarah_ksa',
        customer_name: 'سارة الغامدي',
        customer_avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
        status: 'open',
        priority: 'medium',
        tags: ['إنستغرام', 'دعم_المتجر'],
        unread_count: 0,
        sentiment: 'neutral',
        last_message_preview: 'هل يمكن ربط رسائل المتجر المباشرة مع فريق المبيعات فوراً؟',
        last_message_at: new Date(Date.now() - 2 * 60000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
        // Active Collision Lock by Layla Hassan to test lockout behavior
        active_lock: {
          conversation_id: 'd2222222-2222-2222-2222-222222222222',
          organization_id: 'org_demo',
          agent_id: '22222222-2222-2222-2222-222222222222',
          agent_name: 'ليلى حسن (Supervisor)',
          locked_at: new Date(Date.now() - 30000).toISOString(),
          expires_at: new Date(Date.now() + 90000).toISOString(),
          heartbeat_at: new Date(Date.now() - 30000).toISOString(),
        },
        messages: [
          {
            id: 'm21',
            conversation_id: 'd2222222-2222-2222-2222-222222222222',
            organization_id: 'org_demo',
            direction: 'inbound',
            content: 'مساء الخير، هل يمكن ربط رسائل المتجر المباشرة مع فريق المبيعات فوراً؟',
            delivery_status: 'delivered',
            created_at: new Date(Date.now() - 2 * 60000).toISOString(),
          },
        ],
      },
      {
        id: 'd3333333-3333-3333-3333-333333333333',
        organization_id: 'org_demo',
        channel_id: 'c3',
        channel: {
          id: 'c3',
          organization_id: 'org_demo',
          platform: 'facebook',
          account_id: 'fb_1',
          account_name: 'Facebook Page Messenger',
          status: 'connected',
        },
        assigned_agent_id: '22222222-2222-2222-2222-222222222222',
        customer_identifier: 'fb_user_mohamed',
        customer_name: 'محمد باقادر',
        customer_avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        status: 'open',
        priority: 'urgent',
        tags: ['شكوى', 'عاجل'],
        unread_count: 2,
        sentiment: 'negative',
        last_message_preview: 'أرسلت لكم منذ ساعتين ولم يرد أحد، الإعلانات نشطة وتكلفنا مبالغ كبيرة!',
        last_message_at: new Date(Date.now() - 20 * 60000).toISOString(),
        created_at: new Date(Date.now() - 10800000).toISOString(),
        active_lock: null,
        messages: [
          {
            id: 'm31',
            conversation_id: 'd3333333-3333-3333-3333-333333333333',
            organization_id: 'org_demo',
            direction: 'inbound',
            content: 'أرسلت لكم منذ ساعتين ولم يرد أحد، الإعلانات نشطة وتكلفنا مبالغ كبيرة!',
            delivery_status: 'delivered',
            created_at: new Date(Date.now() - 20 * 60000).toISOString(),
          },
          {
            id: 'm32',
            conversation_id: 'd3333333-3333-3333-3333-333333333333',
            organization_id: 'org_demo',
            direction: 'internal_note',
            content: 'ملاحظة للمشرف: تم تصعيد العميل لإعطائه الأولوية وتفادي الشكوى العلنية.',
            delivery_status: 'sent',
            created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          },
        ],
      },
    ]
  );

  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const selectedConversation = conversations.find((c) => c.id === selectedId) || conversations[0];

  // Try acquiring lock when selecting a conversation
  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      setSelectedId(conv.id);

      // Attempt to acquire lock for current agent if not locked by someone else
      const lockRes = await LockManager.acquireLock(conv.id, currentUser.id, currentUser.full_name);

      if (lockRes.success) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv.id
              ? {
                  ...c,
                  active_lock: {
                    conversation_id: c.id,
                    organization_id: c.organization_id,
                    agent_id: currentUser.id,
                    agent_name: currentUser.full_name,
                    locked_at: new Date().toISOString(),
                    expires_at: lockRes.expires_at || new Date(Date.now() + 120000).toISOString(),
                    heartbeat_at: new Date().toISOString(),
                  },
                }
              : c
          )
        );
      }
    },
    [currentUser]
  );

  // Send message handler
  const handleSendMessage = useCallback(
    (content: string, isInternalNote: boolean) => {
      if (!selectedConversation) return;

      const newMsg: Message = {
        id: 'msg_' + Date.now(),
        conversation_id: selectedConversation.id,
        organization_id: selectedConversation.organization_id,
        sender_id: currentUser.id,
        direction: isInternalNote ? 'internal_note' : 'outbound',
        content,
        delivery_status: 'sent',
        created_at: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedConversation.id) {
            return {
              ...c,
              last_message_preview: isInternalNote ? c.last_message_preview : content,
              last_message_at: new Date().toISOString(),
              messages: [...(c.messages || []), newMsg],
            };
          }
          return c;
        })
      );
    },
    [selectedConversation, currentUser]
  );

  // Supervisor Override Lock
  const handleOverrideLock = useCallback(
    async (conversationId: string) => {
      await LockManager.forceOverrideLock(conversationId, currentUser.id, currentUser.full_name);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              active_lock: {
                conversation_id: c.id,
                organization_id: c.organization_id,
                agent_id: currentUser.id,
                agent_name: currentUser.full_name,
                locked_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 120000).toISOString(),
                heartbeat_at: new Date().toISOString(),
              },
            };
          }
          return c;
        })
      );
    },
    [currentUser]
  );

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === 'open' && c.status !== 'open') return false;
    if (activeFilter === 'urgent' && c.priority !== 'urgent') return false;
    if (activeFilter === 'locked' && !c.active_lock) return false;
    if (
      searchQuery &&
      !c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex overflow-hidden w-full h-full bg-neutral-100 dark:bg-neutral-950 font-sans">
      {/* Main 3-Pane Contact Center Body */}
      {/* Pane 1: Conversations List */}
      <ConversationList
        conversations={filteredConversations}
          selectedId={selectedId}
          onSelect={handleSelectConversation}
          currentUserId={currentUser.id}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Pane 2: Active Chat Pane & Collision Control */}
        {selectedConversation ? (
          <ChatPane
            conversation={selectedConversation}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onOverrideLock={handleOverrideLock}
            onStatusChange={(status) => {
              setConversations((prev) =>
                prev.map((c) => (c.id === selectedConversation.id ? { ...c, status } : c))
              );
            }}
            onAssignChange={(agentId) => {
              setConversations((prev) =>
                prev.map((c) => (c.id === selectedConversation.id ? { ...c, assigned_agent_id: agentId } : c))
              );
            }}
            availableAgents={availableAgents}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-400">
            حدد محادثة لبدء المتابعة
          </div>
        )}

        {/* Pane 3: Customer CRM Metadata Drawer */}
        {selectedConversation && (
          <CustomerSidebar conversation={selectedConversation} />
        )}
      </div>
    );
  };
