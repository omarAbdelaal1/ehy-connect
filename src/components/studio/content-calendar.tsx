'use client';

// ==============================================================================
// EHY Connect — Interactive Content Calendar & Scheduler (Hootsuite Pillar)
// Module: components/studio/content-calendar.tsx
// Specialists: UI Designer & Senior Developer
// ==============================================================================

import React, { useState, memo } from 'react';
import { SocialPost } from '@/types';

interface ContentCalendarProps {
  posts: SocialPost[];
  onSelectPost?: (post: SocialPost) => void;
  onNewPostClick?: () => void;
}

export const ContentCalendar: React.FC<ContentCalendarProps> = memo(({
  posts: initialPosts,
  onSelectPost,
  onNewPostClick,
}) => {
  const [posts] = useState<SocialPost[]>(
    initialPosts || [
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
    ]
  );

  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'published' | 'pending_approval'>('all');
  const [selectedPostModal, setSelectedPostModal] = useState<SocialPost | null>(null);

  const daysOfWeek = ['الأحد (Sun)', 'الإثنين (Mon)', 'الثلاثاء (Tue)', 'الأربعاء (Wed)', 'الخميس (Thu)', 'الجمعة (Fri)', 'السبت (Sat)'];

  // Days 19 through 25 of October 2026
  const calendarDays = [
    { dayNumber: 18, isCurrentMonth: true },
    { dayNumber: 19, isCurrentMonth: true },
    { dayNumber: 20, isCurrentMonth: true, isToday: true },
    { dayNumber: 21, isCurrentMonth: true },
    { dayNumber: 22, isCurrentMonth: true },
    { dayNumber: 23, isCurrentMonth: true },
    { dayNumber: 24, isCurrentMonth: true },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📸';
      case 'facebook': return '👤';
      case 'tiktok': return '🎵';
      case 'youtube': return '▶️';
      default: return '🌐';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">منشور (Published)</span>;
      case 'scheduled':
        return <span className="px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">مجدول (Scheduled)</span>;
      case 'pending_approval':
        return <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px]">ينتظر الموافقة</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600 text-[10px]">مسودة</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>📅</span>
            <span>تقويم المحتوى التسويقي وجدول النشر (Content Calendar)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            أكتوبر 2026 — استعراض شامل لكافة المنشورات المجدولة والمسودات ونظام الموافقات التحريرية
          </p>
        </div>

        {/* Filter Controls & New Post Button */}
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'scheduled', 'published', 'pending_approval'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setActiveFilter(filterKey)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  activeFilter === filterKey
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {filterKey === 'all' && 'الكل'}
                {filterKey === 'scheduled' && 'المجدولة'}
                {filterKey === 'published' && 'المنشورة'}
                {filterKey === 'pending_approval' && 'بانتظار الاعتماد'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onNewPostClick}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ إنشاء منشور جديد</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid (Weekly Overview View) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/40 text-center text-xs font-bold text-neutral-600 dark:text-neutral-300 py-3">
          {daysOfWeek.map((day, i) => (
            <div key={i}>{day}</div>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 min-h-[420px] divide-x divide-neutral-200 dark:divide-neutral-800 divide-x-reverse">
          {calendarDays.map((calDay, idx) => {
            // Find posts matching this day (mock mapping)
            const dayPosts = posts.filter((p) => {
              if (activeFilter !== 'all' && p.status !== activeFilter) return false;
              if (calDay.dayNumber === 20 && p.status === 'published') return true;
              if (calDay.dayNumber === 22 && p.status === 'pending_approval') return true;
              if (calDay.dayNumber === 24 && p.status === 'scheduled') return true;
              return false;
            });

            return (
              <div
                key={idx}
                className={`p-2 flex flex-col space-y-2 border-b border-neutral-200 dark:border-neutral-800 transition-colors ${
                  calDay.isToday ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : 'hover:bg-neutral-50/40 dark:hover:bg-neutral-800/20'
                }`}
              >
                {/* Day Number */}
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                      calDay.isToday
                        ? 'bg-indigo-600 text-white'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {calDay.dayNumber}
                  </span>
                  {calDay.isToday && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">اليوم</span>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPostModal(post)}
                      className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800 text-xs shadow-xs hover:border-indigo-500 cursor-pointer transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {post.target_platforms.map((tp, i) => (
                            <span key={i} title={tp.platform}>
                              {getPlatformIcon(tp.platform)}
                            </span>
                          ))}
                        </div>
                        {getStatusBadge(post.status)}
                      </div>

                      <p className="text-[11px] text-neutral-800 dark:text-neutral-200 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>

                      <div className="text-[10px] text-neutral-400 font-mono">
                        ⏰ {post.scheduled_for ? new Date(post.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 ص'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPostModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <span>تفاصيل المنشور المجدول</span>
                {getStatusBadge(selectedPostModal.status)}
              </h3>
              <button
                onClick={() => setSelectedPostModal(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
              {selectedPostModal.content}
            </p>

            {selectedPostModal.media_urls?.[0] && (
              <div className="rounded-xl overflow-hidden h-40 bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={selectedPostModal.media_urls[0]}
                  alt="post-media"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-2">
              <div>
                المنصات المستهدفة:{' '}
                {selectedPostModal.target_platforms.map((tp) => tp.platform).join(', ')}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPostModal(null)}
                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ContentCalendar.displayName = 'ContentCalendar';
