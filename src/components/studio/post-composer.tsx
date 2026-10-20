'use client';

// ==============================================================================
// EHY Connect — Multi-Platform Social Post Composer & Live Preview
// Module: components/studio/post-composer.tsx
// Specialists: UI Designer & Senior Developer
// ==============================================================================

import React, { useState, memo } from 'react';
import { ChannelPlatform, SocialPost, UserProfile } from '@/types';

interface PostComposerProps {
  currentUser: UserProfile;
  onSubmitPost: (post: Partial<SocialPost>, requiresApproval: boolean) => void;
}

export const PostComposer: React.FC<PostComposerProps> = memo(({
  currentUser,
  onSubmitPost,
}) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800');
  const [selectedPlatforms, setSelectedPlatforms] = useState<ChannelPlatform[]>([
    'instagram',
    'facebook',
    'tiktok',
  ]);
  const [activePreviewTab, setActivePreviewTab] = useState<ChannelPlatform>('instagram');
  const [scheduledDate, setScheduledDate] = useState('2026-10-25T14:30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSupervisorOrAdmin = ['supervisor', 'admin'].includes(currentUser.role);

  const togglePlatform = (p: ChannelPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
    if (!selectedPlatforms.includes(p)) {
      setActivePreviewTab(p);
    }
  };

  const getCharLimit = (platform: ChannelPlatform) => {
    switch (platform) {
      case 'instagram': return 2200;
      case 'tiktok': return 2200;
      case 'facebook': return 5000;
      case 'youtube': return 5000;
      default: return 1000;
    }
  };

  const handleSubmit = (action: 'publish_now' | 'schedule' | 'submit_approval') => {
    if (!content.trim()) return;
    setIsSubmitting(true);

    const requiresApproval = !isSupervisorOrAdmin;
    const postPayload: Partial<SocialPost> = {
      content,
      media_urls: mediaUrl ? [mediaUrl] : [],
      target_platforms: selectedPlatforms.map((p) => ({
        platform: p,
        channel_id: 'ch_' + p,
        type: p === 'tiktok' ? 'video' : p === 'instagram' ? 'reel' : 'feed',
      })),
      status: requiresApproval ? 'pending_approval' : action === 'publish_now' ? 'published' : 'scheduled',
      scheduled_for: action === 'publish_now' ? new Date().toISOString() : new Date(scheduledDate).toISOString(),
    };

    setTimeout(() => {
      onSubmitPost(postPayload, requiresApproval);
      setContent('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950 p-6 gap-6 font-sans">
      {/* Column 1: Multi-Platform Editor Controls */}
      <div className="flex-1 space-y-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
        {/* Top Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>📝</span>
            <span>محرر المنشورات متعدد المنصات (Hootsuite Studio)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            صمم منشورك مرة واحدة وقم بنشره أو جدولته متزامناً عبر مختلف الشبكات الاجتماعية الرسمية
          </p>
        </div>

        {/* 1. Target Platforms Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            حدد الحسابات والمنصات المستهدفة:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'instagram', label: 'Instagram', icon: '📸', color: 'hover:border-pink-500 text-pink-600' },
              { id: 'facebook', label: 'Facebook', icon: '👤', color: 'hover:border-blue-500 text-blue-600' },
              { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'hover:border-neutral-700 text-neutral-900 dark:text-neutral-100' },
              { id: 'youtube', label: 'YouTube Shorts', icon: '▶️', color: 'hover:border-red-500 text-red-600' },
            ].map((p) => {
              const active = selectedPlatforms.includes(p.id as ChannelPlatform);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id as ChannelPlatform)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                  {active && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Content Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-neutral-700 dark:text-neutral-300">
              نص المنشور (Content Body):
            </label>
            <span className="font-mono text-neutral-400">
              {content.length} / {getCharLimit(activePreviewTab)} حرف
            </span>
          </div>

          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب المحتوى التسويقي هنا... يمكنك إضافة الهاشتاجات وروابط الحملات الترويجية."
            className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed"
          />
        </div>

        {/* 3. Media Asset Uploader */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            رابط الوسائط (صورة أو فيديو من الاستوديو):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://example.com/asset.jpg"
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
            <button
              type="button"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            >
              🖼️ مكتبة الوسائط
            </button>
          </div>
        </div>

        {/* 4. Scheduling Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            موعد الجدولة والنشر التلقائي:
          </label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* 5. Action Buttons & Role Guard */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            الدور الحالي:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400 uppercase">
              {currentUser.role}
            </strong>
          </div>

          <div className="flex items-center gap-2">
            {!isSupervisorOrAdmin ? (
              <button
                type="button"
                disabled={isSubmitting || !content.trim()}
                onClick={() => handleSubmit('submit_approval')}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>إرسال للمشرف للاعتماد (Submit for Approval)</span>
                <span>📋</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSubmitting || !content.trim()}
                  onClick={() => handleSubmit('schedule')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>جدولة في التقويم (Schedule)</span>
                  <span>📅</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !content.trim()}
                  onClick={() => handleSubmit('publish_now')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>نشر فوري الآن (Publish Now)</span>
                  <span>🚀</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column 2: Live Device Mockup Preview */}
      <div className="w-full lg:w-96 flex flex-col space-y-4">
        {/* Preview Platform Tabs */}
        <div className="flex bg-neutral-200/80 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
          {selectedPlatforms.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePreviewTab(p)}
              className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                activePreviewTab === p
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Live Device Phone Preview Container */}
        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 shadow-md max-w-sm mx-auto w-full">
          {/* Mock Phone Notch */}
          <div className="w-28 h-4 bg-neutral-200 dark:bg-neutral-800 rounded-full mx-auto mb-3" />

          {/* Platform Specific Mock */}
          {activePreviewTab === 'instagram' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-pink-600 p-0.5">
                    <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center font-bold text-[10px]">
                      E
                    </div>
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">ehy_connect_official</span>
                </div>
                <span className="text-neutral-400">•••</span>
              </div>

              {/* Media image */}
              <div className="w-full h-48 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center">
                {mediaUrl ? (
                  <img src={mediaUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-400">لا توجد وسائط</span>
                )}
              </div>

              {/* Engagement icons */}
              <div className="flex justify-between text-base px-1">
                <div className="flex gap-3">
                  <span>❤️</span>
                  <span>💬</span>
                  <span>↗️</span>
                </div>
                <span>🔖</span>
              </div>

              {/* Post caption */}
              <div className="px-1 space-y-1">
                <p className="text-[11px] text-neutral-800 dark:text-neutral-200 line-clamp-3">
                  <strong className="font-bold">ehy_connect_official</strong>{' '}
                  {content || 'معاينة نص المنشور ستظهر هنا تلقائياً أثناء الكتابة...'}
                </p>
                <span className="text-[10px] text-neutral-400">منذ دقيقة واحدة</span>
              </div>
            </div>
          )}

          {activePreviewTab === 'facebook' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  EHY
                </div>
                <div>
                  <div className="font-bold text-neutral-900 dark:text-white">EHY Connect Saudi Arabia</div>
                  <div className="text-[10px] text-neutral-400">الآن • 🌐 عام</div>
                </div>
              </div>

              <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {content || 'معاينة منشور صفحة فيسبوك...'}
              </p>

              {mediaUrl && (
                <div className="w-full h-40 rounded-lg overflow-hidden bg-neutral-100">
                  <img src={mediaUrl} alt="fb-preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex justify-around text-neutral-500 text-[11px]">
                <span>👍 أعجبني</span>
                <span>💬 تعليق</span>
                <span>🔄 مشاركة</span>
              </div>
            </div>
          )}

          {activePreviewTab === 'tiktok' && (
            <div className="relative h-80 rounded-2xl overflow-hidden bg-neutral-950 text-white p-3 flex flex-col justify-between">
              {mediaUrl ? (
                <img src={mediaUrl} alt="tt-preview" className="absolute inset-0 w-full h-full object-cover opacity-70" />
              ) : null}

              <div className="relative z-10 flex justify-between text-xs font-bold">
                <span>متابعة</span>
                <span className="text-neutral-300">لك (For You)</span>
                <span>🔍</span>
              </div>

              <div className="relative z-10 space-y-1">
                <div className="font-bold text-xs">@ehy.connect</div>
                <p className="text-[11px] text-neutral-200 line-clamp-2">
                  {content || 'معاينة تيك توك التفاعلية...'}
                </p>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <span>🎵</span>
                  <span>الصوت الأصلي — EHY Connect Tech</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

PostComposer.displayName = 'PostComposer';
