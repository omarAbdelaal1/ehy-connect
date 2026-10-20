'use client';

// ==============================================================================
// EHY Connect — Editorial Draft Approval Workflow Queue (Hootsuite Pillar)
// Module: components/studio/approval-queue.tsx
// Specialists: UI Designer & Senior Developer
// ==============================================================================

import React, { useState, memo } from 'react';
import { SocialPost, UserProfile } from '@/types';

interface ApprovalQueueProps {
  currentUser: UserProfile;
  posts: SocialPost[];
  onDecision: (postId: string, decision: 'approved' | 'rejected' | 'changes_requested', notes: string) => void;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = memo(({
  currentUser,
  posts: initialPosts,
  onDecision,
}) => {
  const [posts, setPosts] = useState<SocialPost[]>(
    initialPosts.filter((p) => p.status === 'pending_approval')
  );

  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const isSupervisorOrAdmin = ['supervisor', 'admin'].includes(currentUser.role);

  const handleAction = (postId: string, decision: 'approved' | 'rejected' | 'changes_requested') => {
    const note = notesMap[postId] || '';
    onDecision(postId, decision, note);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>⚖️</span>
            <span>طابور الموافقات والاعتماد التحريري (Editorial Approval Queue)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            مراجعة مسودات المنشورات المقدمة من مسؤولي المحتوى واعتماد جدولتها أو طلب تعديلها قبل النشر الفعلي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30">
            {posts.length} مسودات بانتظار قرار المشرف
          </span>
        </div>
      </div>

      {/* Permissions Notice */}
      {!isSupervisorOrAdmin && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300">
          ℹ️ حسابك الحالي <strong>({currentUser.role})</strong> يتيح لك استعراض حالة المسودات.
          صلاحيات الموافقة والاعتماد النهائي مخصصة لدور <strong>Supervisor</strong> و<strong>Admin</strong>.
        </div>
      )}

      {/* List of Pending Posts */}
      {posts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
          <span className="text-3xl">🎉</span>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
            لا توجد منشورات معلقة حالياً
          </h4>
          <p className="text-xs text-neutral-500">
            تمت مراجعة واعتماد جميع المسودات المجدولة بنجاح.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    ✍️
                  </div>
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">
                      مسودة محتوى مقدمة من: نور الصباح (Social Media Manager)
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      موعد الجدولة المقترح: {post.scheduled_for ? new Date(post.scheduled_for).toLocaleString() : 'غير محدد'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {post.target_platforms.map((tp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {tp.platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* Draft Content & Media */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white whitespace-pre-line leading-relaxed">
                  {post.content}
                </div>

                {post.media_urls?.[0] && (
                  <div className="h-32 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={post.media_urls[0]}
                      alt="media-preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Supervisor Actions */}
              {isSupervisorOrAdmin ? (
                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <input
                    type="text"
                    value={notesMap[post.id] || ''}
                    onChange={(e) =>
                      setNotesMap((prev) => ({ ...prev, [post.id]: e.target.value }))
                    }
                    placeholder="ملاحظات المراجعة أو سبب التعديل (اختياري)..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleAction(post.id, 'rejected')}
                      className="px-3.5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 text-neutral-700 dark:text-neutral-300 font-bold transition-colors"
                    >
                      ❌ رفض
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(post.id, 'changes_requested')}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
                    >
                      ✏️ طلب تعديلات
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(post.id, 'approved')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>✓ اعتماد ونشر في التقويم</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-400 italic pt-1">
                  ⏳ المسودة قيد المراجعة الإدارية.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

ApprovalQueue.displayName = 'ApprovalQueue';
