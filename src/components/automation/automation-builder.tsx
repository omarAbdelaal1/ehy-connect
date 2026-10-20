'use client';

// ==============================================================================
// EHY Connect — Automation Center & AI Workflow Builder
// Module: components/automation/automation-builder.tsx
// Specialists: AI Engineer & Backend Architect
// ==============================================================================

import React, { useState, memo } from 'react';
import { AutomationRule } from '@/types';
import { AIAssistant, IntentResult } from '@/lib/services/ai-assistant';

export const AutomationBuilder: React.FC = memo(() => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule_1',
      organization_id: 'org_demo',
      name: 'توجيه استفسارات الأسعار والمبيعات تلقائياً',
      description: 'فحص الكلمات المفتاحية المتعلقة بالأسعار وإسناد التذكرة فوراً لفريق المبيعات',
      is_active: true,
      trigger_type: 'message_received',
      conditions: [{ field: 'content', operator: 'contains_any', values: ['سعر', 'باقة', 'اشتراك', 'تكلفة', 'pricing'] }],
      actions: [{ action: 'assign_team', team_name: 'فريق المبيعات' }, { action: 'apply_tag', tag: 'مبيعات_VIP' }],
    },
    {
      id: 'rule_2',
      organization_id: 'org_demo',
      name: 'تصعيد التذاكر السلبية وشكاوى العملاء للمشرف',
      description: 'اكتشاف نبرة الغضب أو التذمر ورفع الأولوية إلى عاجل جداً وتنبيه المشرف',
      is_active: true,
      trigger_type: 'sentiment_negative',
      conditions: [{ field: 'sentiment', operator: 'equals', value: 'negative' }],
      actions: [{ action: 'set_priority', priority: 'urgent' }, { action: 'notify_supervisor', alert: 'in_app_popup' }],
    },
    {
      id: 'rule_3',
      organization_id: 'org_demo',
      name: 'الرد التلقائي خارج ساعات العمل الرسمية',
      description: 'إرسال رد ترحيبي وتحديد مواعيد العمل الرسمية عند استلام رسائل بعد 6:00 مساءً',
      is_active: true,
      trigger_type: 'schedule_outside_hours',
      conditions: [{ field: 'time', operator: 'outside', value: '09:00 - 18:00' }],
      actions: [{ action: 'auto_reply', message_template: 'out_of_hours_greeting' }],
    },
  ]);

  // Interactive Live Simulator State
  const [simText, setSimText] = useState('السلام عليكم، نحتاج معرفة أسعار باقة الشركات لـ 20 موظفاً مع ربط واتساب الرسمي.');
  const [simResult, setSimResult] = useState<{
    intent: IntentResult;
    sentiment: string;
    firedRuleName?: string;
    executedActions: string[];
    suggestedReply: string;
  } | null>(null);

  const toggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleRunSimulation = () => {
    if (!simText.trim()) return;

    const intent = AIAssistant.classifyIntent(simText);
    const sentiment = AIAssistant.analyzeSentiment(simText);
    const reply = AIAssistant.generateSuggestedReply('عبدالله', simText);

    let firedRuleName = 'لا توجد قاعدة مطابقة مباشرة (التوجيه الافتراضي)';
    const executedActions: string[] = [];

    if (intent.intent === 'sales_inquiry') {
      firedRuleName = 'توجيه استفسارات الأسعار والمبيعات تلقائياً';
      executedActions.push('تم تحويل التذكرة إلى: فريق المبيعات والاشتراكات');
      executedActions.push('تم تطبيق الوسم: #مبيعات_VIP');
      executedActions.push('تم توليد رد مقترح ذكي من قاعدة المعرفة المعتمدة');
    } else if (sentiment === 'negative' || intent.intent === 'complaint') {
      firedRuleName = 'تصعيد التذاكر السلبية وشكاوى العملاء للمشرف';
      executedActions.push('تم رفع الأولوية إلى: 🚨 عاجل جداً (Urgent)');
      executedActions.push('تم إرسال إشعار فوري للمشرف المناوب');
    } else {
      executedActions.push('تم إيداع التذكرة في صندوق الوارد العام لموظفي الفترة');
    }

    setSimResult({
      intent,
      sentiment,
      firedRuleName,
      executedActions,
      suggestedReply: reply.suggestedText,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50 dark:bg-neutral-950 font-sans">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <span>⚡</span>
          <span>مركز الأتمتة والذكاء الاصطناعي (Automation & AI Center)</span>
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          بناء تدفقات عمل ذكية لتصنيف رسائل العملاء، تحويل التذاكر، واقتراح الردود المدعومة بقاعدة المعرفة المؤسسية
        </p>
      </div>

      {/* Grid: Rules Table (Left) + Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Automation Workflows */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              قواعد وتدفقات الأتمتة النشطة ({rules.length})
            </h3>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              + إضافة قاعدة عمل جديدة
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 bg-white dark:bg-neutral-900 ${
                  rule.is_active
                    ? 'border-neutral-200 dark:border-neutral-800 shadow-xs'
                    : 'border-neutral-200/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🤖</span>
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {rule.name}
                      </h4>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {rule.description}
                      </p>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => toggleRule(rule.id)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      rule.is_active ? 'bg-indigo-600 justify-end' : 'bg-neutral-300 dark:bg-neutral-700 justify-start'
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-xs" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                    الشرط: {rule.conditions[0]?.operator} ({rule.conditions[0]?.values?.join(', ') || rule.conditions[0]?.value})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono">
                    الإجراء: {rule.actions.map((a) => a.action).join(' + ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Interactive Rule Simulator */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-indigo-200 dark:border-indigo-950 p-6 space-y-4 shadow-xs">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <span>🧪</span>
              <span>محاكي اختبار تدفقات الأتمتة المباشر (Rule Sandbox)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              اختبر ردود الفعل التلقائية والذكاء الاصطناعي على رسائل تجريبية
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              أدخل رسالة عميل تجريبية:
            </label>
            <textarea
              rows={3}
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              placeholder="اكتب رسالة لتجربة فرز النوايا التلقائي..."
              className="w-full text-xs p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>تشغيل المحاكاة وفحص النتائج</span>
            <span>⚡</span>
          </button>

          {/* Simulation Output Card */}
          {simResult && (
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-indigo-200/50 pb-2">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">النية المكتشفة (Intent):</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                  {simResult.intent.intent} ({Math.round(simResult.intent.confidence * 100)}% دقة)
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-indigo-200/50 pb-2">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">المشاعر (Sentiment):</span>
                <span className={`font-bold ${simResult.sentiment === 'negative' ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {simResult.sentiment === 'negative' ? '😡 سلبي / شكوى' : '😊 إيجابي'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">القاعدة المنفذة:</span>
                <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 font-semibold text-neutral-900 dark:text-white text-[11px] border border-indigo-100 dark:border-indigo-900">
                  {simResult.firedRuleName}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">الإجراءات التلقائية المطبقة:</span>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-600 dark:text-neutral-300 text-[11px]">
                  {simResult.executedActions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1 pt-1">
                <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <span>✨</span>
                  <span>الرد المقترح بالذكاء الاصطناعي (AI Suggested Reply):</span>
                </span>
                <p className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-[11px] leading-relaxed border border-purple-200 dark:border-purple-900">
                  {simResult.suggestedReply}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

AutomationBuilder.displayName = 'AutomationBuilder';
