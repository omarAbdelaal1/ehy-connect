-- ==============================================================================
-- EHY Connect — Master Production Seed Dataset
-- File: seed.sql
-- Description: Realistic bilingual (AR/EN) mock data for staging & demo testing
-- Specialist: Database Optimizer & AppSec Specialist
-- Stack: PostgreSQL 15+ / Supabase
-- ==============================================================================

-- Clean up any existing data in reverse dependency order
DELETE FROM audit_logs;
DELETE FROM automation_rules;
DELETE FROM social_comments;
DELETE FROM post_approvals;
DELETE FROM social_posts;
DELETE FROM agent_locks;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM channels;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM profiles;
DELETE FROM organizations;

-- ==============================================================================
-- 1. SEED ORGANIZATION
-- ==============================================================================

INSERT INTO organizations (id, name, slug, plan, default_language, settings)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'EHY Connect Enterprise — إي إتش واي كونكت',
    'ehy-demo',
    'enterprise',
    'ar',
    '{
        "operating_hours": {"start": "09:00", "end": "18:00", "timezone": "Asia/Riyadh"},
        "collision_timeout_seconds": 120,
        "auto_assign_enabled": true,
        "supported_languages": ["ar", "en"]
    }'::jsonb
);

-- ==============================================================================
-- 2. SEED USERS & PROFILES (4 Explicit Roles)
-- ==============================================================================

-- Note: In real Supabase, user IDs link to auth.users. 
-- Here we insert mock profile UUIDs for test environments.
INSERT INTO profiles (id, organization_id, email, full_name, role, avatar_url, phone_number, is_online, is_active)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'khalid.admin@ehyconnect.com',
        'خالد المنصور (Khalid Al-Mansoor)',
        'admin',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        '+966501112233',
        true,
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'layla.supervisor@ehyconnect.com',
        'ليلى حسن (Layla Hassan)',
        'supervisor',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        '+966502223344',
        true,
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'ahmed.agent@ehyconnect.com',
        'أحمد زكي (Ahmed Zaki)',
        'agent',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        '+966503334455',
        true,
        true
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'nour.smm@ehyconnect.com',
        'نور الصباح (Nour Al-Sabah)',
        'social_manager',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        '+966504445566',
        true,
        true
    );

-- ==============================================================================
-- 3. SEED TEAMS & MEMBERS
-- ==============================================================================

INSERT INTO teams (id, organization_id, name, description, lead_user_id)
VALUES 
    (
        't1111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'فريق خدمة العملاء والدعم (Customer Care)',
        'المسؤول عن استفسارات المحادثات والشكاوى الفنية',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        't2222222-2222-2222-2222-222222222222',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'فريق المبيعات والاشتراكات (Sales & Growth)',
        'المسؤول عن عروض الأسعار والعملاء المحتملين',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        't3333333-3333-3333-3333-333333333333',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'فريق إدارة المحتوى والنشر (Social Studio)',
        'المسؤول عن جدولة المنشورات والرد على التعليقات',
        '44444444-4444-4444-4444-444444444444'
    );

INSERT INTO team_members (team_id, user_id)
VALUES 
    ('t1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'),
    ('t1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'),
    ('t2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333'),
    ('t3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444');

-- ==============================================================================
-- 4. SEED CONNECTED CHANNELS (WhatsApp, Instagram, FB, TikTok, YouTube)
-- ==============================================================================

INSERT INTO channels (id, organization_id, platform, account_id, account_name, account_handle, status, metadata)
VALUES 
    (
        'c1111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'whatsapp',
        'waba_phone_966501234567',
        'EHY WhatsApp Business Official (Sandbox)',
        '+966 50 123 4567',
        'connected',
        '{"waba_id": "waba_demo_109283", "tier": "TIER_1K", "verified_name": "EHY Connect Saudi Arabia"}'::jsonb
    ),
    (
        'c2222222-2222-2222-2222-222222222222',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'instagram',
        'ig_acc_987654321',
        'EHY Connect Official',
        '@ehy_connect',
        'connected',
        '{"followers_count": 48200, "media_count": 312}'::jsonb
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'facebook',
        'fb_page_1029384756',
        'EHY Connect MENA Page',
        'fb.com/ehyconnect',
        'connected',
        '{"page_likes": 89400, "verified": true}'::jsonb
    ),
    (
        'c4444444-4444-4444-4444-444444444444',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'tiktok',
        'tt_acc_554433221',
        'EHY Tech & AI',
        '@ehy.connect',
        'connected',
        '{"likes_count": 650000, "followers": 125000}'::jsonb
    ),
    (
        'c5555555-5555-5555-5555-555555555555',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'youtube',
        'yt_channel_UC102938475',
        'EHY Connect Platform',
        '@EHYConnectOfficial',
        'connected',
        '{"subscribers": 15400}'::jsonb
    );

