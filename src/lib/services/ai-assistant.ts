// ==============================================================================
// EHY Connect — Smart AI Assistant & Knowledge Base Engine
// Module: lib/services/ai-assistant.ts
// Specialist: AI Engineer & Systems Architect
// ==============================================================================

import { Sentiment } from '@/types';

export interface IntentResult {
  intent: 'sales_inquiry' | 'complaint' | 'technical_support' | 'order_tracking' | 'greeting' | 'general';
  confidence: number;
  matchedKeywords: string[];
  suggestedTeam: string;
}

export interface SuggestedReplyResult {
  suggestedText: string;
  source: 'knowledge_base' | 'intent_heuristic' | 'llm_generative';
  confidence: number;
  tags: string[];
}

export class AIAssistant {
  // Knowledge Base FAQ Database for EHY Connect
  private static KNOWLEDGE_BASE = [
    {
      keywords: ['سعر', 'أسعار', 'باقة', 'اشتراك', 'تكلفة', 'pricing', 'cost', 'plan'],
      intent: 'sales_inquiry' as const,
      team: 'فريق المبيعات والاشتراكات (Sales)',
      responseTemplate: (name: string) =>
        `أهلاً بك أستاذ ${name}، تسعدنا رغبتك بالانضمام إلى EHY Connect! نوفر باقات مرنة تبدأ من باقة الفرق الصغيرة وحتى باقة الشركات الكبرى (Enterprise) مع دعم ربط واتساب الرسمي وتوزيع التذاكر وقفل التضارب. هل تحب أن نزودك بملف الأسعار الرسمي أو جدولة مكالمة عرض توضيحي (Demo Call)؟`,
    },
    {
      keywords: ['تأخر', 'لم يرد', 'سيء', 'شكوى', 'فلوس', 'خصم', 'نصب', 'complaint', 'delay'],
      intent: 'complaint' as const,
      team: 'فريق خدمة العملاء والمشرفين (Escalations)',
      responseTemplate: (name: string) =>
        `نعتذر منك بشدة أستاذ ${name} عن أي تأخير أو تجربة غير مرضية. حقك محفوظ تماماً، وتم رفع هذه التذكرة بأولوية قصوى لمشرف الفترة للتحقق فوراً وحل المشكلة وتقديم التعويض المناسب. نرجو تزويدنا برقم العملية إن وجد.`,
    },
    {
      keywords: ['ربط', 'api', 'webhook', 'واتساب', 'كود', 'تكامل', 'integration', 'token'],
      intent: 'technical_support' as const,
      team: 'فريق الدعم الفني والتكاملات (Tech Support)',
      responseTemplate: (name: string) =>
        `مرحباً بك أستاذ ${name}! بخصوص استفسارك التقني، تدعم EHY Connect الربط الرسمي عبر WhatsApp Business Cloud API وZernio مع توثيق كامل للـ Webhooks والـ API Keys المشفرة. سيقوم مهندس الدعم بمتابعة الخطوات معك وتزويدك بالدليل الفني.`,
    },
    {
      keywords: ['مرحبا', 'السلام عليكم', 'صباح الخير', 'مساء الخير', 'hello', 'hi'],
      intent: 'greeting' as const,
      team: 'فريق الدعم العام (General Care)',
      responseTemplate: (name: string) =>
        `وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بك أستاذ ${name} في EHY Connect! كيف يمكننا خدمتك اليوم؟`,
    },
  ];

  /**
   * Classify customer message intent and map to appropriate department.
   */
  public static classifyIntent(text: string): IntentResult {
    const cleanText = text.toLowerCase();

    for (const entry of this.KNOWLEDGE_BASE) {
      const matches = entry.keywords.filter((kw) => cleanText.includes(kw));
      if (matches.length > 0) {
        return {
          intent: entry.intent,
          confidence: Math.min(0.95, 0.65 + matches.length * 0.1),
          matchedKeywords: matches,
          suggestedTeam: entry.team,
        };
      }
    }

    return {
      intent: 'general',
      confidence: 0.5,
      matchedKeywords: [],
      suggestedTeam: 'خدمة العملاء العامة',
    };
  }

  /**
   * Extract sentiment analysis from message tone.
   */
  public static analyzeSentiment(text: string): Sentiment {
    const clean = text.toLowerCase();
    const negativeIndicators = ['تأخر', 'سيء', 'نصب', 'خصم', 'غاضب', 'مشكلة', 'زعلان', 'خطأ', 'bad', 'angry', 'slow', 'fail'];
    const positiveIndicators = ['ممتاز', 'شكرا', 'رائع', 'جميل', 'أشكركم', 'سعيد', 'بطل', 'thanks', 'great', 'love', 'perfect'];

    if (negativeIndicators.some((word) => clean.includes(word))) {
      return 'negative';
    }
    if (positiveIndicators.some((word) => clean.includes(word))) {
      return 'positive';
    }
    return 'neutral';
  }

  /**
   * Generate an automated suggested reply grounded in the approved knowledge base.
   */
  public static generateSuggestedReply(
    customerName: string,
    messageText: string
  ): SuggestedReplyResult {
    const intentResult = this.classifyIntent(messageText);

    const matchingFaq = this.KNOWLEDGE_BASE.find((faq) => faq.intent === intentResult.intent);

    if (matchingFaq) {
      return {
        suggestedText: matchingFaq.responseTemplate(customerName),
        source: 'knowledge_base',
        confidence: intentResult.confidence,
        tags: intentResult.matchedKeywords,
      };
    }

    return {
      suggestedText: `أهلاً بك أستاذ ${customerName}، شكراً لتواصلك مع EHY Connect! تم استلام رسالتك وسيتولى فريقنا الرد عليك في أقرب وقت.`,
      source: 'intent_heuristic',
      confidence: 0.6,
      tags: ['عام'],
    };
  }
}
