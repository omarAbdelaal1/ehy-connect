'use client';

// ==============================================================================
// EHY Connect — Active Conversation Chat Pane & Collision Control
// Module: components/inbox/chat-pane.tsx
// Specialist: Frontend Developer & Systems Architect
// ==============================================================================

import React, { useState, useRef, useEffect, memo } from 'react';
import { Conversation, Message, UserProfile, UserRole } from '@/types';
import { LockManager } from '@/lib/services/lock-manager';

interface ChatPaneProps {
  conversation: Conversation;
  currentUser: UserProfile;
  onSendMessage: (content: string, isInternalNote: boolean) => void;
  onOverrideLock: (conversationId: string) => void;
  onStatusChange: (newStatus: any) => void;
  onAssignChange: (agentId: string) => void;
  availableAgents: UserProfile[];
}

export const ChatPane: React.FC<ChatPaneProps> = memo(({
  conversation,
  currentUser,
  onSendMessage,
  onOverrideLock,
  onStatusChange,
  onAssignChange,
  availableAgents,
}) => {
  const [inputText, setInputText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string; size: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        url: URL.createObjectURL(file),
        size: (file.size / 1024).toFixed(1) + ' KB',
      });
    }
  };

  const activeLock = conversation.active_lock;
  const isLockedByOther = LockManager.isLockedByOther(activeLock, currentUser.id);
  const isLockedByMe = activeLock?.agent_id === currentUser.id;
  const isSupervisorOrAdmin = ['supervisor', 'admin'].includes(currentUser.role);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || isLockedByOther) return;
    const finalContent = attachedFile
      ? `${inputText.trim()}${inputText.trim() ? ' ' : ''}[مرفق: ${attachedFile.name}]`
      : inputText.trim();
    onSendMessage(finalContent, isInternalNote);
    setInputText('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyAiSuggestion = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setInputText(
        'أهلاً بك أستاذ ' + conversation.customer_name + '، شكراً لتواصلك مع EHY Connect! تم تسجيل استفسارك وسيقوم فريقنا بمتابعة طلبك وتقديم الحل المناسب خلال دقائق.'
      );
      setIsGeneratingAi(false);
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-neutral-50/60 dark:bg-neutral-950/40 relative">
      {/* 1. Header Bar */}
      <div className="p-3.5 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <img
            src={conversation.customer_avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={conversation.customer_name}
            className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                {conversation.customer_name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                {conversation.customer_identifier}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              القناة: {conversation.channel?.account_name || 'واتساب الأعمال الرسمي'}
            </p>
          </div>
        </div>

        {/* Status & Assignment Controls */}
        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <select
            value={conversation.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="open">🟢 مفتوحة (Open)</option>
            <option value="pending">🟡 معلقة (Pending)</option>
            <option value="resolved">✅ محلولة (Resolved)</option>
            <option value="snoozed">⏰ مؤجلة (Snoozed)</option>
          </select>

          {/* Assigned Agent Dropdown */}
          <select
            value={conversation.assigned_agent_id || ''}
            onChange={(e) => onAssignChange(e.target.value)}
            disabled={!isSupervisorOrAdmin && isLockedByOther}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none"
          >
            <option value="">👤 غير مسندة (Unassigned)</option>
            {availableAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name} ({agent.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Collision Lock Banner (MindBehind Feature Guarantee) */}
      {isLockedByOther ? (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-amber-800 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">🔒</span>
            <span>
              <strong>تنبيه منع التضارب:</strong> هذه المحادثة يديرها حالياً الموظف{' '}
              <strong className="underline">{activeLock?.agent_name || 'موظف آخر'}</strong>.
              تم قفل صندوق الرد لمنع إرسال إجابات مزدوجة للعميل.
            </span>
          </div>

          {isSupervisorOrAdmin && (
            <button
              onClick={() => onOverrideLock(conversation.id)}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-semibold text-xs transition-colors shadow-sm"
            >
              كسر القفل واستلام المحادثة (Supervisor Override)
            </button>
          )}
        </div>
      ) : isLockedByMe ? (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-1.5 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <span>🟢</span>
            <span>أنت تدير هذه المحادثة بنجاح — القفل التلقائي نشط لحمايتك من التضارب.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
            متبقي: {LockManager.getRemainingSeconds(activeLock)} ثانية
          </span>
        </div>
      ) : null}

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages && conversation.messages.length > 0 ? (
          conversation.messages.map((msg) => {
            const isCustomer = msg.direction === 'inbound';
            const isNote = msg.direction === 'internal_note';

            if (isNote) {
              return (
                <div key={msg.id} className="mx-auto max-w-xl my-2">
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <span>📌 ملاحظة داخلية (فريق العمل فقط)</span>
                      <span>منذ قليل</span>
                    </div>
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-md rounded-2xl p-3.5 shadow-xs text-sm ${
                    isCustomer
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tr-none border border-neutral-200/80 dark:border-neutral-700'
                      : 'bg-indigo-600 text-white rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                  <div
                    className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${
                      isCustomer ? 'text-neutral-400' : 'text-indigo-200'
                    }`}
                  >
                    <span>10:42 ص</span>
                    {!isCustomer && <span>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-sm text-neutral-400">
            لا توجد رسائل سابقة في هذه المحادثة
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Interactive Composer & Smart Assist */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {/* Composer Controls Top Bar */}
        <div className="flex items-center justify-between mb-2">
          {/* Internal Note vs Customer Reply Toggle */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setIsInternalNote(false)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                !isInternalNote
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              رد للعميل (Reply)
            </button>
            <button
              type="button"
              onClick={() => setIsInternalNote(true)}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                isInternalNote
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              ملاحظة داخلية (Internal Note)
            </button>
          </div>

          {/* AI Suggestion Button */}
          {!isLockedByOther && (
            <button
              type="button"
              onClick={handleApplyAiSuggestion}
              disabled={isGeneratingAi}
              className="text-xs px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 hover:bg-purple-100 transition-colors font-medium"
            >
              <span>✨</span>
              <span>{isGeneratingAi ? 'جاري التحليل...' : 'اقتراح ذكاء اصطناعي (AI Reply)'}</span>
            </button>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLockedByOther}
            placeholder={
              isLockedByOther
                ? '🔒 حقل الرد معطل نظراً لتعامل موظف آخر مع المحادثة لمنع التضارب...'
                : isInternalNote
                ? 'اكتب ملاحظة لفريق العمل هنا (لن تظهر للعميل)...'
                : 'اكتب ردك للعميل هنا... (Enter للإرسال)'
            }
            className={`w-full p-3 text-sm rounded-xl border focus:outline-none focus:ring-2 resize-none transition-all ${
              isLockedByOther
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed border-neutral-300 dark:border-neutral-700'
                : isInternalNote
                ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/70 text-amber-900 dark:text-amber-100 focus:ring-amber-500/40'
                : 'bg-white dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:ring-indigo-500/40'
            }`}
          />

          {/* Hidden File Input for message attachments */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAttachFile}
            className="hidden"
          />

          {attachedFile && (
            <div className="flex items-center gap-2 mt-2 p-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 w-fit">
              <span>📎</span>
              <span className="font-semibold truncate max-w-xs">{attachedFile.name}</span>
              <span className="text-[10px] opacity-75">({attachedFile.size})</span>
              <button
                type="button"
                onClick={() => {
                  setAttachedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-indigo-500 hover:text-indigo-800 font-bold ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                📎 إرفاق ملف أو مستند
              </span>
              <span>•</span>
              <span className="cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200">⚡ ردود سريعة</span>
            </div>

            <button
              type="submit"
              disabled={isLockedByOther || (!inputText.trim() && !attachedFile)}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 ${
                isLockedByOther || (!inputText.trim() && !attachedFile)
                  ? 'bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed'
                  : isInternalNote
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25'
              }`}
            >
              <span>{isInternalNote ? 'حفظ الملاحظة' : 'إرسال الرد'}</span>
              <span>🚀</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ChatPane.displayName = 'ChatPane';
