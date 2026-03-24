# Lawyer Free — iOS App (React Native/Expo) Design

**Date:** 2026-03-23
**Status:** Approved
**Approach:** React Native with Expo (Approach A — maximize code sharing)

## Decision Summary

10-person team evaluated three approaches:
- **A) React Native/Expo** — 60-70% code sharing, 15-22 weeks ← **SELECTED**
- B) Native SwiftUI — 10-15% sharing, 6-12 months, best native feel but unsustainable maintenance
- C) Capacitor/PWA — 90-95% sharing but unacceptable quality for a paid legal tool

React Native chosen because: app is I/O bound (no native perf advantage), full parity requires shared business logic to avoid double-maintenance, and quality ceiling is 8-9/10 native feel with NativeWind + expo-router.

---

## Section 1: Project Structure & Code Sharing

### Monorepo with Turborepo

```
lawyer-free/
├── apps/
│   ├── web/                    ← existing Next.js app (moved here)
│   └── mobile/                 ← new Expo app
├── packages/
│   ├── shared/
│   │   ├── schemas/            ← Zod schemas (from src/lib/schemas/)
│   │   ├── api-client/         ← typed API client (extracted from web fetchers)
│   │   ├── guided-steps/       ← step definitions & branching logic
│   │   ├── discovery/          ← discovery templates & logic
│   │   ├── motions/            ← motion templates & logic
│   │   ├── courts/             ← court data & rules
│   │   ├── rules/              ← business rules engine
│   │   ├── subscription/       ← billing/plan logic
│   │   └── types/              ← shared TypeScript types
│   └── ui/                     ← (future) shared component abstractions
├── supabase/                   ← unchanged
├── tests/                      ← unchanged (web tests)
├── turbo.json
└── package.json                ← workspace root
```

### Sharing Matrix

| Layer | Shared? | Notes |
|-------|---------|-------|
| Zod schemas (25 files) | Yes | Validation logic identical |
| API client / fetchers | Yes | Extract typed client, both apps consume |
| Guided step definitions | Yes | Step configs, branching logic, task keys |
| Discovery templates | Yes | Pack definitions, objection types |
| Motion templates | Yes | Template structures, field definitions |
| Court rules / data | Yes | Jurisdiction logic, filing requirements |
| Business rules | Yes | Status transitions, deadline calculations |
| Subscription logic | Yes | Plan gates, feature flags |
| React UI components | No | Web = HTML/CSS, Mobile = RN primitives |
| Navigation | No | expo-router vs next/navigation |
| Styling | No | Tailwind CSS vs NativeWind (similar syntax) |

Web app moves to `apps/web/` with zero functional changes — just import path updates. Web must pass all tests before mobile work begins.

---

## Section 2: Mobile App Architecture

### Expo Setup

- Expo SDK 53+ with expo-router v4 (file-based routing)
- Expo Dev Client (custom native build for Stripe, secure storage)
- EAS Build + Submit for TestFlight/App Store

### Navigation Structure

```
mobile/app/
├── (auth)/
│   ├── login.tsx
│   ├── signup.tsx
│   └── reset-password.tsx
├── (tabs)/
│   ├── cases/
│   │   ├── index.tsx                ← case list
│   │   └── [id]/
│   │       ├── (tabs)/             ← case dashboard tabs
│   │       │   ├── overview.tsx
│   │       │   ├── deadlines.tsx
│   │       │   ├── discovery.tsx
│   │       │   ├── evidence.tsx
│   │       │   ├── exhibits.tsx
│   │       │   ├── case-file.tsx
│   │       │   ├── motions.tsx
│   │       │   ├── research.tsx
│   │       │   ├── binders.tsx
│   │       │   ├── emails.tsx
│   │       │   ├── activity.tsx
│   │       │   └── health.tsx
│   │       └── step/[taskId].tsx
│   ├── settings.tsx
│   ├── help.tsx
│   └── courts.tsx
├── shared/[token].tsx
├── assess.tsx
└── _layout.tsx
```

### Data Layer

```
Supabase Auth (expo-secure-store for token storage)
    → Shared API Client (packages/shared/api-client)
    → TanStack React Query (caching, optimistic updates, offline queue)
    → UI Components
```

- Supabase JS client works directly in React Native
- Auth tokens in expo-secure-store (iOS Keychain)
- TanStack React Query for server state (replaces web SWR/fetch pattern)
- No local database for v1 — Supabase is source of truth

### Native Capabilities

