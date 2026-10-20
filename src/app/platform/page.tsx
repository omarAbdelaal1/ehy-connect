'use client';

// ==============================================================================
// EHY Connect — Master Production Dashboard Page
// Route: app/page.tsx
// Stack: Next.js 14 App Router / React 18 / Supabase / Tailwind
// ==============================================================================

import React, { useState } from 'react';
import { UnifiedInbox } from '@/components/inbox/unified-inbox';
import { SocialStudio } from '@/components/studio/social-studio';
import { SupervisorDashboard } from '@/components/supervisor/supervisor-dashboard';
import { AutomationBuilder } from '@/components/automation/automation-builder';
import { UserProfile, UserRole } from '@/types';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'studio' | 'supervisor' | 'automation'>('inbox');
  const [isEnglish, setIsEnglish] = useState(false);

  // Active Sandbox User State
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: '33333333-3333-3333-3333-333333333333',
    organization_id: 'org_demo',
    email: 'ahmed.agent@ehyconnect.com',
    full_name: 'أحمد زكي (Ahmed Zaki)',
    role: 'agent',
    is_online: true,
    is_active: true,
  });

  const availableRoles: Array<{ role: UserRole; name: string; id: string }> = [
    { role: 'agent', name: 'أحمد زكي — Agent (خدمة عملاء)', id: '33333333-3333-3333-3333-333333333333' },
    { role: 'supervisor', name: 'ليلى حسن — Supervisor (مشرف الفترة)', id: '22222222-2222-2222-2222-222222222222' },
    { role: 'social_manager', name: 'نور الصباح — Social Manager (مسؤول محتوى)', id: '44444444-4444-4444-4444-444444444444' },
    { role: 'admin', name: 'خالد المنصور — Admin (المدير العام)', id: '11111111-1111-1111-1111-111111111111' },
  ];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableRoles.find((r) => r.id === e.target.value);
    if (selected) {
      setCurrentUser({
        id: selected.id,
        organization_id: 'org_demo',
        email: `${selected.role}@ehyconnect.com`,
        full_name: selected.name,
        role: selected.role,
        is_online: true,
        is_active: true,
      });
    }
  };

  const toggleLanguage = () => {
    const nextLang = !isEnglish;
    setIsEnglish(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = nextLang ? 'ltr' : 'rtl';
      document.documentElement.lang = nextLang ? 'en' : 'ar';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isEnglish ? 'font-sans' : 'font-sans'}`}>
      {/* 1. Global Navigation & Workspace Header */}
      <header className="bg-slate-950 text-white px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-40 sticky top-0 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm shadow-xs tracking-wider">
            EHY
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">EHY Connect</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isEnglish ? 'Enterprise Ready' : 'نظام تشغيل موحد'}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isEnglish
                ? 'Unified Omnichannel Contact Center & Official Social Media Ecosystem'
                : 'المنظومة الموحدة لخدمة العملاء وإدارة المحتوى الرقمي المعتمد'}
            </p>
          </div>
        </div>

        {/* Workspace Role Switcher & Controls */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-medium">
              {isEnglish ? 'Active Profile:' : 'الملف الوظيفي النشط:'}
            </span>
            <select
              value={currentUser.id}
              onChange={handleRoleChange}
              className="bg-slate-950 text-white font-bold text-xs rounded border border-slate-700 px-2 py-0.5 focus:outline-none"
            >
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 font-bold text-xs text-slate-200 transition-colors"
          >
            {isEnglish ? 'العربية 🌐' : 'English 🌐'}
          </button>

          <a
            href="/showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs border border-indigo-500 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>📱</span>
            <span>{isEnglish ? 'Interactive Live View' : 'استعراض الواجهة التفاعلية'}</span>
          </a>
        </div>
      </header>

      {/* 2. Primary Navigation Tabs */}
      <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 lg:px-6 flex items-center gap-2 lg:gap-6 overflow-x-auto text-xs font-bold shadow-xs z-30">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`py-3 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'inbox'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>📥</span>
          <span>{isEnglish ? 'Contact Center & Unified Inbox' : 'مركز خدمة العملاء والمحادثات'}</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`py-3 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'studio'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>📝</span>
          <span>{isEnglish ? 'Social Publishing Studio' : 'استوديو النشر وإدارة المحتوى'}</span>
        </button>

        <button
          onClick={() => setActiveTab('supervisor')}
          className={`py-3 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'supervisor'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>📊</span>
          <span>{isEnglish ? 'Supervisor SLA & Analytics' : 'لوحة إشراف الأداء ومراقبة SLA'}</span>
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`py-3 px-2 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'automation'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <span>⚡</span>
          <span>{isEnglish ? 'Automations & AI Workflows' : 'مركز الأتمتة والذكاء الاصطناعي'}</span>
        </button>
      </nav>

      {/* 3. Main Workspace Display */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'inbox' && <UnifiedInbox currentUser={currentUser} />}
        {activeTab === 'studio' && <SocialStudio currentUser={currentUser} />}
        {activeTab === 'supervisor' && <SupervisorDashboard />}
        {activeTab === 'automation' && <AutomationBuilder />}
      </main>
    </div>
  );
}
