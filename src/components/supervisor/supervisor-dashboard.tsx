'use client';

// ==============================================================================
// EHY Connect — Supervisor Live Operations Dashboard (MindBehind Pillar)
// Module: components/supervisor/supervisor-dashboard.tsx
// Specialist: Frontend Developer & Systems Architect
// ==============================================================================

import React, { useState, memo } from 'react';
import { UserProfile, Conversation } from '@/types';

interface SupervisorDashboardProps {
  agents?: UserProfile[];
  conversations?: Conversation[];
  onTakeOverTicket?: (conversationId: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = memo(({
  agents: propAgents,
  conversations: propConversations,
  onTakeOverTicket,
}) => {
  const [agents] = useState<UserProfile[]>(
    propAgents || [
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>لوحة المشرف ومراقبة العمليات الحية</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
              Live Operations (SLA Active)
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة فورية لأداء موظفي خدمة العملاء، سرعة الاستجابة، وقفل المحادثات المتزامنة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            📊 تصدير تقرير الأداء اليومي (PDF/CSV)
          </button>
        </div>
      </div>

      {/* 1. Real-time KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Queue Depth */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>التذاكر المفتوحة حالياً</span>
            <span className="text-lg">📬</span>
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white mt-2">
            18
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            ↓ 12% مقارنة بنفس الوقت أمس
          </p>
        </div>

        {/* Metric 2: Avg First Response Time (FRT) */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>متوسط زمن الرد الأول (FRT)</span>
            <span className="text-lg">⚡</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            1 دقيقة و 24 ثانية
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">
            المعدل المستهدف: أقل من 3 دقائق
          </p>
        </div>

        {/* Metric 3: Active Collision Locks */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>المحادثات المقفلة حالياً</span>
            <span className="text-lg">🔒</span>
          </div>
          <div className="text-2xl font-black text-amber-500 mt-2">
            4 محادثات
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            نشطة بواسطة الموظفين لمنع التضارب
          </p>
        </div>

        {/* Metric 4: CSAT Score */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium">
            <span>معدل رضا العملاء (CSAT)</span>
            <span className="text-lg">⭐</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            4.85 / 5.0
          </div>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">
            مبني على 142 تقييم هذا الأسبوع
          </p>
        </div>
      </div>

      {/* 2. Urgent / Escalated Queue Monitor */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-rose-200 dark:border-rose-900/50 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚨</span>
            <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400">
              قائمة التذاكر المصعدة والمستعجلة (Urgent Attention Queue)
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
            2 تذاكر تتطلب تدخل المشرف
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-neutral-900 dark:text-white">
                  محمد باقادر — Facebook Messenger
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                  شكوى تأخر الرد
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                "أرسلت لكم منذ ساعتين ولم يرد أحد، الإعلانات نشطة وتكلفنا مبالغ كبيرة!"
              </p>
              <div className="text-[11px] text-rose-500 font-mono">
                مدة الانتظار: 28 دقيقة • تجاوز زمن الاستجابة SLA
              </div>
            </div>

            <button
              onClick={() => onTakeOverTicket?.('d3333333-3333-3333-3333-333333333333')}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors"
            >
              تدخل المشرف الفوري 🚀
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Agent Roster & Presence Tracking */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-xs">
        <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <span>👥</span>
          <span>حالة تواجد الموظفين والتوزيع اللحظي للمحادثات (Agent Presence & Workload)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
                <th className="pb-3 pr-2">الموظف</th>
                <th className="pb-3">الدور الوظيفي</th>
                <th className="pb-3">حالة الاتصال</th>
                <th className="pb-3">المحادثات النشطة</th>
                <th className="pb-3">القفل النشط</th>
                <th className="pb-3">زمن الاستجابة اليوم</th>
                <th className="pb-3 pl-2">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3 pr-2 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{agent.full_name}</span>
                  </td>
                  <td className="py-3 text-neutral-500 uppercase font-mono">{agent.role}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                      متصل (Online)
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-neutral-800 dark:text-neutral-200">
                    {agent.role === 'agent' ? '4 محادثات' : '1 محادثة'}
                  </td>
                  <td className="py-3">
                    {agent.role === 'agent' ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 font-medium">
                        🔒 #1042 (سارة الغامدي)
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-emerald-600 dark:text-emerald-400">1m 12s</td>
                  <td className="py-3 pl-2">
                    <button
                      type="button"
                      className="px-2.5 py-1 text-[11px] rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium transition-colors"
                    >
                      مراقبة الحساب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

SupervisorDashboard.displayName = 'SupervisorDashboard';
