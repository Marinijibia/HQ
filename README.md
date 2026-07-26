# HQ

<div align="center">

<img src="docs/assets/logo.svg" alt="HQ Logo" width="140">

# HQ

### AI Operating System for Modern Organizations

**One platform for intelligence, collaboration, automation, and organizational knowledge.**

<p align="center">
  <strong>Built by Netify Ltd.</strong>
</p>

---

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript\&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs\&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs\&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-000020?logo=expo\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker\&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-4285F4?logo=googlecloud\&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

</div>

---

## Overview

HQ is an **AI Operating System** built for organizations that want to unify artificial intelligence, collaboration, organizational knowledge, administration, analytics, and automation into a single platform.

Instead of managing disconnected software for communication, documentation, AI assistants, project management, analytics, and administration, HQ provides one intelligent workspace where people, data, and AI work together.

Whether you're a startup, enterprise, educational institution, government agency, or non-profit organization, HQ provides the foundation for building an AI-enabled workplace.

---

# Why HQ?

Modern organizations rely on dozens of disconnected tools.

* Chat applications
* AI assistants
* Documentation platforms
* Project management software
* File storage
* Analytics dashboards
* Administrative portals
* Workflow automation

Each solves a different problem.

HQ brings them together into one intelligent platform designed to become the digital headquarters of an organization.

---

# Core Capabilities

## 🤖 AI Workspace

Collaborate with specialized AI assistants designed for writing, research, analysis, planning, coding, administration, and decision support.

---

## 🏢 Organization Management

Manage organizations, workspaces, departments, teams, users, permissions, and resources from a unified platform.

---

## 💬 Intelligent Collaboration

Persistent conversations with organizational memory that make knowledge searchable and reusable.

---

## 📚 Organizational Knowledge

Build a centralized knowledge base powered by AI for policies, procedures, documentation, and institutional knowledge.

---

## 📊 Executive Intelligence

Real-time dashboards and insights that help leadership monitor organizational performance and make informed decisions.

---

## ⚙️ Automation

Automate repetitive tasks, approvals, notifications, and workflows using AI-powered automation.

---

## 🔐 Enterprise Security

Designed with authentication, authorization, role-based access control, audit logging, and secure cloud infrastructure.

---

## ☁️ Cloud Native

Built to scale using modern cloud technologies with support for secure multi-tenant deployments.

---

# Architecture

```text
                                Users
                                   │
           ┌───────────────────────┼────────────────────────┐
           │                       │                        │
      HQ Web                 HQ Mobile                HQ Admin
           │                       │                        │
           └───────────────────────┼────────────────────────┘
                                   │
                              HQ API (NestJS)
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
   PostgreSQL               AI Providers             Cloud Storage
        │
                    Google Cloud Platform
```

---

# Technology Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Frontend       | Next.js               |
| Mobile         | Expo                  |
| Backend        | NestJS                |
| Language       | TypeScript            |
| Database       | PostgreSQL            |
| ORM            | Prisma                |
| Monorepo       | Turborepo             |
| Cloud Platform | Google Cloud Platform |
| Storage        | Google Cloud Storage  |
| Containers     | Docker                |
| CI/CD          | GitHub Actions        |
| DNS            | Cloudflare            |
| Email          | Resend                |

---

# Repository Structure

```text
.
├── apps/
│   ├── admin/
│   ├── api/
│   ├── mobile/
│   └── web/
│
├── packages/
│
├── infrastructure/
│
├── docs/
│
├── .github/
│
└── README.md
```

### Applications

| Directory         | Description                             |
| ----------------- | --------------------------------------- |
| `apps/api`        | NestJS backend API                      |
| `apps/web`        | Customer-facing web application         |
| `apps/admin`      | Netify platform administration portal   |
| `apps/mobile`     | Native mobile application               |
| `packages/`       | Shared libraries and utilities          |
| `docs/`           | Project documentation                   |
| `infrastructure/` | Deployment and infrastructure resources |

---

# Getting Started

## Prerequisites

* Node.js 22+
* Yarn
* Docker
* PostgreSQL

Clone the repository.

```bash
git clone https://github.com/Marinijibia/HQ.git

cd HQ
```

Install dependencies.

```bash
yarn install
```

Copy the environment file.

```bash
cp .env.example .env
```

Start development.

```bash
yarn dev
```

---

# Environment Variables

Each application includes an `.env.example` file.

Common variables include:

| Variable              | Purpose               |
| --------------------- | --------------------- |
| `DATABASE_URL`        | PostgreSQL connection |
| `JWT_SECRET`          | Authentication secret |
| `APP_ENCRYPTION_KEY`  | Encryption key        |
| `OPENAI_API_KEY`      | AI integration        |
| `RESEND_API_KEY`      | Email delivery        |
| `NEXT_PUBLIC_API_URL` | Public API endpoint   |

Never commit production secrets.

---

# Development

HQ uses a Turborepo monorepo architecture.

Run all applications:

```bash
yarn dev
```

Run linting:

```bash
yarn lint
```

Build the repository:

```bash
yarn build
```

---

# Deployment

HQ is designed for Google Cloud Platform.

Production deployment pipeline:

```text
Developer
      │
      ▼
GitHub
      │
      ▼
GitHub Actions
      │
      ▼
Artifact Registry
      │
      ▼
Cloud Run
      │
      ▼
Cloud SQL
```

Infrastructure includes:

* Google Cloud Run
* Cloud SQL (PostgreSQL)
* Secret Manager
* Artifact Registry
* Cloud Storage
* Cloudflare
* Resend

---

# Roadmap

## Phase 1 — Foundation

* ✅ Monorepo
* ✅ Google Cloud Infrastructure
* ✅ Cloud SQL
* ✅ Secret Manager
* ✅ Artifact Registry
* ✅ Cloud Storage

## Phase 2 — Deployment

* 🚧 Docker
* 🚧 Cloud Run
* 🚧 Continuous Deployment

## Phase 3 — Beta

* 🚧 Web Platform
* 🚧 Admin Platform
* 🚧 Initial Organizations

## Phase 4 — Public Release

* Mobile Application
* Enterprise Features
* AI Marketplace
* Public APIs

---

# Contributing

We welcome contributions that improve HQ.

Please read **CONTRIBUTING.md** before opening a pull request.

---

# Security

If you discover a security vulnerability, please do **not** open a public issue.

Contact:

**[security@netify.ng](mailto:security@netify.ng)**

See **SECURITY.md** for our responsible disclosure process.

---

# License

Copyright © 2026 **Netify Ltd.**

All Rights Reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software is prohibited without prior written permission from Netify Ltd.

---

<div align="center">

### HQ

**AI Operating System for Modern Organizations**

Designed and built by **Netify Ltd.**

</div>