-- ==============================================================================
-- 5. SEED OMNICHANNEL CONVERSATIONS & MESSAGES (MindBehind Testing)
-- ==============================================================================

-- Conversation 1: WhatsApp Pricing & Enterprise Inquiry (Open / High Priority)
INSERT INTO conversations (id, organization_id, channel_id, assigned_agent_id, assigned_team_id, customer_identifier, customer_name, customer_avatar_url, status, priority, subject, tags, unread_count, sentiment, last_message_preview, last_message_at)
VALUES (
    'd1111111-1111-1111-1111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    't2222222-2222-2222-2222-222222222222',
    '+966551234567',
    'عبدالعزيز الشمري (Abdulaziz)',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    'open',
    'high',
    'طلب عرض أسعار لباقة الشركات الكبرى',
    ARRAY['مبيعات', 'عرض_أسعار', 'VIP'],
    1,
    'positive',
    'السلام عليكم، نحتاج عرض سعر رسمي لباقة 25 موظف ومميزات الأتمتة المتقدمة.',
    NOW() - INTERVAL '5 minutes'
);

INSERT INTO messages (id, conversation_id, organization_id, sender_id, direction, content, delivery_status, platform_message_id, created_at)
VALUES 
    (
        gen_random_uuid(),
        'd1111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        NULL,
        'inbound',
        'مرحباً، اطلعت على منصة EHY Connect ومهتم بالاشتراك لشركتنا في الرياض.',
        'read',
        'wamid.HBgMOTEyMzQ1Njc4OQA=',
        NOW() - INTERVAL '15 minutes'
    ),
    (
        gen_random_uuid(),
        'd1111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '33333333-3333-3333-3333-333333333333',
        'outbound',
        'أهلاً بك أستاذ عبدالعزيز، يسعدنا تواصلك معنا! بالتأكيد باقة الشركات تدعم حتى 50 موظفاً مع ربط واتساب الرسمي وتوزيع التذاكر التلقائي. هل تفضل تزويدك بملف PDF مفصل؟',
        'read',
        'wamid.HBgMOTEyMzQ1Njc4OQB=',
        NOW() - INTERVAL '10 minutes'
    ),
    (
        gen_random_uuid(),
        'd1111111-1111-1111-1111-111111111111',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        NULL,
        'inbound',
        'السلام عليكم، نحتاج عرض سعر رسمي لباقة 25 موظف ومميزات الأتمتة المتقدمة.',
        'delivered',
        'wamid.HBgMOTEyMzQ1Njc4OQC=',
        NOW() - INTERVAL '5 minutes'
    );

-- Conversation 2: Instagram DM with Active Collision Lock (Testing Concurrency Lockout)
INSERT INTO conversations (id, organization_id, channel_id, assigned_agent_id, assigned_team_id, customer_identifier, customer_name, customer_avatar_url, status, priority, subject, tags, unread_count, sentiment, last_message_preview, last_message_at)
VALUES (
    'd2222222-2222-2222-2222-222222222222',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    't1111111-1111-1111-1111-111111111111',
    'ig_user_sarah_ksa',
    'سارة الغامدي (Sarah)',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    'open',
    'medium',
    'استفسار عن ربط حساب المتجر الإلكتروني',
    ARRAY['إنستغرام', 'دعم_فني'],
    0,
    'neutral',
    'هل يمكن ربط رسائل المتجر المباشرة مع فريق المبيعات فوراً؟',
    NOW() - INTERVAL '2 minutes'
);

