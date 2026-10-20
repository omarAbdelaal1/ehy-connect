'use client';

// ==============================================================================
// EHY Connect — Customer CRM Sidebar & Metadata Drawer
// Module: components/inbox/customer-sidebar.tsx
// Specialist: Frontend Developer & UI Specialist
// ==============================================================================

import React, { memo } from 'react';
import { Conversation } from '@/types';

interface CustomerSidebarProps {
  conversation: Conversation;
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

export const CustomerSidebar: React.FC<CustomerSidebarProps> = memo(({
  conversation,
}) => {
  return (
    <div className="w-72 lg:w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 flex flex-col h-full overflow-y-auto space-y-6 flex-shrink-0">
      {/* Profile Header */}
      <div className="text-center space-y-2">
        <img
          src={conversation.customer_avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
          alt={conversation.customer_name}
          className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-indigo-500/30 shadow-xs"
        />
        <h4 className="font-bold text-base text-neutral-900 dark:text-white">
          {conversation.customer_name}
        </h4>
        <p className="text-xs text-neutral-500 font-mono">
          {conversation.customer_identifier}
        </p>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
          <span>القناة:</span>
          <span className="font-semibold">{conversation.channel?.platform?.toUpperCase()}</span>
        </div>
      </div>

      <hr className="border-neutral-200 dark:border-neutral-800" />

      {/* Ticket Details */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          بيانات التذكرة الحالية
        </h5>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
            <span className="text-neutral-500">حالة التذكرة:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {conversation.status}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
            <span className="text-neutral-500">الأولوية:</span>
            <span className={`font-bold ${conversation.priority === 'urgent' ? 'text-rose-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
              {conversation.priority === 'urgent' ? '🚨 عاجل جداً' : 'متوسطة'}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
            <span className="text-neutral-500">تحليل المشاعر (AI):</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {conversation.sentiment === 'positive' && '😊 إيجابي'}
              {conversation.sentiment === 'neutral' && '😐 محايد'}
              {conversation.sentiment === 'negative' && '😡 سلبي / شكوى'}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
            <span className="text-neutral-500">الموظف المسؤول:</span>
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {conversation.assigned_agent?.full_name || 'غير مسند'}
            </span>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          الوسوم والتصنيفات (Tags)
        </h5>
        <div className="flex flex-wrap gap-1.5">
          {conversation.tags && conversation.tags.length > 0 ? (
            conversation.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800/60"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-neutral-400">لا توجد وسوم مضافة</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          إجراءات سريعة
        </h5>
        <button
          type="button"
          className="w-full text-xs font-semibold py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-200 text-center"
        >
          📂 استعراض سجل تذاكر العميل (History)
        </button>
        <button
          type="button"
          className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center"
        >
          ✅ إغلاق وحل المحادثة (Resolve)
        </button>
      </div>
    </div>
  );
});

CustomerSidebar.displayName = 'CustomerSidebar';
