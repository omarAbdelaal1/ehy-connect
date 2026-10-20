'use client';

// ==============================================================================
// EHY Connect — Omnichannel Conversation List Component
// Module: components/inbox/conversation-list.tsx
// Specialist: Frontend Developer & UX Specialist
// ==============================================================================

import React, { memo } from 'react';
import { Conversation, ChannelPlatform, Sentiment } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  currentUserId: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = memo(({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
}) => {
  const getChannelBadge = (platform?: ChannelPlatform) => {
    switch (platform) {
      case 'whatsapp':
        return { label: 'WhatsApp', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', icon: '💬' };
      case 'instagram':
        return { label: 'Instagram', bg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30', icon: '📸' };
      case 'facebook':
        return { label: 'Facebook', bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: '👤' };
      case 'tiktok':
        return { label: 'TikTok', bg: 'bg-neutral-800/20 text-neutral-800 dark:text-neutral-200 border-neutral-500/30', icon: '🎵' };
      default:
        return { label: 'Web', bg: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30', icon: '🌐' };
    }
  };

  const getSentimentDot = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="مشاعر إيجابية (Positive)" />;
      case 'negative':
        return <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="مشاعر سلبية / شكوى (Negative)" />;
      default:
        return <span className="inline-block w-2 h-2 rounded-full bg-amber-400" title="مشاعر محايدة (Neutral)" />;
    }
  };

  return (
    <div className="flex flex-col h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 w-80 lg:w-96 flex-shrink-0">
      {/* Top Header & Search */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>صندوق المحادثات</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {conversations.length}
            </span>
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>متصل مباشرة</span>
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="بحث في المحادثات أو أسماء العملاء..."
            className="w-full text-sm rounded-lg pl-3 pr-9 py-2 bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <span className="absolute right-3 top-2.5 text-neutral-400">🔍</span>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {['all', 'open', 'urgent', 'locked'].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => onFilterChange(filterKey)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                activeFilter === filterKey
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {filterKey === 'all' && 'الكل (All)'}
              {filterKey === 'open' && 'المفتوحة (Open)'}
              {filterKey === 'urgent' && 'عاجل (Urgent)'}
              {filterKey === 'locked' && 'المقفلة (Locked)'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread List */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            لا توجد محادثات تطابق الفلتر الحالي.
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            const badge = getChannelBadge(conv.channel?.platform);
            const isLocked = !!conv.active_lock;
            const isLockedByMe = conv.active_lock?.agent_id === currentUserId;

            return (
              <div
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`p-3.5 cursor-pointer transition-all relative hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-r-4 border-indigo-600'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Customer Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={conv.customer_avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={conv.customer_name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                    />
                    <span className="absolute -bottom-1 -right-1 text-xs">
                      {badge.icon}
                    </span>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                          {conv.customer_name}
                        </span>
                        {getSentimentDot(conv.sentiment)}
                      </div>
                      <span className="text-[11px] text-neutral-400 whitespace-nowrap">
                        منذ 5 د
                      </span>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mb-2">
                      {conv.last_message_preview || 'لا توجد رسائل سابقة'}
                    </p>

                    {/* Metadata & Status row */}
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${badge.bg}`}>
                          {badge.label}
                        </span>

                        {conv.priority === 'urgent' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                            عاجل
                          </span>
                        )}
                      </div>

                      {/* Lock Status Indicator */}
                      {isLocked && (
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1 ${
                              isLockedByMe
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            <span>🔒</span>
                            <span>{isLockedByMe ? 'أنت' : conv.active_lock?.agent_name?.split(' ')[0] || 'محجوز'}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

ConversationList.displayName = 'ConversationList';
