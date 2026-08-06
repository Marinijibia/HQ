<div align="center">

# 🏛️ HQ — The Autonomous AI Operating System

### The World's First Enterprise AI OS for Autonomous Organization Orchestration

**A unified, multi-tenant operating system for AI C-Suite orchestration, real-time voice boardrooms, multi-llm intelligence, and organizational automation.**

[Website](https://hq.netify.ng) • [Admin Console](https://admin.netify.ng) • [Documentation](https://hq.netify.ng/docs) • [API Swagger Docs](https://api.hq.netify.ng/api/docs)

---

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo_SDK-54.0-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24.0-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-GCP-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

</div>

---

## 📋 Table of Contents

- [ Overview & Vision](#-overview--vision)
- [ Core Operating Principles](#-core-operating-principles)
- [ Complete AI Executive Roster](#-complete-ai-executive-roster)
- [ Mixture-of-Executives (MoE) Architecture](#-mixture-of-executives-moe-architecture)
- [ System & Network Architecture](#-system--network-architecture)
- [ Key Feature Modules](#-key-feature-modules)
  - [1. ASAD Voice Boardroom Engine](#1-asad-voice-boardroom-engine)
  - [2. Multi-LLM Provider Engine](#2-multi-llm-provider-engine)
  - [3. Executive Marketplace & Expansion Catalog](#3-executive-marketplace--expansion-catalog)
  - [4. Enterprise Multi-Tenancy & Security Vault](#4-enterprise-multi-tenancy--security-vault)
  - [5. Cross-Platform App Suite](#5-cross-platform-app-suite)
- [ Repository Structure](#-repository-structure)
- [ Database Schema & Domain Model](#-database-schema--domain-model)
- [ API Endpoint Reference](#-api-endpoint-reference)
- [ Developer Quick Start](#-developer-quick-start)
- [ Environment Variables Specification](#-environment-variables-specification)
- [ Deployment & Cloud Infrastructure](#-deployment--cloud-infrastructure)
- [ Security & Governance](#-security--governance)
- [ Product Roadmap](#-product-roadmap)
- [ License & Ownership](#-license--ownership)

---

## 🌟 Overview & Vision

**HQ** is a proprietary **AI Operating System** built by **Netify Ltd.** to replace fragmented corporate software stacks with an autonomous, self-orchestrating digital headquarters.

Modern companies spend millions managing disconnected tools for internal chat, documentation, project management, customer analytics, executive reports, and admin portals. **HQ** unifies these domains into a single intelligent platform where human executives collaborate directly with an autonomous roster of **AI C-Suite Executives**.

Led by **ASAD (Chief Executive Officer AI)**, HQ breaks complex organizational objectives down into structured sub-missions, delegates them to specialized department heads, verifies work quality via dedicated QA processes, and synthesizes institutional memory into actionable insights.

---

## ⚙️ Core Operating Principles

1. **Executive Autonomy**: AI agents are not mere chatbots; they hold domain roles, possess system prompts, manage task queues, and collaborate across departments.
2. **Human-in-the-Loop Governance**: Human leaders retain ultimate approval authority over high-impact decisions, billing allocations, and system permissions.
3. **Strict Tenant Isolation**: Multi-tenant database design ensures that company data, knowledge assets, and conversations are isolated by `companyId`.
4. **Model Agnostic Routing**: The underlying AI provider factory automatically selects optimal models (OpenAI, Anthropic, Gemini, Vertex AI, or local models) based on task requirements and cost constraints.
5. **Zero-Trust Security**: One-time initial Super Admin setup prevents unauthorized admin registration post-deployment.

---

## 🤖 Complete AI Executive Roster

HQ ships with **5 default active executives** and an expandable catalog of **10+ marketplace executives**:

### 🛡️ Default Active Roster

| Executive | Title | Domain & Core Responsibilities |
| :--- | :--- | :--- |
| **ASAD** | **Chief Executive Officer (CEO)** | Central AI leader of HQ. Oversees strategic direction, scopes owner missions, orchestrates cross-department workflows, and guides users to marketplace upgrades when needed capabilities are missing. |
| **Teema** | **Operations Director (COO)** | Manages workflow execution velocity, monitors active task queues, optimizes resource allocation, and tracks mission execution timelines. |
| **Legal** | **Legal & Compliance Director** | Enforces regulatory compliance, conducts risk audits, supervises data retention policies, and enforces legal hold safeguards. |
| **Resource Director** | **Human Resources Director (CHRO)** | Manages personnel structures, team onboarding, organizational role alignment, and workforce productivity. |
| **Mr. Intelligence** | **Public Research Agent (CRO)** | Conducts deep web research on registered companies, industry domains, competitor analysis, and updates `OrgIntelligence` memory. |

### 🛒 Installable Marketplace Roster

| Executive | Title | Specialization |
| :--- | :--- | :--- |
| **Dr. Hiroshi Tanaka** | **Technology Director (CTO)** | Distributed cloud microservices, technical feasibility audits, system architecture, and GCP infrastructure. |
| **Linus Kovacs** | **Software Engineering Director** | Full-stack web & mobile code generation, git lifecycles, automated testing, and technical documentation. |
| **Dr. Sarah Ndiaye** | **AI & Machine Learning Director** | LLM prompt optimization, Vector RAG performance tuning, embedding models, and evaluation benchmarks. |
| **Sophia Sterling** | **Finance Director (CFO)** | Financial ledgers, corporate forecasting, budget allocation audits, and Stripe transaction structures. |
| **Jordan Belfort** | **Sales Director (CRO)** | Enterprise sales pipelines, lead generation strategies, contract closures, and revenue growth. |
| **Amara Okafor** | **Marketing Director (CMO)** | Viral digital marketing campaigns, target demographic acquisition, and brand positioning. |
| **Marcus Brody** | **Product Director (CPO)** | Product roadmaps, agile user story generation, backlog prioritization, and feature specs. |
| **Sienna Brooks** | **UX/UI Design Director** | Component design tokens, glassmorphic UI specs, accessibility standards, and visual brand guidelines. |
| **Rashid Al-Mansoori** | **Petroleum Industry Director** | Specialized energy sector intelligence, fuel logistics, oil & gas compliance, and supply chain tracking. |
| **Yuki Sato** | **Customer Success Director** | Customer churn mitigation, support ticket resolution velocity, and user onboarding flows. |

---

## 🧠 Mixture-of-Executives (MoE) Architecture

When a human leader submits an objective to HQ, the **Mixture-of-Executives (MoE)** engine processes the task through a 5-stage lifecycle:

```text
  [ Human Executive Directive ]
                │
                ▼
  [ 1. ASAD (CEO) Mission Decomposition ]
    ├── Scopes overall objective into sub-missions
    └── Assigns feasibility checks to department heads
                │
                ▼
  [ 2. Department Orchestration & Parallel Execution ]
    ├── Operations (Teema): Schedules task queue execution
    ├── Technology (Hiroshi/Linus): Generates code & technical specs
    ├── Research (Mr. Intelligence): Crawls public web data
    └── Legal & Finance: Performs compliance & budget audits
                │
                ▼
  [ 3. Quality Assurance (QA Executive Verification) ]
    ├── Evaluates output against safety guardrails & requirements
    └── Triggers revision loop if criteria are unmet
                │
                ▼
  [ 4. Memory Ingestion & OrgIntelligence Update ]
    └── Persists verified output into central organizational vector store
                │
                ▼
  [ 5. Executive Briefing Synthesis ]
    └── Delivers unified executive report to Human Leader (Text + Audio)
```

---

## 🏗️ System & Network Architecture

```mermaid
graph TD
    subgraph Clients
        Web[HQ Web Application - Next.js 15 / React 19]
        Mobile[HQ Mobile App - Expo SDK 54 / NativeWind v4]
        Admin[HQ Admin Portal - Next.js 15 / Platform Console]
    end

    subgraph CDN & Security Layer
        Cloudflare[Cloudflare DNS / Edge WAF]
    end

    Clients --> Cloudflare
    Cloudflare --> Gateway[HQ NestJS API Gateway - Port 5000]

    subgraph API Modules & Services
        Gateway --> AuthMod[Auth Module: Firebase / OTP / Redis]
        Gateway --> CeoMod[CEO & MoE Mission Orchestration]
        Gateway --> ExecMod[Executive Roster & CMS Module]
        Gateway --> MktMod[Marketplace & Installation Engine]
        Gateway --> BillingMod[Stripe Billing & Subscriptions]
        Gateway --> IntelMod[Mr. Intelligence Research Web Crawler]
    end

    subgraph Multi-LLM Provider Engine
        CeoMod --> Factory[AI Provider Factory]
        Factory --> OpenAI[OpenAI API - GPT-4o]
        Factory --> Anthropic[Anthropic API - Claude 3.5 Sonnet]
        Factory --> Gemini[Google Gemini 2.0]
        Factory --> Vertex[Google Vertex AI]
    end

    subgraph Storage & Infrastructure
        Gateway --> PostgreSQL[(Cloud SQL PostgreSQL)]
        Gateway --> Redis[(Redis Cache / OTP Store)]
        Gateway --> GCS[Google Cloud Storage]
        Gateway --> Resend[Resend Transactional Email API]
    end
```

---

## 🔑 Key Feature Modules

### 1. ASAD Voice Boardroom Engine
- **Hands-Free Speech Interface**: Real-time voice interaction for boardroom briefings.
- **Audio Directive Dock**: Integrated into Web (`apps/web/src/components/voice/`), Admin (`apps/admin/src/components/voice/`), and Mobile (`mobile/components/voice/`).
- **Engine Provider**: Speech-to-Text and Text-to-Speech audio streaming with natural executive cadence.

### 2. Multi-LLM Provider Engine
- **Provider Switching**: Seamlessly toggle between OpenAI, Anthropic, Gemini, Vertex AI, or local LLMs via unified `AIProvider` interfaces.
- **Token Analytics**: Log prompt tokens, completion tokens, latency, and cost per executive invocation.

### 3. Executive Marketplace & Expansion Catalog
- **1-Click Installs**: Expand your organizational capabilities by installing individual executives or entire department suites.
- **Billing Tier Verification**: Automatically checks subscription permissions (`FREE`, `GROWTH`, `ENTERPRISE`) before activating marketplace items.

### 4. Enterprise Multi-Tenancy & Security Vault
- **Row-Level Tenant Isolation**: All database queries enforce strict `companyId` scoping.
- **One-Time Super Admin Lock**: Automatically locks initial Super Admin registration once setup is complete (`http://localhost:3002/register`).

### 5. Cross-Platform App Suite
- **Web App (`apps/web`)**: Next.js 15, React 19, Tailwind CSS, Progressive Web App (PWA) with offline Service Worker support (`public/sw.js`).
- **Admin Portal (`apps/admin`)**: Dedicated console for system administrators to manage tenants, system telemetry, and staff credentials.
- **Mobile App (`mobile` & `apps/mobile`)**: Expo SDK 54, React Native, NativeWind v4, dark mode aesthetics, and biometric local authentication support.

---

## 📁 Repository Structure

```text
HQ/
├── apps/
│   ├── admin/                 # Netify Platform Administration Portal (Next.js 15)
│   │   ├── src/app/           # App Router pages (login, dashboard, register, forgot-password)
│   │   ├── src/components/     # Admin components (invite-user-modal, voice button)
│   │   └── Dockerfile         # Standalone production container build
│   │
│   ├── api/                   # NestJS Core Backend Gateway
│   │   ├── src/modules/
│   │   │   ├── ai/            # Multi-LLM Provider Factory & Executive Services
│   │   │   ├── asset/         # Asset Storage & File Vector Management
│   │   │   ├── auth/          # Firebase, OTP, Setup Status, Super Admin Registration
│   │   │   ├── billing/       # Stripe Plans, Checkout, and Subscriptions
│   │   │   ├── company/       # Company Onboarding & Organization Telemetry
│   │   │   ├── executive/     # CEO, Operations, Legal, HR, Finance, Research Services
│   │   │   ├── intelligence/  # Web Research Crawler & OrgIntelligence Ingestion
│   │   │   ├── marketplace/   # Catalog Listings & Installation Engine
│   │   │   └── mission/       # CEO Orchestrator, COS, MOE Execution Pipeline
│   │   └── Dockerfile         # NestJS production container build
│   │
│   ├── mobile/ & mobile/      # Expo SDK 54 Native Mobile App (React Native)
│   │   ├── app/               # Expo Router file-based navigation (tabs, modals)
│   │   ├── components/        # Mobile components (VoiceDock, ExecutiveCard, MissionPanel)
│   │   └── tailwind.config.js # NativeWind v4 theme tokens
│   │
│   └── web/                   # Executive Tenant Web Workspace (Next.js 15 + PWA)
│       ├── public/            # PWA manifest.json and sw.js Service Worker
│       ├── src/app/           # Auth, Onboarding, CEO Chat, Missions, Marketplace, Settings
│       └── Dockerfile         # Web production container build
│
├── packages/
│   ├── ai-engine/             # Shared Multi-LLM Interfaces & RAG Helpers
│   ├── analytics/            # Event Telemetry & Tracker Utilities
│   ├── database/             # Prisma Schema, Migrations, Seeders, & Tools
│   ├── design-system/        # Shared Design Tokens & Visual Specs
│   ├── executives/           # System Prompts & Executive Persona Declarations
│   ├── prompts/              # Master AI Guardrails & Prompt Templates
│   ├── sdk/                  # Type-Safe API Client SDK
│   ├── types/                # Shared TypeScript Interfaces & DTO Schemas
│   ├── ui/                   # Shared React Component Library (@hq/ui)
│   └── utils/                # Shared Formatters & Validators
│
├── infrastructure/            # GCP Cloud Run manifests & Terraform configurations
├── docs/                     # Platform Architecture Specifications & Specs
└── README.md
```

---

## 🗄️ Database Schema & Domain Model

HQ uses PostgreSQL managed via Prisma ORM (`packages/database/prisma/schema.prisma`).

### Key Entities

```text
┌──────────────┐       1:N       ┌──────────────┐       1:N       ┌──────────────┐
│   Company    │ ───────────────> │     User     │ ───────────────> │  Department  │
└──────────────┘                 └──────────────┘                 └──────────────┘
       │                                │                                │
       │ 1:N                            │ 1:N                            │ 1:N
       ▼                                ▼                                ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│ Subscription │                 ┌ Mission      │                 │  Executive   │
└──────────────┘                 └──────────────┘                 └──────────────┘
                                        │ 1:N                            │
                                        ▼                                │ 1:N
                                 ┌──────────────┐                        ▼
                                 │     Task     │                 ┌──────────────┐
                                 └──────────────┘                 │ Conversation │
                                                                  └──────────────┘
```

* **Company**: Tenant root containing name, slug, level (`FREE`, `GROWTH`, `ENTERPRISE`), and subscription details.
* **User**: Platform account linked with Firebase UID, email, role (`SUPER_ADMINISTRATOR`, `ADMINISTRATOR`, `EXECUTIVE_USER`, `MEMBER`), and company ID.
* **Executive**: AI Agent profile containing name, title, `roleKey`, system prompt, biography, and active workspace status.
* **Mission**: High-level objective assigned to the company, tracked by status (`SCOPING`, `EXECUTING`, `COMPLETED`, `PAUSED`).
* **Task**: Individual sub-task created by the CEO Orchestrator for specific executives.
* **MarketplaceListing**: Catalog item for installable executives or department suites.

---

## 🌐 API Endpoint Reference

The API runs on `http://localhost:5000` (or `https://api.hq.netify.ng`). Full Interactive Swagger UI available at `/api/docs`.

### Authentication (`/auth`)
- `GET  /auth/setup-status` — Check if initial Super Admin registration is required.
- `POST /auth/register-super-admin` — Register initial Super Administrator (allowed only when 0 Super Admins exist).
- `POST /auth/firebase` — Authenticate Firebase ID Token and resolve HQ user context.
- `POST /auth/send-otp` — Send 6-digit OTP verification email via Resend.
- `POST /auth/verify-otp` — Verify OTP code and mark email as verified.
- `POST /auth/forgot-password` — Send password reset token email.
- `POST /auth/reset-password` — Reset password using email token.
- `GET  /auth/me` — Fetch authenticated user profile, permissions, and organization context.

### Executive Orchestration (`/mission` & `/executive`)
- `POST /mission/scope` — Scope objective with ASAD (CEO) and verify department requirements.
- `POST /mission/execute` — Dispatch Mixture-of-Executives execution pipeline.
- `GET  /mission/active` — List active missions for current company tenant.
- `GET  /executive/roster` — Fetch active AI Executive roster.

### Marketplace & Subscriptions (`/marketplace` & `/billing`)
- `GET  /marketplace/listings` — Get catalog of installable executives & department suites.
- `POST /marketplace/install` — Install marketplace item to current workspace.
- `POST /billing/checkout` — Initiate Stripe Checkout session for plan upgrade.

---

## 🚀 Developer Quick Start

### Prerequisites
- **Node.js**: `v22.0.0+`
- **Yarn**: `v1.22+`
- **PostgreSQL**: `v16.0+`
- **Redis**: `v7.0+`

### Step 1: Clone Repository
```bash
git clone https://github.com/Marinijibia/HQ.git
cd HQ
```

### Step 2: Install Dependencies
```bash
yarn install
```

### Step 3: Configure Environment
Copy the environment file template:
```bash
cp .env.example .env
```

### Step 4: Setup Database & Seed Data
```bash
# Generate Prisma Client
yarn workspace @hq/database prisma generate

# Run Database Migrations
yarn workspace @hq/database prisma migrate dev --name init

# Seed Default Executives & Marketplace Data
yarn workspace @hq/database seed
```

### Step 5: Start Development Servers
```bash
yarn dev
```

App Access Points:
- 🏢 **HQ Web Workspace**: `http://localhost:3000`
- 🛡️ **HQ Admin Portal**: `http://localhost:3002`
- ⚡ **HQ API Gateway**: `http://localhost:5000`
- 📖 **Swagger OpenAPI Specs**: `http://localhost:5000/api/docs`

---

## 🔧 Environment Variables Specification

Each app includes an `.env.example` file. Essential root environment variables:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/hq_db` |
| `REDIS_URL` | Redis connection URL for OTP & cache | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | `super-secret-jwt-key` |
| `OPENAI_API_KEY` | OpenAI API Key for GPT-4o | `sk-proj-...` |
| `ANTHROPIC_API_KEY` | Anthropic API Key for Claude | `sk-ant-...` |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `RESEND_API_KEY` | Resend Email API Key | `re_...` |
| `FIREBASE_PROJECT_ID` | Firebase Auth project ID | `hq-prod-app` |
| `NEXT_PUBLIC_API_URL` | API URL for frontend apps | `http://localhost:5000` |

---

## ☁️ Deployment & Cloud Infrastructure

HQ is designed for containerized deployment on **Google Cloud Platform (GCP)**:

```text
[ Developer Commit ] ──> [ GitHub Repo ] ──> [ GitHub Actions CI/CD ]
                                                    │
                                                    ▼
                                       [ GCP Artifact Registry ]
                                                    │
                                                    ▼
                                      [ Google Cloud Run Services ]
                                        ├── hq-api  (Port 5000)
                                        ├── hq-web  (Port 3000)
                                        └── hq-admin (Port 3002)
                                                    │
                                                    ▼
                                    [ Google Cloud SQL PostgreSQL ]
```

---

## 🔒 Security & Governance

- **Responsible Disclosure**: To report security vulnerabilities, email **[security@netify.ng](mailto:security@netify.ng)**.
- **Security Audit**: All API endpoints require Bearer Token authorization with validated custom claims.

---

## 📄 License & Ownership

Copyright © 2026 **Netify Ltd.** All Rights Reserved.

This software is proprietary and confidential. Unauthorized copying, modification, or distribution is strictly prohibited without written authorization from Netify Ltd.

<div align="center">

---
### 🏛️ **HQ** • Built with ❤️ by **Netify Ltd.**

</div>