| Feature | Expo Module | Purpose |
|---------|------------|---------|
| Push notifications | expo-notifications | Deadline reminders, case updates |
| Camera | expo-camera | Evidence capture |
| Document scanner | expo-camera + vision | Court document scanning |
| Biometrics | expo-local-authentication | Face ID/Touch ID app lock |
| File sharing | expo-sharing | Export PDFs, share case files |
| Secure storage | expo-secure-store | Auth tokens, sensitive data |
| Calendar | expo-calendar | Write deadlines to iOS Calendar |
| Haptics | expo-haptics | Feedback on task completion |

### AI Streaming

- `fetch` with `ReadableStream` (supported in RN New Architecture)
- Same API endpoints, same streaming format
- Custom `StreamingText` component with typing animation

---

## Section 3: UI & Design System

### NativeWind v4

Tailwind class names on RN components:

```tsx
// Web:  <div className="bg-warm-bg text-warm-text rounded-lg p-4">
// Mobile: <View className="bg-warm-bg text-warm-text rounded-lg p-4">
```

### Design Token Mapping

| Web Token | Value | NativeWind |
|-----------|-------|------------|
| --warm-bg | #FAFAF8 | bg-warm-bg |
| --warm-text | #1C1917 | text-warm-text |
| --warm-muted | #78716C | text-warm-muted |
| --warm-border | #E7E5E4 | border-warm-border |
| --calm-green | #16A34A | text-calm-green |
| --calm-amber | #D97706 | text-calm-amber |
| --calm-indigo | #4F46E5 | text-calm-indigo |

### Component Mapping

| Web (shadcn/ui) | Mobile Equivalent |
|-----------------|-------------------|
| Card | Card (react-native-reusables) |
| Tabs | Native Tab Navigator (expo-router) |
| Dialog/AlertDialog | React Native Modal |
| Progress | Progress (react-native-reusables) |
| Toast (Sonner) | burnt / expo-notifications |
| Form inputs | RN TextInput + NativeWind |
| Dropdown/Select | @react-native-picker |
| Date picker | @react-native-community/datetimepicker |

### iOS UX Adaptations

- Bottom tab bar (not sidebar) for main navigation
- Case dashboard: segmented control / scrollable tab bar for sub-sections
- Standard iOS back button + swipe-to-go-back
- Guided Step Runner: full-screen modal sheet, progress bar, haptic on completion
- Evidence capture: direct camera with overlay guide, multi-photo burst, auto-crop
- Typography: SF Pro (system font) with Dynamic Type support

### Animations

