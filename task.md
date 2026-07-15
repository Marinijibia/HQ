# Task Tracker — Phase 6 — FTX & Guide Mode — Completed

## 1. Context and State Configuration
- [x] Create `apps/web/src/contexts/guide-mode-context.tsx` to manage guide states, completed mission counts, visited pages, confusion detection, and log events.
- [x] Update layout.tsx to import `GuideModeProvider` and track route changes.

## 2. Guide Mode UI Component
- [x] Create `apps/web/src/components/guide-mode-banner.tsx` displaying the guide step, progress (e.g. Mission 1 of 2), and active contextual directions.

## 3. Dynamic Onboarding Dashboard
- [x] Modify `apps/web/src/app/(dashboard)/dashboard/page.tsx` to handle the interactive onboarding workflow steps (welcome state, reasoning checklist, team assignment cards, progress updates, exploration shortcuts).

## 4. Settings Preferences Toggle
- [x] Update `apps/web/src/app/(dashboard)/settings/page.tsx` with toggle switch and reset actions for Guide Mode.
