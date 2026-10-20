'use client';

// ==============================================================================
// EHY Connect — Master Social Media Studio (Hootsuite Pillar Container)
// Module: components/studio/social-studio.tsx
// Specialists: UI Designer & Senior Developer
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { SocialPost, UserProfile } from '@/types';
import { PostComposer } from './post-composer';
import { ContentCalendar } from './content-calendar';
import { CommentModerator } from './comment-moderator';
import { ApprovalQueue } from './approval-queue';

interface SocialStudioProps {
  currentUser?: UserProfile;
}

export const SocialStudio: React.FC<SocialStudioProps> = ({
  currentUser: initialUser,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    initialUser || {
      id: '44444444-4444-4444-4444-444444444444',
      organization_id: 'org_enterprise_sa',
      email: 'nour.smm@ehyconnect.com',
      full_name: 'نور الصباح (Nour Al-Sabah)',
      role: 'social_manager',
      is_online: true,
      is_active: true,
    }
  );

  useEffect(() => {
    if (initialUser) setCurrentUser(initialUser);
  }, [initialUser]);

  const [activeTab, setActiveTab] = useState<'composer' | 'calendar' | 'moderation' | 'approvals'>('composer');

  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: 'p1',
      organization_id: 'org_demo',
      author_id: '44444444-4444-4444-4444-444444444444',
      content: 'كيف تضاعف مبيعات متجرك الإلكتروني عبر واتساب للأعمال في 3 خطوات بسيطة؟ 🚀',
      media_urls: ['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800'],
      target_platforms: [{ platform: 'instagram', channel_id: 'ch_ig' }, { platform: 'facebook', channel_id: 'ch_fb' }],
      status: 'pending_approval',
      scheduled_for: '2026-10-22T10:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'p2',
      organization_id: 'org_demo',
      author_id: '44444444-4444-4444-4444-444444444444',
      content: 'شاهد كيف يعمل محرك EHY Connect لتوحيد جميع رسائل السوشيال ميديا في شاشة واحدة 🔥',
      media_urls: ['https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'],
      target_platforms: [{ platform: 'tiktok', channel_id: 'ch_tt' }, { platform: 'instagram', channel_id: 'ch_ig' }],
      status: 'published',
      scheduled_for: '2026-10-20T12:00:00Z',
      published_at: '2026-10-20T12:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'p3',
      organization_id: 'org_demo',
      author_id: '44444444-4444-4444-4444-444444444444',
      content: 'نعلن رسمياً عن إطلاق ميزة الردود المقترحة بالذكاء الاصطناعي في EHY Connect! وفر 60% من وقت فريق خدمة العملاء.',
      media_urls: ['https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800'],
      target_platforms: [{ platform: 'facebook', channel_id: 'ch_fb' }, { platform: 'youtube', channel_id: 'ch_yt' }],
      status: 'scheduled',
      scheduled_for: '2026-10-24T16:00:00Z',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const handleCreatePost = (newPost: Partial<SocialPost>, requiresApproval: boolean) => {
    const post: SocialPost = {
      id: 'p_' + Date.now(),
      organization_id: 'org_demo',
      author_id: currentUser.id,
      content: newPost.content || '',
      media_urls: newPost.media_urls || [],
      target_platforms: newPost.target_platforms || [],
      status: requiresApproval ? 'pending_approval' : newPost.status || 'scheduled',
      scheduled_for: newPost.scheduled_for,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPosts((prev) => [post, ...prev]);
    if (requiresApproval) {
      alert('تم تقديم مسودة المنشور بنجاح! تم تحويلها لطابور الموافقات لاعتمادها من قبل المشرف.');
      setActiveTab('approvals');
    } else {
      alert('تمت جدولة المنشور بنجاح في تقويم المحتوى!');
      setActiveTab('calendar');
    }
  };

  const handleDecision = (postId: string, decision: 'approved' | 'rejected' | 'changes_requested') => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            status: decision === 'approved' ? 'scheduled' : 'draft',
          };
        }
        return p;
      })
    );
  };

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-neutral-950 font-sans">
      {/* Social Studio Navigation Tabs */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center gap-6 text-xs font-bold">
        {[
          { id: 'composer', label: 'محرر المنشورات (Composer)', icon: '📝' },
          { id: 'calendar', label: 'تقويم المحتوى (Calendar)', icon: '📅' },
          { id: 'moderation', label: 'إدارة التعليقات (Comments)', icon: '💬' },
          { id: 'approvals', label: 'طابور الموافقات (Approvals)', icon: '⚖️', count: posts.filter((p) => p.status === 'pending_approval').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tab Screen */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'composer' && (
          <PostComposer currentUser={currentUser} onSubmitPost={handleCreatePost} />
        )}
        {activeTab === 'calendar' && (
          <ContentCalendar posts={posts} onNewPostClick={() => setActiveTab('composer')} />
        )}
        {activeTab === 'moderation' && <CommentModerator />}
        {activeTab === 'approvals' && (
          <ApprovalQueue currentUser={currentUser} posts={posts} onDecision={handleDecision} />
        )}
      </div>
    </div>
  );
};
