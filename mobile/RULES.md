# 📜 HQ Mobile Engineering & Design Rules

This document establishes the mandatory standards and operating principles for the **HQ Mobile Application (`hq/mobile`)**. Every feature, component, and API integration must strictly adhere to these rules.

---

## 🎨 Rule 1: 100% Brand Consistency Across the Entire Application
- **Unified Design Tokens**: Exclusively use `HQColors` (`#0A0A0C` Dark Onyx background, `#0A84FF` Primary Blue, `#30D158` Operational Cyan, `#BF5AF2` Neural Purple, `#F43F5E` Alert Rose, `#1E293B` Glass Border).
- **Physical Brand Emblem**: The physical **HQ Logo (`HQLogo`)** must be displayed with high-contrast, glowing backing and exact brand proportions.
- **Typography & Iconography**: Premium Inter / system sans-serif font stack combined with crisp `lucide-react-native` icons.

---

## 🔌 Rule 2: Zero Mock Data — Real Local & Production Backend Integration
- **NO MOCK DATA**: Mock data arrays or hardcoded placeholder objects are strictly forbidden in production code.
- **Dual Environment API Client**: All data must be fetched dynamically from the NestJS backend (`apps/api`) via `lib/api-client.ts`.
- **Dynamic Environment Switching**: Seamlessly support both Local Development (`http://localhost:3001` / `http://10.0.2.2:3001`) and Production Backend (`https://api.hq.netify.ng`).

---

## 🏆 Rule 3: Production-Ready Feature Gates (No Half-Built Features)
- **Feature Completion Standard**: Never consider a feature complete or move on to another function until it is **100% Production Ready**.
- **Definition of Ready**:
  1. Full backend API integration with request/response serialization.
  2. 100% TypeScript type safety (`npx tsc --noEmit` passes with 0 errors).
  3. Real-world error handling for network timeouts, 4xx/5xx responses, and unauthorized states.
  4. Tested and verified on physical Expo Go / Metro runtime.

---

## ⚡ Rule 4: 21st Century Premium, Modern UI Aesthetics
- **WOW Factor First Impression**: The user interface must look state-of-the-art, executive, and futuristic.
- **Visual Design Standard**:
  - Deep onyx dark modes with glassmorphic cards and subtle border highlights (`border-slate-800`).
  - Glowing status badges, confidence gauges, and vibrant accent glows (`shadow-cyan-500/20`).
  - Touch feedback micro-interactions (`activeOpacity={0.8}`).
  - Zero raw default styling—every screen must feel crafted for Fortune 500 C-Suite executives.

---

## 🛡️ Rule 5: Robust Network Resilience & Graceful UI States
- **Loading Skeletons**: Every async API call must display a polished loading skeleton or spinner instead of blank screens.
- **Empty States**: Clear, styled empty state displays when API queries return zero results.
- **Retry Mechanisms**: Provide clean "Tap to Retry" actions when network connection fails.

---

## 🧹 Rule 6: Clean Architecture & Zero Technical Debt
- **No Dead Code**: Remove all unused imports, temporary scratch files, or commented-out blocks immediately.
- **Modular Components**: Keep components decoupled, reusable, and single-purpose.
- **Strict Typing**: No `any` types unless strictly necessary for third-party library boundaries.
