'use client';

// ==============================================================================
// EHY Connect — Social Feeds & Comment Moderation Triage (Hootsuite Pillar)
// Module: components/studio/comment-moderator.tsx
// Specialists: UI Designer & Senior Developer
// ==============================================================================

import React, { useState, memo } from 'react';

interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  platform: 'instagram' | 'facebook' | 'tiktok';
  postId: string;
  postTitle: string;
  isHidden?: boolean;
}

interface CommentModeratorProps {
  onConvertToTicket?: (comment: CommentItem) => void;
}

export const CommentModerator: React.FC<CommentModeratorProps> = memo(({
  onConvertToTicket,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c1',
      author: 'فيصل العتيبي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      content: 'المنصة ممتازة جداً وريحتنا في ربط محادثات الواتساب! متى تطلقون تطبيق الموبايل؟',
      timeAgo: 'منذ 10 دقائق',
      sentiment: 'positive',
      platform: 'instagram',
      postId: 'post_101',
      postTitle: 'شاهد كيف يعمل محرك EHY Connect لتوحيد جميع رسائل السوشيال ميديا 🔥',
    },
    {
      id: 'c2',
      author: 'مشاعل الحربي',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      content: 'حاولت التسجيل بالباقة وخصم المبلغ ولم يفتح الحساب! أرجو التواصل معي فوراً.',
      timeAgo: 'منذ 35 دقيقة',
      sentiment: 'negative',
      platform: 'facebook',
      postId: 'post_102',
      postTitle: 'كيف تضاعف مبيعات متجرك الإلكتروني عبر واتساب للأعمال في 3 خطوات بسيطة؟ 🚀',
    },
    {
      id: 'c3',
      author: 'Creative Agency Riyadh',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
      content: 'هل تدعمون جدولة فيديوهات تيك توك تلقائياً دون الحاجة لتأكيد يدوي من الجوال؟',
      timeAgo: 'منذ ساعتين',
      sentiment: 'neutral',
      platform: 'tiktok',
      postId: 'post_103',
      postTitle: 'شاهد قوة الجدولة التلقائية في تيك توك وإنستغرام',
    },
  ]);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [convertedIds, setConvertedIds] = useState<string[]>([]);

  const handleSendReply = (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text?.trim()) return;

    alert(`تم إرسال الرد الرسمي على التعليق (${commentId}): "${text}" عبر واجهة API الرسمية.`);
    setReplyTextMap((prev) => ({ ...prev, [commentId]: '' }));
  };

  const handleConvert = (comment: CommentItem) => {
    setConvertedIds((prev) => [...prev, comment.id]);
    onConvertToTicket?.(comment);
  };

  const handleToggleHide = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, isHidden: !c.isHidden } : c))
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>💬</span>
            <span>إدارة وتفاعل التعليقات والمنشورات (Comment Moderation)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            إدارة كافة التعليقات الواردة على منشورات Instagram وFacebook وTikTok والرد عليها أو تحويلها إلى تذاكر دعم فني
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
            {comments.length} تعليقات نشطة اليوم
          </span>
        </div>
      </div>

      {/* Comments List Stream */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const isConverted = convertedIds.includes(comment.id);

          return (
            <div
              key={comment.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 bg-white dark:bg-neutral-900 ${
                comment.sentiment === 'negative'
                  ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800 shadow-xs'
              } ${comment.isHidden ? 'opacity-50' : ''}`}
            >
              {/* Post Context Bar */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-2 text-neutral-500">
                  <span>منشور على:</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                    {comment.platform}
                  </span>
                  <span>•</span>
                  <span className="truncate max-w-md font-medium text-indigo-600 dark:text-indigo-400">
                    "{comment.postTitle}"
                  </span>
                </div>

                {comment.sentiment === 'negative' && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px]">
                    🚨 شكوى عميل سلبية
                  </span>
                )}
              </div>

              {/* Comment Content Body */}
              <div className="flex items-start gap-3">
                <img
                  src={comment.avatar}
                  alt={comment.author}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 flex-shrink-0"
                />

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {comment.author}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {comment.timeAgo}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Triage Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleHide(comment.id)}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium transition-colors"
                  >
                    {comment.isHidden ? '👁️ إلغاء الإخفاء' : '🙈 إخفاء التعليق'}
                  </button>

                  {/* Crucial Integration: MindBehind Bridge */}
                  <button
                    type="button"
                    disabled={isConverted}
                    onClick={() => handleConvert(comment)}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                      isConverted
                        ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    <span>{isConverted ? '✓ تم التحويل لتذكرة' : '📥 تحويل لتذكرة دعم في الـ Inbox'}</span>
                  </button>
                </div>

                {/* Reply Input Box */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    value={replyTextMap[comment.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap((prev) => ({ ...prev, [comment.id]: e.target.value }))
                    }
                    placeholder="اكتب رداً عاماً على التعليق..."
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(comment.id)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs"
                  >
                    رد
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CommentModerator.displayName = 'CommentModerator';