- Reanimated 3 replaces Framer Motion
- Native iOS push/modal transitions (don't fight the platform)
- Skeleton loading states for network fetches

### Design Rules (carried from DESIGN.md)

- Never use "ERROR", "FAILED", "WARNING", "URGENT", "OVERDUE"
- Never use red for urgency (calm-amber)
- Every feature: loading, empty, error, success, partial states
- 44x44px minimum touch targets

---

## Section 4: Key Feature Implementation

### 4a. Guided Step Runner

Shared step definitions in `packages/shared/guided-steps/`. Mobile uses fewer, more generic renderers:

```
mobile/components/steps/
├── StepRunner.tsx     ← orchestrator
├── StepShell.tsx      ← common chrome (progress, nav, haptics)
├── FormStep.tsx       ← generic form step (~60% of steps)
├── UploadStep.tsx     ← evidence/document upload
├── ReviewStep.tsx     ← review & confirm
├── GenerateStep.tsx   ← AI document generation
└── InfoStep.tsx       ← informational/educational
```

### 4b. AI Document Generation

User taps "Generate" → shared Zod validation → API call to existing endpoint → streaming response → user reviews/edits → pdf-lib generates on-device → expo-sharing to save/send.

### 4c. Discovery Workflow

All template logic shared. Mobile UX: bottom sheet template picker, full-screen response editor with auto-save, camera capture for proof of service + OCR.

### 4d. Evidence Vault (mobile advantage)

Camera → expo-camera with document detection → auto-crop → compress → upload → AI categorization. Batch capture mode, photo metadata auto-attached.

### 4e. Stripe Billing

@stripe/stripe-react-native for payment sheet. v1: web billing portal link from app (avoids IAP complexity). App opens Safari view to /pricing for new subscriptions.

### 4f. Gmail Integration

expo-auth-session for Google OAuth → same API endpoints → email list in FlatList → email detail in WebView (acceptable for HTML emails).

### 4g. Trial Binders & PDF

Server-side generation (same endpoint) → download via expo-file-system → preview in Quick Look → share via expo-sharing.

### 4h. Legal Research

Same endpoints. Chat-like streaming UI for "Ask AI". Card-based authority list with expandable citations.

### 4i. Push Notifications (new infrastructure)

New `device_tokens` table in Supabase. Extend existing /api/cron/send-reminders to send via Expo Push API. Types: deadline approaching, task unlocked, AI document ready, case health changed.

### 4j. Offline (v1 — lightweight)

React Query caches all fetched data. Offline: read from cache, show banner. Mutations queue locally, sync on reconnect. No full offline-first for v1.

---

## Section 5: Testing & Deployment

### Testing Pyramid

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Shared packages (schemas, logic, rules) |
| RLS | Vitest + local Supabase | Row-level security policies |
| Web E2E | Playwright | Existing 100+ tests, unchanged |
| Mobile E2E | Maestro | 10-15 critical flows |
| Build verification | EAS Build | Every PR compiles |

### CI Pipeline (GitHub Actions)

PR → lint + typecheck (turbo) → vitest (shared) → vitest:rls → playwright (web) → maestro (mobile) → eas build --profile preview.

### Distribution

| Stage | Tool | Trigger |
|-------|------|---------|
| Dev | Expo Dev Client | Local |
| Preview | EAS Build (simulator) | Every PR |
| TestFlight | EAS Build + Submit | Merge to main |
| App Store | EAS Submit | Manual promotion |
| Web | Vercel | Merge to main (unchanged) |

### App Store Considerations

- Demo account + walkthrough for reviewers (legal apps get scrutiny)
- Clear "not legal advice" disclaimer
- Privacy Nutrition Label: email, name, payment, usage data, diagnostics
- Data deletion endpoint already exists (/api/account/delete)
- Minimum iOS 16+

---

## Section 6: Migration Roadmap

### Phase 0: Monorepo Setup (weeks 1-2)

- Initialize Turborepo, move Next.js to apps/web/
- Extract shared packages from src/lib/
- Create typed API client in packages/shared/api-client/
- Update imports, verify all web tests pass
- **Gate:** Web green before Phase 1

### Phase 1: Mobile Shell (weeks 3-5)

- Initialize Expo app in apps/mobile/
- Configure NativeWind, expo-router, expo-secure-store
- Auth flow (login, signup, reset password)
- Case list screen + case dashboard shell
- EAS Build + CI pipeline
- **Deliverable:** TestFlight build — login and view cases

### Phase 2: Core Workflow (weeks 6-11)

- Step Runner (StepShell + generic renderers)
- Deadlines (list, detail, calendar export, push notifications)
- Push notification infrastructure (device_tokens table, cron update)
- Evidence vault (camera, upload, categorize, gallery)
- Case overview/health + activity timeline
- **Deliverable:** TestFlight build — primary user loop

### Phase 3: AI & Documents (weeks 12-15)

- Streaming text component
- Document generation flow
- Legal research (search, ask, authorities, citation verification)
- Motion builder
- Case strategy
- **Deliverable:** TestFlight build — full AI capabilities

### Phase 4: Advanced Features (weeks 16-19)

- Discovery management (packs, responses, objections, serve, meet & confer)
- Exhibit sets + drag-and-drop reorder
- Trial binder generation + download + Quick Look
- Gmail integration
- Case file organization
- **Deliverable:** TestFlight build — approaching full parity

### Phase 5: Polish & Ship (weeks 20-22)

- Settings, help, courts, sharing, assessment
- Onboarding flow
- Maestro E2E suite
- App Store assets + submission
- Performance audit + accessibility pass
- **Deliverable:** App Store submission

### Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Monorepo breaks web | Phase 0 isolated; web must pass all tests first |
| App Store rejection | Demo account, clear disclaimers, responsive to reviewers |
| Stripe IAP requirement | v1 web billing portal; monitor Apple's rules |
| Step renderer complexity | Generic renderers; custom only when truly needed |
| Expo module gaps | Validate all modules in Phase 1 shell build |
| Push deliverability | Expo push receipts; email fallback already exists |

### Timeline

```
Phase 0 ████                          (weeks 1-2)
Phase 1   ██████                      (weeks 3-5)
Phase 2        ████████████           (weeks 6-11)
Phase 3                  ████████     (weeks 12-15)
Phase 4                      ████████ (weeks 16-19)
Phase 5                          ██████ (weeks 20-22)
```

Total: ~15-22 weeks for full feature parity.
