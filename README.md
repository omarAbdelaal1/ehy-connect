# EHY Connect — Omnichannel Contact Center & Social Media Management Platform
## منصة EHY Connect لإدارة المحادثات الموحدة واستوديو السوشيال ميديا

> **Combined Capabilities**: MindBehind (Omnichannel Customer Support & Collision Lock) + Hootsuite (Multi-Platform Publishing, Content Calendar & Approval Workflows)  
> **Tech Stack**: Next.js 14 (App Router) • TypeScript • Supabase (PostgreSQL 15 + RLS) • Zernio Engine • Meta Graph & WhatsApp Cloud API • Vercel

---

## 🌟 Overview & Core Modules

EHY Connect is an enterprise multi-tenant SaaS platform built to unify customer service messaging and marketing content management into a single, high-reliability command center:

1. **Omnichannel Contact Center (MindBehind Pillar)**:
   - Aggregated multi-channel thread inbox: WhatsApp Business Cloud API, Instagram DMs, Facebook Messenger, and TikTok.
   - **Deterministic Agent Collision Lock**: Real-time locking mechanism preventing multiple agents from typing or replying simultaneously to the same customer.
   - **Supervisor Operations Center**: Live tracking of First Response Time (FRT), queue depths, agent roster presence, and emergency lock takeover.

2. **Social Media Studio & Publishing Engine (Hootsuite Pillar)**:
   - **Multi-Platform Composer**: Target Instagram (Reels/Feed/Carousels), Facebook Pages, TikTok, and YouTube Shorts simultaneously.
   - **Live Mobile Device Previews**: Real-time interactive phone shells simulating the authentic visual layout of each platform with character counters.
   - **Interactive Content Calendar**: Weekly/monthly scheduling view with platform color-coding and time-slot management.
   - **Comment Moderation Triage**: Feed of social comments with AI sentiment analysis and a **one-click "Convert to Support Ticket" action** routing complaints straight to the inbox.
   - **Editorial Approval Workflow**: Multi-tier governance where Social Media Managers submit drafts and Supervisors/Admins approve before scheduling.

3. **Automation & Smart AI Center**:
   - Rule-based workflow engine: Keyword matching, negative sentiment escalation, and out-of-hours auto-replies.
   - Knowledge-base grounded AI suggested reply assistant.

4. **Multi-Tenant Security & RBAC**:
   - 4 explicit roles: `admin`, `supervisor`, `agent`, `social_manager`.
   - 100% Row Level Security (RLS) enforcement across all tables in PostgreSQL.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

### 2. Installation
```bash
cd ehy-connect
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: If you leave `ZERNIO_API_KEY` and Meta secrets blank, the application automatically runs in resilient sandbox mode with realistic mock data!)*

### 4. Database Setup (Supabase)
Run the migration scripts in order:
```bash
# 1. Core Schema & Indexes
supabase db execute -f supabase/migrations/20261020_ehy_connect_core_schema.sql

# 2. Row Level Security & RBAC Policies
supabase db execute -f supabase/migrations/20261020_ehy_connect_rbac_rls.sql

# 3. Production-Realistic Seed Data
supabase db execute -f supabase/seed.sql
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## ⚡ Standalone Zero-Setup Preview
For instant demonstration without running Node or Supabase, open the single-file showcase directly in any browser:
```text
c:\sharing1\ML4\ehy-connect-showcase.html
```

---

## ☁️ Vercel One-Click Deployment Guide

1. Push this repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **Add New Project** and select `ehy-connect`.
3. Set the Framework Preset to **Next.js**.
4. Configure the environment variables from `.env.example`.
5. Click **Deploy**. The webhook routes and real-time dashboard will be live within 90 seconds!
