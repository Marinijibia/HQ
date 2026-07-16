# Task Tracker — Refined Inline Onboarding Flow — Completed

## 1. Land on Discussions
- [x] Redirect user to `/discussions` after login (`login/page.tsx` and `onboarding/first-mission/page.tsx`).
- [x] Update `/discussions` layout:
  - If Guide Mode is active and step is `'arrival'`, hide previous history list to keep it clean.
  - Render the "Welcome to HQ. Your Executive Board is online..." greeting and starters.

## 2. Talk in Boardroom & CEO Reasoner Checklist
- [x] Update `/discussions/[id]/page.tsx`:
  - When the user clicks "Approve & Launch Mission", render an animated **CEO Reasoner Checklist** modal showing planning checks (Business Type, Goal, Timeline, Required Departments, Risks, Deliverables) for 3 seconds before completing conversion and redirecting to `/missions/[id]`.

## 3. Mission Timeline & Asset Center Navigation
- [x] Update `/missions/[id]/page.tsx` or banner:
  - Guide the user to watch task completion.
  - Recommend clicking "Open Asset Center".
- [x] Update `/assets/page.tsx` or banner:
  - Guide the user to click the deliverable file.
  - Recommend navigating to `/dashboard` to view the CEO briefing summary.

## 4. Dashboard Summary
- [x] Keep the summary report card on `/dashboard` and restore all normal charts/widgets.
