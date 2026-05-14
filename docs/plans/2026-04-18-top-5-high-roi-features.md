# Top 5 High-ROI Features — Lawyer Free
*Generated: 2026-04-18 | Based on competitive research, user sentiment analysis, and codebase audit*

---

## Context

Research across Trustpilot, BBB, Reddit, Consumer Affairs, Cornell Law Review, and Wisconsin Courts pro se report reveals the emotional arc of every pro se litigant:

> **Hope** → *"This will save me $5,000"*
> **Confusion** → *"I don't understand what comes next"*
> **Fear** → *"What if I miss a deadline?"*
> **Betrayal** → *"DoNotPay charged me again and nothing works"*
> **Desperation** → *"I'm trapped between a bad legal outcome and financial harm"*

These 5 features address the top user fears and are high-ROI because the infrastructure is already 70–90% built.

---

## 1. Wire Twilio SMS Into Existing Reminder Cron

**What:** Send SMS alerts at T-7, T-3, T-1, and T-0 days before every tracked deadline.

**Why:** Missing court deadlines is the #1 fear of pro se litigants and the #1 cause of malpractice claims. The reminder cron job, `reminders` table, and email infrastructure already exist — Twilio is the missing last mile.

**What's already built:**
- `supabase/` — `reminders` table with scheduled times
- `apps/web/src/app/api/cron/send-reminders/` — cron endpoint exists
- Email channel already wired

**What needs to be added:**
- Twilio SDK integration in `send-reminders` cron
- `sms_opt_in` field on user preferences
- Phone number collection in onboarding/settings

**Effort:** ~2 days
**Impact:** Very High — addresses the #1 user fear, no competitor does this reliably

---

## 2. Surface FDCPA Detector + Risk Engine on Dashboard

**What:** Show users a prominent card on the dashboard when the system detects FDCPA violations or case risk factors — e.g. *"We detected 2 potential FDCPA violations in your case. This could entitle you to $1,000 in statutory damages."*

**Why:** `fdcpa-violation-detection.ts` and `case-risk-engine.ts` already compute these results. They are not surfaced in the UI. This is computed intelligence sitting unused.

**What's already built:**
- `packages/shared/src/rules/fdcpa-violation-detection.ts`
- `packages/shared/src/rules/case-risk-engine.ts`
- `apps/web/src/app/api/cases/[id]/rules/run/` — endpoint exists
- `apps/web/src/app/api/cases/[id]/risk/` — explain + tips endpoints exist

**What needs to be added:**
- Dashboard card component that calls the risk/explain endpoint
- FDCPA violation summary card in the Focus tab
- "How to use this" plain-English explanation for each finding

**Effort:** ~1 day
**Impact:** High — unique differentiator, no competitor surfaces this automatically

---

## 3. "What Happens If I Do Nothing" Warning Cards

**What:** For every overdue or upcoming critical deadline, show the legal consequence inline — e.g. *"If you don't file your answer by [date], the court may enter a default judgment against you and you could lose the case automatically."*

**Why:** Users know deadlines exist but don't know the stakes. Making consequences explicit drives action. This is pure UI work on top of existing deadline data — no backend changes needed.

**What's already built:**
- Deadline tracking with overdue styling
- Deadline source labels (confirmed vs estimated)
- `packages/shared/src/rules/statute-of-limitations.ts`
- Deadline types and keys in `deadline-generator.ts`

**What needs to be added:**
- `consequenceText` field mapped per deadline key (e.g. `answer_deadline` → "Default judgment risk")
- Consequence badge/tooltip on deadline cards
- Priority banner variant for critical deadlines with consequence text

**Effort:** ~1 day
**Impact:** High — directly reduces the anxiety that causes users to abandon

---

## 4. Complete Attorney Review UI Flow

**What:** A polished handoff moment when a case exceeds what Lawyer Free handles alone — showing the user their case summary, recommending attorney review, and connecting them to a vetted referral.

**Why:** Builds trust by respecting the user's limits. Users who feel the product is honest about its scope trust it more, not less. Also a monetization opportunity (referral revenue).

**What's already built:**
- `supabase/migrations/` — attorney review table exists
- `apps/web/src/app/api/cases/[id]/attorney-review/` — endpoint exists
- Case health score and risk score infrastructure (feeds the recommendation logic)

**What needs to be added:**
- UI flow: trigger condition → case summary → recommendation card → referral CTA
- "When to get an attorney" heuristic (e.g. federal court, criminal exposure, >$50K dispute)
- Referral partner integration or simple "find an attorney" link with context pre-filled

**Effort:** ~3 days
**Impact:** High — trust builder + potential revenue stream, differentiates from competitors who abandon users

---

## 5. SEO Landing Pages Per Case Type + State

**What:** Dedicated landing pages for every dispute type + jurisdiction combination — e.g. `/debt-collection-defense/texas`, `/personal-injury/california`, `/landlord-tenant/new-york`.

**Why:** 45+ dispute/jurisdiction rule combinations already exist in the codebase. Each is a high-intent, low-competition search query. These pages compound over time — each one drives organic signups forever at near-zero ongoing cost.

**What's already built:**
- All jurisdiction rule configs (TX, CA, FL, NY, PA × 9 dispute types)
- `/small-claims/[state]` landing pages as a working template
- `/learn-more/[type]` pages as additional templates
- Static page generation with `generateStaticParams`

**What needs to be added:**
- Route: `/[disputeType]/[state]` with `generateStaticParams` covering all 45 combos
- Page template: what the law says, what you can do, what Lawyer Free helps with, CTA
- SEO metadata (title, description, structured data) per page
- Internal linking between related pages

**Effort:** ~2 days
**Impact:** High — compounding growth, no ongoing cost after build

---

## Summary

| # | Feature | Effort | Impact | Infrastructure Status |
|---|---------|--------|--------|-----------------------|
| 1 | SMS deadline alerts via Twilio | 2 days | Very High | 90% built — cron + reminders table exist |
| 2 | FDCPA detector + risk engine UI | 1 day | High | 100% built — just needs UI surface |
| 3 | "What happens if I do nothing" warnings | 1 day | High | 100% built — pure UI layer |
| 4 | Attorney review UI flow | 3 days | High | 70% built — table + endpoint exist |
| 5 | SEO landing pages per case+state | 2 days | High | 90% built — template + data exist |

**Total estimated effort: ~9 days for all 5.**

---

## Source Research

- Trustpilot reviews: DoNotPay (71% 1-star), LegalZoom, Rocket Lawyer, Avvo
- BBB complaints: DoNotPay (D- rating), Rocket Lawyer trademark failures
- Cornell Law Review: *Self-Represented Litigants and the Pro Se Crisis* (2023)
- Wisconsin Courts: Pro Se Litigant Report
- Courtroom5: *6 Biggest Mistakes Pro Se Litigants Make*
- Consumer Affairs: LegalZoom hidden fees, Rocket Lawyer billing after cancellation
