# Quick Resolve — Design Document

**Date:** 2026-03-23
**Status:** Approved
**Inspired by:** PettyLawsuit.com competitive analysis

## Problem

Lawyer Free guides users through legal workflows but doesn't take action for them. Users generate demand letters but must figure out certified mail delivery themselves. 40% of disputes resolve with just a demand letter (PettyLawsuit data), but our full 8-step wizard + multi-week workflow scares away users who need fast action.

## Solution

**Quick Resolve** — a unified fast-path that sits alongside the full case management system:

1. Tell your story (plain text + evidence upload)
2. AI analyzes and extracts structured case data
3. Auto-finds business entity via OpenCorporates
4. User confirms, AI drafts demand letter
5. Send via certified mail ($7.99) or download free
6. Track delivery, auto follow-up after 14 days
7. Escalate to full guided workflow if unresolved

Quick Resolve creates a real case in the same `cases` table with the same task seeding. The user experiences a 5-minute flow; the system has the full case structure for escalation.

## Two Entry Points, Same Destination

- **Quick Resolve** (new) — story-first → demand letter → send. For users who want fast action.
- **Full Case** (existing wizard) — structured wizard → guided workflow. For users who need the full legal journey.

Both create the same underlying case data. Users can start with Quick Resolve and escalate to the full workflow seamlessly.

---

## Section 1: "Tell Your Story" AI Intake

### User Experience

Single screen: large textarea (min 50 chars, max 5000 chars) + optional evidence file upload (images, PDFs). One button: "Analyze my situation."

### API

`POST /api/quick-resolve/analyze`

**Input:**
```typescript
{
  story: string          // 50-5000 chars
  evidenceFiles?: File[] // optional images/PDFs
}
```

**Processing:**
1. Call GPT-4o-mini with story text + system prompt containing full dispute type taxonomy
2. AI extracts: `disputeType`, `subType`, `role`, `opposingParty` (name + type: person/business), `approximateAmount`, `state`, `summary`
3. If `opposingParty.type === 'business'` → call OpenCorporates API
4. If evidence files uploaded → store in Supabase Storage, link to case later

**Output:**
```typescript
{
  disputeType: string
  subType?: string
  role: 'plaintiff' | 'defendant'
  opposingParty: {
    name: string
    type: 'person' | 'business'
    legalName?: string         // from OpenCorporates
    registeredAgent?: { name: string, address: string }
    entityType?: string        // LLC, Corporation, etc.
    entityStatus?: string      // Active, Inactive
  }
  approximateAmount: number
  state: string
  summary: string
  confidence: 'high' | 'medium' | 'low'
}
```

### Confirmation Screen

Displays extracted data as editable fields. User confirms or edits. "Looks right — draft my letter" proceeds to case creation + letter generation.

---

## Section 2: Demand Letter Generation + Certified Mail Fulfillment

### Letter Generation

Reuses existing `POST /api/document-generation` with `documentType: 'demand_letter'`. Pre-fills `caseDetails` and `documentDetails` from AI extraction. No new AI infrastructure.

### Delivery Options

Three options presented after letter review:

| Option | Price | Description |
|--------|-------|-------------|
| Certified Mail | $7.99 | Lob.com API. Tracked delivery, proof of mailing. 3-7 business days. |
| PDF Download | Free | User prints and mails themselves. |
| Email | Free | Less formal, no proof of delivery. |

### Certified Mail Flow

1. User clicks "Send now" → Stripe Checkout ($7.99 one-time)
2. On payment success → `POST /api/quick-resolve/send-letter`
3. Creates Lob letter: recipient (from entity lookup or user input), return address (user's), PDF content, certified mail + tracking
4. Lob returns tracking ID → stored in `demand_letter_deliveries`
5. User sees tracking status on case dashboard
6. `POST /api/webhooks/lob` receives delivery status updates

### New Table

```sql
CREATE TABLE demand_letter_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  lob_letter_id text NOT NULL,
  tracking_number text,
  status text NOT NULL DEFAULT 'created',
  recipient_name text NOT NULL,
  recipient_address jsonb NOT NULL,
  amount_charged_cents integer NOT NULL,
  stripe_payment_id text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE demand_letter_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own deliveries"
  ON demand_letter_deliveries FOR SELECT
  USING (case_id IN (SELECT id FROM cases WHERE user_id = auth.uid()));
```

### Auto Follow-Up (14 days post-delivery)

Cron job checks delivered letters older than 14 days with no case outcome recorded. Sends push notification:

- "Your demand letter was delivered 14 days ago. Did the other party respond?"
- Options: "Resolved" → record outcome | "No response" → suggest filing | "Rejected" → suggest filing
- "File with court" escalates to full guided workflow, pre-filled with Quick Resolve data

---

## Section 3: Business Entity Lookup

### Integration

OpenCorporates API (free tier: 500 lookups/month).

`POST /api/quick-resolve/entity-lookup`

**Input:** `{ name: string, state: string }`

**Processing:**
```
OpenCorporates GET /companies/search?q={name}&jurisdiction_code=us_{state}
→ Returns: legal name, entity type, status, registered agent, address
```

**Fallback chain:**
1. OpenCorporates → primary source
2. If no results or quota exceeded → show "couldn't find automatically" + state SOS website link
3. User can always manually enter entity details

### UI

- Entity found: green check + legal name + registered agent address (auto-fills recipient)
- Not found: amber note + manual entry fields + SOS link

---

## Section 4: Architecture

### Data Flow

```
Story input → AI extraction → OpenCorporates → User confirms
  → Case creation (existing API) → Demand letter (existing API)
  → Delivery choice → Lob certified mail → Tracking → Auto follow-up
```

### New Files

```
src/app/api/quick-resolve/
  ├── analyze/route.ts
  ├── entity-lookup/route.ts
  └── send-letter/route.ts

src/app/api/webhooks/lob/route.ts

src/components/quick-resolve/
  ├── story-input.tsx
  ├── analysis-review.tsx
  ├── letter-preview.tsx
  └── delivery-options.tsx

src/app/(authenticated)/quick-resolve/page.tsx

supabase/migrations/YYYYMMDD_quick_resolve.sql
```

### Reused Infrastructure

- `POST /api/cases` — case creation
- `POST /api/document-generation` — demand letter AI
- Existing demand letter prompt templates
- `cases` table, `tasks` table, workflow triggers
- Stripe payment infrastructure
- Evidence upload components

### New Dependencies

- `lob` npm package — certified mail API
- OpenCorporates API — free HTTP calls (no SDK)

### Environment Variables

```
LOB_API_KEY=           # Lob.com API key
LOB_WEBHOOK_SECRET=    # Lob webhook signature verification
OPENCORPORATES_API_KEY= # Optional — increases rate limit from 500 to 10K/month
```

---

## Not in Scope

- Process server marketplace (connects users with local process servers)
- Automated phone calls to defendants ("Voice of Justice" feature)
- Multi-state certified mail pricing variations
- Return of service form auto-generation from Lob delivery events
- Real-time chat/AI assistant during the Quick Resolve flow

## Success Metrics

- Quick Resolve completion rate (story → letter sent)
- Certified mail conversion rate (% who choose $7.99 vs free download)
- Pre-court resolution rate (% resolved after demand letter)
- Escalation rate (% who proceed to full guided workflow)
- Revenue per Quick Resolve user ($7.99 * conversion rate)