INSERT INTO messages (id, conversation_id, organization_id, sender_id, direction, content, delivery_status, platform_message_id, created_at)
VALUES (
    gen_random_uuid(),
    'd2222222-2222-2222-2222-222222222222',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NULL,
    'inbound',
    'مساء الخير، هل يمكن ربط رسائل المتجر المباشرة مع فريق المبيعات فوراً؟',
    'delivered',
    'ig_msg_99887766',
    NOW() - INTERVAL '2 minutes'
);

-- Active Lock on Conversation 2 by Ahmed Zaki (Proves Lock Mechanism)
INSERT INTO agent_locks (conversation_id, organization_id, agent_id, locked_at, expires_at, heartbeat_at)
VALUES (
    'd2222222-2222-2222-2222-222222222222',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '33333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '30 seconds',
    NOW() + INTERVAL '90 seconds',
    NOW() - INTERVAL '30 seconds'
);

-- Conversation 3: Facebook Messenger Complaint (Negative Sentiment / Urgent)
INSERT INTO conversations (id, organization_id, channel_id, assigned_agent_id, assigned_team_id, customer_identifier, customer_name, customer_avatar_url, status, priority, subject, tags, unread_count, sentiment, last_message_preview, last_message_at)
VALUES (
    'd3333333-3333-3333-3333-333333333333',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    't1111111-1111-1111-1111-111111111111',
    'fb_psid_918273645',
    'محمد باقادر (Mohamed)',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    'open',
    'urgent',
    'شكوى تأخر الرد في الحملة الإعلانية',
    ARRAY['شكوى', 'عاجل', 'فيسبوك'],
    2,
    'negative',
    'أرسلت لكم منذ ساعتين ولم يرد أحد، الإعلانات نشطة وتكلفنا مبالغ كبيرة!',
    NOW() - INTERVAL '20 minutes'
);

INSERT INTO messages (id, conversation_id, organization_id, sender_id, direction, content, delivery_status, platform_message_id, created_at)
VALUES (
    gen_random_uuid(),
    'd3333333-3333-3333-3333-333333333333',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    NULL,
    'inbound',
    'أرسلت لكم منذ ساعتين ولم يرد أحد، الإعلانات نشطة وتكلفنا مبالغ كبيرة!',
    'delivered',
    'fb_mid_8877665544',
    NOW() - INTERVAL '20 minutes'
);

-- Internal Note on Conversation 3 by Supervisor Layla
INSERT INTO messages (id, conversation_id, organization_id, sender_id, direction, content, delivery_status, created_at)
VALUES (
    gen_random_uuid(),
    'd3333333-3333-3333-3333-333333333333',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '22222222-2222-2222-2222-222222222222',
    'internal_note',
    'ملاحظة إدارية: تم تصعيد التذكرة وتحويلها للمشرف لتقديم اعتذار وتعويض للعميل.',
    'sent',
    NOW() - INTERVAL '10 minutes'
);

-- ==============================================================================
-- 6. SEED SOCIAL MEDIA POSTS & CALENDAR (Hootsuite Testing)
-- ==============================================================================

-- Post 1: Carousel Draft (Pending Approval by Supervisor)
INSERT INTO social_posts (id, organization_id, author_id, content, media_urls, target_platforms, status, scheduled_for, created_at)
VALUES (
    'p1111111-1111-1111-1111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '44444444-4444-4444-4444-444444444444',
    'كيف تضاعف مبيعات متجرك الإلكتروني عبر واتساب للأعمال في 3 خطوات بسيطة؟ 🚀 شاركونا تجاربكم بالتعليقات!',
    '["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"]'::jsonb,
    '[{"platform": "instagram", "type": "carousel"}, {"platform": "facebook", "type": "post"}]'::jsonb,
    'pending_approval',
    NOW() + INTERVAL '1 day',
    NOW() - INTERVAL '2 hours'
);

-- Post 2: Published Reel on TikTok & Instagram
INSERT INTO social_posts (id, organization_id, author_id, content, media_urls, target_platforms, status, scheduled_for, published_at, publishing_results, created_at)
VALUES (
    'p2222222-2222-2222-2222-222222222222',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '44444444-4444-4444-4444-444444444444',
    'شاهد كيف يعمل محرك EHY Connect لتوحيد جميع رسائل السوشيال ميديا في شاشة واحدة 🔥 #خدمة_العملاء #ذكاء_اصطناعي #سعودي_تك',
    '["https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"]'::jsonb,
    '[{"platform": "tiktok", "type": "video"}, {"platform": "instagram", "type": "reel"}]'::jsonb,
    'published',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    '{"tiktok_views": 14200, "instagram_plays": 8900, "status": "success"}'::jsonb,
    NOW() - INTERVAL '2 days'
);

-- Post 3: Scheduled Post for Next Week
INSERT INTO social_posts (id, organization_id, author_id, content, media_urls, target_platforms, status, scheduled_for, created_at)
VALUES (
    'p3333333-3333-3333-3333-333333333333',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '44444444-4444-4444-4444-444444444444',
    'نعلن رسمياً عن إطلاق ميزة الردود المقترحة بالذكاء الاصطناعي في EHY Connect! وفر 60% من وقت فريق خدمة العملاء الآن.',
    '["https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800"]'::jsonb,
    '[{"platform": "facebook", "type": "post"}, {"platform": "instagram", "type": "feed"}]'::jsonb,
    'scheduled',
    NOW() + INTERVAL '3 days',
    NOW() - INTERVAL '1 day'
);

-- Approval Record for Post 3 by Supervisor Layla
INSERT INTO post_approvals (post_id, reviewer_id, decision, feedback_notes, reviewed_at)
VALUES (
    'p3333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    'approved',
    'صيغة ممتازة ومطابقة للهوية البصرية. تمت الموافقة على الجدولة يوم الأحد الساعة 10:00 صباحاً.',
    NOW() - INTERVAL '18 hours'
);

-- ==============================================================================
-- 7. SEED AUTOMATION RULES
-- ==============================================================================

INSERT INTO automation_rules (id, organization_id, name, description, trigger_type, conditions, actions, is_active)
VALUES 
    (
        gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'توجيه استفسارات الأسعار والمبيعات تلقائياً',
        'عند احتواء الرسالة على كلمات أسعار أو باقات يتم إسنادها فوراً لفريق المبيعات',
        'message_received',
        '[{"field": "content", "operator": "contains_any", "values": ["سعر", "أسعار", "باقة", "اشتراك", "pricing", "cost"]}]'::jsonb,
        '[{"action": "assign_team", "team_id": "t2222222-2222-2222-2222-222222222222"}, {"action": "apply_tag", "tag": "مبيعات"}]'::jsonb,
        true
    ),
    (
        gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'تصعيد التذاكر ذات المشاعر السلبية للمشرف',
        'في حال استكشاف نبرة غضب أو شكوى سريعة يتم رفع الأولوية إلى عاجل وتنبيه المشرف',
        'sentiment_negative',
        '[{"field": "sentiment", "operator": "equals", "value": "negative"}]'::jsonb,
        '[{"action": "set_priority", "priority": "urgent"}, {"action": "notify_supervisor", "channel": "in_app"}]'::jsonb,
        true
    ),
    (
        gen_random_uuid(),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'الرد التلقائي خارج ساعات العمل الرسمية',
        'إرسال رسالة ترحيب وتوضيح ساعات العمل عند استلام رسائل بعد الساعة 6 مساءً',
        'message_received',
        '[{"field": "time", "operator": "outside_working_hours"}]'::jsonb,
        '[{"action": "auto_reply", "text": "مرحباً بك! يسعدنا تواصلك مع EHY Connect. فريقنا خارج ساعات العمل حالياً (9:00 ص - 6:00 م)، وسنقوم بالرد عليك في الصباح الباكر بإذن الله."}]'::jsonb,
        true
    );

-- ==============================================================================
-- 8. SEED AUDIT LOGS
-- ==============================================================================

INSERT INTO audit_logs (organization_id, actor_id, action, resource_type, resource_id, metadata)
VALUES 
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '33333333-3333-3333-3333-333333333333',
        'lock_acquired',
        'conversation',
        'd2222222-2222-2222-2222-222222222222',
        '{"agent_name": "Ahmed Zaki", "ttl_seconds": 120}'::jsonb
    ),
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '22222222-2222-2222-2222-222222222222',
        'post_approved',
        'social_post',
        'p3333333-3333-3333-3333-333333333333',
        '{"scheduled_for": "2026-10-25T10:00:00Z", "platforms": ["facebook", "instagram"]}'::jsonb
    );
