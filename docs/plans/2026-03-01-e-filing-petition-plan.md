# E-Filing Petition Guidance — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two new steps — AI-assisted document builder (`prepare_filing`) and e-filing walkthrough (`file_with_court`) — so users can prepare and file their petition or answer with the court.

**Architecture:** Two new step components plugged into the existing step-runner + gatekeeper system. A new API route calls Claude to generate draft legal documents based on user-provided facts. Filing instructions are static content that adapts by court type. Migration adds new tasks to the seed trigger and updates the unlock chain.

**Tech Stack:** Next.js 15, React 19, TypeScript, Zod, Supabase, Claude API, Vitest

**Design doc:** `docs/plans/2026-03-01-e-filing-petition-design.md`

---

### Task 1: Migration — Filing tasks, doc types, unlock chain

**Files:**
- Create: `supabase/migrations/20260301000002_filing_tasks.sql`

**Step 1: Write the migration**

This migration:
1. Adds `prepare_filing` and `file_with_court` to the seed trigger
2. Updates `unlock_next_task()` to unlock `prepare_filing` after intake, and downstream tasks after `file_with_court`
3. Adds `'petition'`, `'answer'`, `'general_denial'` to the `court_documents.doc_type` CHECK
4. Backfills existing cases with the two new tasks

```sql
-- ============================================
-- E-Filing: Add prepare_filing and file_with_court tasks
-- ============================================

-- 1) Expand court_documents doc_type CHECK
ALTER TABLE public.court_documents
  DROP CONSTRAINT IF EXISTS court_documents_doc_type_check;

ALTER TABLE public.court_documents
  ADD CONSTRAINT court_documents_doc_type_check
  CHECK (doc_type IN ('return_of_service', 'petition', 'answer', 'general_denial'));

-- 2) Update seed_case_tasks to include new tasks
CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Linear chain
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  -- Filing tasks (after intake)
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'prepare_filing',
    CASE WHEN NEW.role = 'defendant' THEN 'Prepare Your Answer'
         ELSE 'Prepare Your Petition' END,
    'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'file_with_court', 'File With the Court', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_return_of_service', 'Upload Return of Service', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'confirm_service_facts', 'Confirm Service Details', 'locked');

  -- Gatekeeper-managed tasks
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'wait_for_answer', 'Wait for Answer Deadline', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'check_docket_for_answer', 'Check Docket for Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'default_packet_prep', 'Prepare Default Judgment Packet', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'upload_answer', 'Upload the Answer', 'locked');

  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'discovery_starter_pack', 'Discovery Starter Pack', 'locked');

  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

-- 3) Update unlock chain: intake → prepare_filing → file_with_court → evidence_vault
CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- welcome → intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'intake' AND status = 'locked';

    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  -- intake → prepare_filing
  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'prepare_filing' AND status = 'locked';
  END IF;

  -- prepare_filing → file_with_court
  IF NEW.task_key = 'prepare_filing' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'file_with_court' AND status = 'locked';
  END IF;

  -- file_with_court → evidence_vault
  IF NEW.task_key = 'file_with_court' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'evidence_vault' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Backfill existing cases
INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'prepare_filing',
  CASE WHEN c.role = 'defendant' THEN 'Prepare Your Answer'
       ELSE 'Prepare Your Petition' END,
  'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'prepare_filing'
);

INSERT INTO public.tasks (case_id, task_key, title, status)
SELECT c.id, 'file_with_court', 'File With the Court', 'locked'
FROM public.cases c
WHERE NOT EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.case_id = c.id AND t.task_key = 'file_with_court'
);
```

**Step 2: Commit**

```bash
git add supabase/migrations/20260301000002_filing_tasks.sql
git commit -m "feat: add filing tasks to seed trigger and unlock chain

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Filing Zod schemas + safety checker

**Files:**
- Create: `src/lib/schemas/filing.ts`
- Create: `src/lib/rules/filing-safety.ts`
- Create: `tests/unit/rules/filing-safety.test.ts`

**Step 1: Create the filing schema**

`src/lib/schemas/filing.ts`:

```typescript
import { z } from 'zod'

export const partySchema = z.object({
  full_name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
})

export const filingFactsSchema = z.object({
  // Parties
  your_info: partySchema,
  opposing_parties: z.array(partySchema).min(1),

  // Court info (read from case, included for AI context)
  court_type: z.string(),
  county: z.string().optional(),
  cause_number: z.string().optional(),

  // Facts
  description: z.string().min(10),
  incident_date: z.string().optional(),
  incident_location: z.string().optional(),

  // Claims (flexible — adapts by dispute type)
  claim_details: z.string().optional(),
  amount_sought: z.number().optional(),
  other_relief: z.string().optional(),
  request_attorney_fees: z.boolean().default(false),
  request_court_costs: z.boolean().default(true),

  // Defendant-only
  is_general_denial: z.boolean().optional(),
  specific_defenses: z.string().optional(),
  has_counterclaim: z.boolean().optional(),
  counterclaim_details: z.string().optional(),

  // Context
  role: z.enum(['plaintiff', 'defendant']),
  dispute_type: z.string().optional(),
})

export type FilingFacts = z.infer<typeof filingFactsSchema>

export const generateFilingRequestSchema = z.object({
  facts: filingFactsSchema,
})

export const filingChecklistSchema = z.object({
  account_created: z.boolean().default(false),
  court_selected: z.boolean().default(false),
  filing_type_chosen: z.boolean().default(false),
  document_uploaded: z.boolean().default(false),
  fee_paid: z.boolean().default(false),
  submitted: z.boolean().default(false),
  confirmation_number: z.string().optional(),
})

export type FilingChecklist = z.infer<typeof filingChecklistSchema>
```

**Step 2: Write safety checker tests**

`tests/unit/rules/filing-safety.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { isFilingOutputSafe, FILING_BLOCKED_PHRASES } from '@/lib/rules/filing-safety'

describe('isFilingOutputSafe', () => {
  it('accepts normal petition text', () => {
    expect(isFilingOutputSafe('Plaintiff respectfully requests judgment in the amount of $5,000.')).toBe(true)
  })

  it('rejects text claiming to be an attorney', () => {
    expect(isFilingOutputSafe('As your attorney, I recommend filing immediately.')).toBe(false)
  })

  it('rejects text predicting outcomes', () => {
    expect(isFilingOutputSafe('You will definitely win this case.')).toBe(false)
  })

  it('rejects text with guaranteed outcome language', () => {
    expect(isFilingOutputSafe('This guarantees a favorable outcome.')).toBe(false)
  })

  it('rejects legal advice phrasing', () => {
    expect(isFilingOutputSafe('My legal advice is to settle.')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(isFilingOutputSafe('AS YOUR ATTORNEY I advise you')).toBe(false)
  })

  it('accepts text mentioning attorney fees as relief', () => {
    expect(isFilingOutputSafe('Plaintiff requests reasonable attorney fees.')).toBe(true)
  })

  it.each(FILING_BLOCKED_PHRASES)('rejects phrase: "%s"', (phrase) => {
    expect(isFilingOutputSafe(`Some text ${phrase} more text`)).toBe(false)
  })
})
```

**Step 3: Implement safety checker**

`src/lib/rules/filing-safety.ts`:

```typescript
export const FILING_BLOCKED_PHRASES = Object.freeze([
  'as your attorney',
  'my legal advice',
  'i advise you to',
  'you will definitely win',
  'guaranteed outcome',
  'you will win',
  'certain to prevail',
  'i am a lawyer',
  'i am an attorney',
  'legal counsel recommends',
] as const)

export function isFilingOutputSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !FILING_BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}
```

**Step 4: Run tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/filing-safety.test.ts
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/lib/schemas/filing.ts src/lib/rules/filing-safety.ts tests/unit/rules/filing-safety.test.ts
git commit -m "feat: add filing schemas and AI output safety checker

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Filing prompt builder

**Files:**
- Create: `src/lib/rules/filing-prompts.ts`
- Create: `tests/unit/rules/filing-prompts.test.ts`

**Step 1: Write tests**

`tests/unit/rules/filing-prompts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildFilingPrompt } from '@/lib/rules/filing-prompts'
import type { FilingFacts } from '@/lib/schemas/filing'

function makeFacts(overrides: Partial<FilingFacts> = {}): FilingFacts {
  return {
    your_info: { full_name: 'John Doe' },
    opposing_parties: [{ full_name: 'Jane Smith' }],
    court_type: 'district',
    description: 'Defendant breached a written contract for services.',
    role: 'plaintiff',
    request_attorney_fees: false,
    request_court_costs: true,
    ...overrides,
  }
}

describe('buildFilingPrompt', () => {
  it('returns system and user messages', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.system).toBeDefined()
    expect(result.user).toBeDefined()
    expect(result.system.length).toBeGreaterThan(50)
    expect(result.user.length).toBeGreaterThan(50)
  })

  it('includes JP small claims format for jp court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'jp' }))
    expect(result.system).toContain('small claims')
  })

  it('includes formal petition format for district court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'district' }))
    expect(result.system).toContain('Original Petition')
  })

  it('includes federal complaint format for federal court', () => {
    const result = buildFilingPrompt(makeFacts({ court_type: 'federal' }))
    expect(result.system).toContain('Complaint')
    expect(result.system).toContain('jurisdiction')
  })

  it('uses answer format for defendant role', () => {
    const result = buildFilingPrompt(makeFacts({ role: 'defendant' }))
    expect(result.system).toContain('Answer')
  })

  it('includes general denial for defendant with is_general_denial', () => {
    const result = buildFilingPrompt(makeFacts({ role: 'defendant', is_general_denial: true }))
    expect(result.system).toContain('General Denial')
  })

  it('includes party names in user message', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.user).toContain('John Doe')
    expect(result.user).toContain('Jane Smith')
  })

  it('includes DRAFT disclaimer instruction in system prompt', () => {
    const result = buildFilingPrompt(makeFacts())
    expect(result.system).toContain('DRAFT')
  })
})
```

**Step 2: Implement prompt builder**

`src/lib/rules/filing-prompts.ts`:

```typescript
import type { FilingFacts } from '@/lib/schemas/filing'

interface FilingPrompt {
  system: string
  user: string
}

function getDocumentFormat(courtType: string, role: string, isGeneralDenial?: boolean): string {
  if (role === 'defendant') {
    if (isGeneralDenial) {
      return `Generate a General Denial Answer. This is a simple document that denies all allegations in the plaintiff's petition. Include:
- Case caption (court, parties, cause number if provided)
- "ORIGINAL ANSWER" heading
- General denial paragraph: "Defendant generally denies each and every allegation in Plaintiff's Original Petition and demands strict proof thereof."
- Any specific affirmative defenses if provided
- Prayer (asking the court to deny plaintiff's claims)
- Signature block with "Respectfully submitted" and the defendant's name, address, and "Pro Se"`
    }
    return `Generate an Answer to the plaintiff's petition. Include:
- Case caption (court, parties, cause number if provided)
- "ORIGINAL ANSWER" heading
- Numbered paragraphs responding to anticipated claims
- Affirmative defenses if applicable
- Counterclaim section if requested
- Prayer
- Signature block with "Pro Se"`
  }

  switch (courtType) {
    case 'jp':
      return `Generate a small claims petition (sworn affidavit style). JP Court petitions are simple and informal. Include:
- Caption: "In the Justice Court, Precinct ___, [County] County, Texas"
- Title: "PLAINTIFF'S ORIGINAL PETITION (SMALL CLAIMS)"
- Brief statement of claim in plain language
- Amount sought
- Verification/sworn statement paragraph
- Signature block with "Pro Se"`

    case 'federal':
      return `Generate a federal Complaint under the Federal Rules of Civil Procedure. Include:
- Caption: "In the United States District Court for the [District] District of Texas"
- Title: "COMPLAINT"
- Jurisdiction paragraph (diversity under 28 U.S.C. § 1332 or federal question under 28 U.S.C. § 1331)
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Causes of action (each as a separate "COUNT")
- Prayer for relief
- Jury demand if appropriate
- Signature block with "Pro Se"
- Verification if required`

    default: // county, district
      return `Generate a Texas Original Petition. Include:
- Caption: "In the [Court Type] Court of [County] County, Texas"
- Title: "PLAINTIFF'S ORIGINAL PETITION"
- "DISCOVERY CONTROL PLAN" paragraph (Level 1 for claims under $100K, Level 2 otherwise)
- Parties section with numbered paragraphs
- Factual allegations with numbered paragraphs
- Cause(s) of action section
- Conditions precedent paragraph
- Damages section
- Prayer for relief (specific amounts, attorney fees, costs, interest)
- Signature block with "Respectfully submitted" and "Pro Se"`
  }
}

export function buildFilingPrompt(facts: FilingFacts): FilingPrompt {
  const format = getDocumentFormat(facts.court_type, facts.role, facts.is_general_denial)

  const system = `You are a legal document formatting assistant. You help self-represented (pro se) litigants format their court filings.

IMPORTANT RULES:
- You format documents. You do NOT provide legal advice.
- Mark the output clearly as "DRAFT — NOT LEGAL ADVICE" at the top.
- Use only the facts provided. Do not invent or assume additional facts.
- Do not predict outcomes or make strategic recommendations.
- Use plain, clear language appropriate for a pro se filer.

DOCUMENT FORMAT:
${format}

Format the document professionally with proper legal formatting.`

  const parties = [
    `Filing party: ${facts.your_info.full_name}`,
    facts.your_info.address ? `Address: ${facts.your_info.address}, ${facts.your_info.city ?? ''}, ${facts.your_info.state ?? ''} ${facts.your_info.zip ?? ''}` : null,
    ...facts.opposing_parties.map((p, i) =>
      `Opposing party ${i + 1}: ${p.full_name}${p.address ? `, ${p.address}` : ''}`
    ),
  ].filter(Boolean).join('\n')

  const courtInfo = [
    `Court type: ${facts.court_type}`,
    facts.county ? `County: ${facts.county}` : null,
    facts.cause_number ? `Cause number: ${facts.cause_number}` : null,
  ].filter(Boolean).join('\n')

  const factsSection = [
    `Description of dispute:\n${facts.description}`,
    facts.incident_date ? `Date of incident: ${facts.incident_date}` : null,
    facts.incident_location ? `Location: ${facts.incident_location}` : null,
    facts.claim_details ? `Claim details:\n${facts.claim_details}` : null,
  ].filter(Boolean).join('\n\n')

  const relief = [
    facts.amount_sought ? `Amount sought: $${facts.amount_sought.toLocaleString()}` : null,
    facts.other_relief ? `Other relief: ${facts.other_relief}` : null,
    facts.request_attorney_fees ? 'Requesting attorney fees' : null,
    facts.request_court_costs ? 'Requesting court costs' : null,
  ].filter(Boolean).join('\n')

  const defendantSection = facts.role === 'defendant' ? [
    facts.is_general_denial ? 'Filing a general denial.' : null,
    facts.specific_defenses ? `Defenses:\n${facts.specific_defenses}` : null,
    facts.has_counterclaim ? `Counterclaim:\n${facts.counterclaim_details ?? 'Details to be provided'}` : null,
  ].filter(Boolean).join('\n\n') : null

  const user = [
    `Role: ${facts.role}`,
    `Dispute type: ${facts.dispute_type ?? 'general'}`,
    '',
    '--- PARTIES ---',
    parties,
    '',
    '--- COURT ---',
    courtInfo,
    '',
    '--- FACTS ---',
    factsSection,
    '',
    '--- RELIEF ---',
    relief,
    defendantSection ? `\n--- DEFENDANT RESPONSE ---\n${defendantSection}` : null,
  ].filter((s) => s !== null).join('\n')

  return { system, user }
}
```

**Step 3: Run tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/rules/filing-prompts.test.ts
```

Expected: All tests PASS.

**Step 4: Commit**

```bash
git add src/lib/rules/filing-prompts.ts tests/unit/rules/filing-prompts.test.ts
git commit -m "feat: add filing prompt builder for AI document generation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: AI generation API route

**Files:**
- Create: `src/app/api/cases/[id]/generate-filing/route.ts`

**Step 1: Create the API route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateFilingRequestSchema } from '@/lib/schemas/filing'
import { buildFilingPrompt } from '@/lib/rules/filing-prompts'
import { isFilingOutputSafe } from '@/lib/rules/filing-safety'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id, role, court_type, county, dispute_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = generateFilingRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { facts } = parsed.data
    const prompt = buildFilingPrompt(facts)

    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    })

    const draft = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    if (!isFilingOutputSafe(draft)) {
      return NextResponse.json(
        { error: 'Generated document did not pass safety review. Please try again.' },
        { status: 422 }
      )
    }

    // Audit event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'filing_draft_generated',
      payload: {
        court_type: facts.court_type,
        role: facts.role,
        dispute_type: facts.dispute_type,
      },
    })

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[generate-filing] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate document. Please try again.' },
      { status: 500 }
    )
  }
}
```

**Step 2: Verify Anthropic SDK is installed**

```bash
cd "/Users/minwang/lawyer free" && grep "@anthropic-ai/sdk" package.json
```

If not present:
```bash
npm install @anthropic-ai/sdk
```

**Step 3: Commit**

```bash
git add "src/app/api/cases/[id]/generate-filing/route.ts"
git commit -m "feat: add AI filing document generation API route

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Prepare Filing step component

**Files:**
- Create: `src/components/step/filing/parties-section.tsx`
- Create: `src/components/step/filing/facts-section.tsx`
- Create: `src/components/step/filing/claims-section.tsx`
- Create: `src/components/step/filing/relief-section.tsx`
- Create: `src/components/step/filing/defendant-section.tsx`
- Create: `src/components/step/filing/draft-viewer.tsx`
- Create: `src/components/step/prepare-filing-step.tsx`

This is the largest task. Each sub-component is a form section. The parent orchestrator (`prepare-filing-step.tsx`) manages state and calls the AI route.

**Step 1: Create the form section components**

Each section follows a simple pattern: accepts state + onChange callback.

`src/components/step/filing/parties-section.tsx`:

```typescript
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface PartyInfo {
  full_name: string
  address?: string
  city?: string
  state?: string
  zip?: string
}

interface PartiesSectionProps {
  yourInfo: PartyInfo
  opposingParties: PartyInfo[]
  onYourInfoChange: (info: PartyInfo) => void
  onOpposingPartiesChange: (parties: PartyInfo[]) => void
}

export function PartiesSection({
  yourInfo,
  opposingParties,
  onYourInfoChange,
  onOpposingPartiesChange,
}: PartiesSectionProps) {
  function updateOpposingParty(index: number, field: keyof PartyInfo, value: string) {
    const updated = [...opposingParties]
    updated[index] = { ...updated[index], [field]: value }
    onOpposingPartiesChange(updated)
  }

  function addOpposingParty() {
    onOpposingPartiesChange([...opposingParties, { full_name: '' }])
  }

  function removeOpposingParty(index: number) {
    if (opposingParties.length <= 1) return
    onOpposingPartiesChange(opposingParties.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-warm-text mb-3">Your Information</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="your-name">Full legal name *</Label>
            <Input id="your-name" value={yourInfo.full_name} onChange={(e) => onYourInfoChange({ ...yourInfo, full_name: e.target.value })} placeholder="e.g. John Michael Doe" />
          </div>
          <div>
            <Label htmlFor="your-address">Address</Label>
            <Input id="your-address" value={yourInfo.address ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, address: e.target.value })} placeholder="123 Main St" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="your-city">City</Label>
              <Input id="your-city" value={yourInfo.city ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="your-state">State</Label>
              <Input id="your-state" value={yourInfo.state ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, state: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="your-zip">Zip</Label>
              <Input id="your-zip" value={yourInfo.zip ?? ''} onChange={(e) => onYourInfoChange({ ...yourInfo, zip: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-warm-text mb-3">Opposing Party</h3>
        {opposingParties.map((party, i) => (
          <div key={i} className="space-y-3 mb-4">
            {opposingParties.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-muted">Party {i + 1}</span>
                <button type="button" onClick={() => removeOpposingParty(i)} className="text-xs text-warm-muted hover:text-warm-text">Remove</button>
              </div>
            )}
            <div>
              <Label htmlFor={`opp-name-${i}`}>Full legal name *</Label>
              <Input id={`opp-name-${i}`} value={party.full_name} onChange={(e) => updateOpposingParty(i, 'full_name', e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <Label htmlFor={`opp-address-${i}`}>Address (if known)</Label>
              <Input id={`opp-address-${i}`} value={party.address ?? ''} onChange={(e) => updateOpposingParty(i, 'address', e.target.value)} />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addOpposingParty}>
          + Add another party
        </Button>
      </div>
    </div>
  )
}
```

`src/components/step/filing/facts-section.tsx`:

```typescript
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FactsSectionProps {
  description: string
  incidentDate: string
  incidentLocation: string
  onDescriptionChange: (v: string) => void
  onIncidentDateChange: (v: string) => void
  onIncidentLocationChange: (v: string) => void
}

export function FactsSection({
  description, incidentDate, incidentLocation,
  onDescriptionChange, onIncidentDateChange, onIncidentLocationChange,
}: FactsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">In plain language, describe what happened *</Label>
        <Textarea id="description" value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={5} placeholder="Describe the facts of your dispute..." />
        <p className="text-xs text-warm-muted mt-1">Stick to facts — what happened, when, and who was involved.</p>
      </div>
      <div>
        <Label htmlFor="incident-date">When did this happen?</Label>
        <Input id="incident-date" type="date" value={incidentDate} onChange={(e) => onIncidentDateChange(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="incident-location">Where did this happen?</Label>
        <Input id="incident-location" value={incidentLocation} onChange={(e) => onIncidentLocationChange(e.target.value)} placeholder="e.g. Austin, Texas" />
      </div>
    </div>
  )
}
```

`src/components/step/filing/claims-section.tsx`:

```typescript
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const DISPUTE_PROMPTS: Record<string, string> = {
  debt_collection: 'Describe the debt: original amount, agreement, and how it was breached.',
  landlord_tenant: 'Describe the lease issue: terms, violation, and what happened.',
  personal_injury: 'Describe the injury: what caused it, medical treatment, and damages.',
  contract: 'Describe the contract: key terms, how it was breached, and damages.',
  property: 'Describe the property dispute: what property, your claim, and what relief you seek.',
  family: 'Describe the family matter: relationship, children involved, and what you are seeking.',
  other: 'Describe your claim in detail.',
}

interface ClaimsSectionProps {
  disputeType: string
  claimDetails: string
  onClaimDetailsChange: (v: string) => void
}

export function ClaimsSection({ disputeType, claimDetails, onClaimDetailsChange }: ClaimsSectionProps) {
  const prompt = DISPUTE_PROMPTS[disputeType] ?? DISPUTE_PROMPTS.other

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="claim-details">Claim Details</Label>
        <p className="text-xs text-warm-muted mb-2">{prompt}</p>
        <Textarea id="claim-details" value={claimDetails} onChange={(e) => onClaimDetailsChange(e.target.value)} rows={4} placeholder="Provide details about your claim..." />
      </div>
    </div>
  )
}
```

`src/components/step/filing/relief-section.tsx`:

```typescript
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface ReliefSectionProps {
  amountSought: string
  otherRelief: string
  requestAttorneyFees: boolean
  requestCourtCosts: boolean
  onAmountChange: (v: string) => void
  onOtherReliefChange: (v: string) => void
  onAttorneyFeesChange: (v: boolean) => void
  onCourtCostsChange: (v: boolean) => void
}

export function ReliefSection({
  amountSought, otherRelief, requestAttorneyFees, requestCourtCosts,
  onAmountChange, onOtherReliefChange, onAttorneyFeesChange, onCourtCostsChange,
}: ReliefSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Dollar amount sought</Label>
        <Input id="amount" type="number" value={amountSought} onChange={(e) => onAmountChange(e.target.value)} placeholder="e.g. 5000" />
      </div>
      <div>
        <Label htmlFor="other-relief">Other relief requested (optional)</Label>
        <Textarea id="other-relief" value={otherRelief} onChange={(e) => onOtherReliefChange(e.target.value)} rows={2} placeholder="e.g. injunction, return of property" />
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="attorney-fees" checked={requestAttorneyFees} onCheckedChange={(c) => onAttorneyFeesChange(c === true)} />
        <Label htmlFor="attorney-fees" className="cursor-pointer">Request attorney fees</Label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id="court-costs" checked={requestCourtCosts} onCheckedChange={(c) => onCourtCostsChange(c === true)} />
        <Label htmlFor="court-costs" className="cursor-pointer">Request court costs</Label>
      </div>
    </div>
  )
}
```

`src/components/step/filing/defendant-section.tsx`:

```typescript
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface DefendantSectionProps {
  isGeneralDenial: boolean
  specificDefenses: string
  hasCounterclaim: boolean
  counterclaimDetails: string
  onGeneralDenialChange: (v: boolean) => void
  onDefensesChange: (v: string) => void
  onCounterclaimChange: (v: boolean) => void
  onCounterclaimDetailsChange: (v: string) => void
}

export function DefendantSection({
  isGeneralDenial, specificDefenses, hasCounterclaim, counterclaimDetails,
  onGeneralDenialChange, onDefensesChange, onCounterclaimChange, onCounterclaimDetailsChange,
}: DefendantSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox id="general-denial" checked={isGeneralDenial} onCheckedChange={(c) => onGeneralDenialChange(c === true)} />
        <div>
          <Label htmlFor="general-denial" className="cursor-pointer">File a General Denial (recommended)</Label>
          <p className="text-xs text-warm-muted mt-0.5">A general denial denies all allegations. This is the simplest and most common response for self-represented litigants.</p>
        </div>
      </div>
      <div>
        <Label htmlFor="defenses">Specific defenses (optional)</Label>
        <Textarea id="defenses" value={specificDefenses} onChange={(e) => onDefensesChange(e.target.value)} rows={3} placeholder="e.g. statute of limitations, payment already made" />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox id="counterclaim" checked={hasCounterclaim} onCheckedChange={(c) => onCounterclaimChange(c === true)} />
        <Label htmlFor="counterclaim" className="cursor-pointer">I want to file a counterclaim</Label>
      </div>
      {hasCounterclaim && (
        <div>
          <Label htmlFor="counterclaim-details">Counterclaim details</Label>
          <Textarea id="counterclaim-details" value={counterclaimDetails} onChange={(e) => onCounterclaimDetailsChange(e.target.value)} rows={3} placeholder="Describe your counterclaim..." />
        </div>
      )}
    </div>
  )
}
```

`src/components/step/filing/draft-viewer.tsx`:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface DraftViewerProps {
  draft: string
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
}

export function DraftViewer({
  draft, onDraftChange, onRegenerate, regenerating, acknowledged, onAcknowledgeChange,
}: DraftViewerProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
        <p className="text-sm font-medium text-warm-text">DRAFT — NOT LEGAL ADVICE</p>
        <p className="text-xs text-warm-muted mt-1">
          This is a computer-generated starting point. You are responsible for reviewing and editing this document before filing. This is not legal advice.
        </p>
      </div>

      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        className="w-full min-h-[400px] rounded-md border border-warm-border p-4 text-sm font-mono text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? 'Regenerating...' : 'Regenerate Draft'}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
        <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(c) => onAcknowledgeChange(c === true)} />
        <Label htmlFor="acknowledge" className="text-sm text-warm-text leading-tight cursor-pointer">
          I understand this is a draft and not legal advice. I will review and edit this document before filing.
        </Label>
      </div>
    </div>
  )
}
```

**Step 2: Create the parent orchestrator**

`src/components/step/prepare-filing-step.tsx`:

This is a large component. It manages all form state, calls the AI route, and uses the StepRunner for phase management. The key innovation: it uses `onBeforeReview` to trigger AI generation, so the "review" phase shows the generated draft.

```typescript
'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { PartiesSection } from './filing/parties-section'
import { FactsSection } from './filing/facts-section'
import { ClaimsSection } from './filing/claims-section'
import { ReliefSection } from './filing/relief-section'
import { DefendantSection } from './filing/defendant-section'
import { DraftViewer } from './filing/draft-viewer'
import type { FilingFacts } from '@/lib/schemas/filing'

interface PrepareFilingStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
    dispute_type: string | null
  }
}

export function PrepareFilingStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: PrepareFilingStepProps) {
  const meta = existingMetadata ?? {}
  const isDefendant = caseData.role === 'defendant'

  // Party state
  const [yourInfo, setYourInfo] = useState(
    (meta.your_info as { full_name: string; address?: string; city?: string; state?: string; zip?: string }) ?? { full_name: '' }
  )
  const [opposingParties, setOpposingParties] = useState<{ full_name: string; address?: string }[]>(
    (meta.opposing_parties as { full_name: string; address?: string }[]) ?? [{ full_name: '' }]
  )

  // Facts state
  const [description, setDescription] = useState((meta.description as string) ?? '')
  const [incidentDate, setIncidentDate] = useState((meta.incident_date as string) ?? '')
  const [incidentLocation, setIncidentLocation] = useState((meta.incident_location as string) ?? '')

  // Claims state
  const [claimDetails, setClaimDetails] = useState((meta.claim_details as string) ?? '')

  // Relief state
  const [amountSought, setAmountSought] = useState((meta.amount_sought as string) ?? '')
  const [otherRelief, setOtherRelief] = useState((meta.other_relief as string) ?? '')
  const [requestAttorneyFees, setRequestAttorneyFees] = useState((meta.request_attorney_fees as boolean) ?? false)
  const [requestCourtCosts, setRequestCourtCosts] = useState((meta.request_court_costs as boolean) ?? true)

  // Defendant state
  const [isGeneralDenial, setIsGeneralDenial] = useState((meta.is_general_denial as boolean) ?? true)
  const [specificDefenses, setSpecificDefenses] = useState((meta.specific_defenses as string) ?? '')
  const [hasCounterclaim, setHasCounterclaim] = useState((meta.has_counterclaim as boolean) ?? false)
  const [counterclaimDetails, setCounterclaimDetails] = useState((meta.counterclaim_details as string) ?? '')

  // Draft state
  const [draft, setDraft] = useState((meta.draft_text as string) ?? '')
  const [acknowledged, setAcknowledged] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)

  function buildFacts(): FilingFacts {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      court_type: caseData.court_type,
      county: caseData.county ?? undefined,
      description,
      incident_date: incidentDate || undefined,
      incident_location: incidentLocation || undefined,
      claim_details: claimDetails || undefined,
      amount_sought: amountSought ? parseFloat(amountSought) : undefined,
      other_relief: otherRelief || undefined,
      request_attorney_fees: requestAttorneyFees,
      request_court_costs: requestCourtCosts,
      is_general_denial: isDefendant ? isGeneralDenial : undefined,
      specific_defenses: isDefendant ? specificDefenses || undefined : undefined,
      has_counterclaim: isDefendant ? hasCounterclaim : undefined,
      counterclaim_details: isDefendant && hasCounterclaim ? counterclaimDetails || undefined : undefined,
      role: caseData.role as 'plaintiff' | 'defendant',
      dispute_type: caseData.dispute_type ?? undefined,
    }
  }

  function buildMetadata() {
    return {
      your_info: yourInfo,
      opposing_parties: opposingParties,
      description,
      incident_date: incidentDate || null,
      incident_location: incidentLocation || null,
      claim_details: claimDetails || null,
      amount_sought: amountSought || null,
      other_relief: otherRelief || null,
      request_attorney_fees: requestAttorneyFees,
      request_court_costs: requestCourtCosts,
      is_general_denial: isGeneralDenial,
      specific_defenses: specificDefenses || null,
      has_counterclaim: hasCounterclaim,
      counterclaim_details: counterclaimDetails || null,
      draft_text: draft || null,
      final_text: draft || null,
    }
  }

  async function generateDraft() {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-filing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts: buildFacts() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate document')
      }
      const data = await res.json()
      setDraft(data.draft)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate document')
      throw err
    } finally {
      setGenerating(false)
    }
  }

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = buildMetadata()
    await patchTask('in_progress', metadata)
  }

  const title = isDefendant ? 'Prepare Your Answer' : 'Prepare Your Petition'
  const reassurance = isDefendant
    ? "We'll help you draft an answer to the petition. You can edit everything before filing."
    : "We'll help you draft your petition. You can edit everything before filing."

  const reviewContent = (
    <div className="space-y-4">
      {genError && (
        <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
          <p className="text-sm text-warm-text">{genError}</p>
        </div>
      )}
      {draft ? (
        <DraftViewer
          draft={draft}
          onDraftChange={setDraft}
          onRegenerate={generateDraft}
          regenerating={generating}
          acknowledged={acknowledged}
          onAcknowledgeChange={setAcknowledged}
        />
      ) : (
        <p className="text-sm text-warm-muted">Generating your draft...</p>
      )}
    </div>
  )

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title={title}
      reassurance={reassurance}
      onConfirm={handleConfirm}
      onSave={handleSave}
      onBeforeReview={generateDraft}
      reviewContent={reviewContent}
      reviewButtonLabel="Generate Draft →"
    >
      <div className="space-y-8">
        {/* Court info summary */}
        <div className="rounded-lg border border-warm-border bg-white p-4 space-y-1">
          <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing for</p>
          <p className="text-sm text-warm-text">
            {caseData.court_type === 'jp' ? 'JP Court' : caseData.court_type === 'county' ? 'County Court' : caseData.court_type === 'district' ? 'District Court' : caseData.court_type === 'federal' ? 'Federal Court' : caseData.court_type}
            {caseData.county ? `, ${caseData.county}` : ''}
            {' — '}
            {isDefendant ? 'Defendant (Answer)' : 'Plaintiff (Petition)'}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">1. Parties</h2>
          <PartiesSection
            yourInfo={yourInfo}
            opposingParties={opposingParties}
            onYourInfoChange={setYourInfo}
            onOpposingPartiesChange={setOpposingParties}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">2. Facts</h2>
          <FactsSection
            description={description}
            incidentDate={incidentDate}
            incidentLocation={incidentLocation}
            onDescriptionChange={setDescription}
            onIncidentDateChange={setIncidentDate}
            onIncidentLocationChange={setIncidentLocation}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">3. Claims</h2>
          <ClaimsSection
            disputeType={caseData.dispute_type ?? 'other'}
            claimDetails={claimDetails}
            onClaimDetailsChange={setClaimDetails}
          />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-warm-text mb-4">4. Relief Requested</h2>
          <ReliefSection
            amountSought={amountSought}
            otherRelief={otherRelief}
            requestAttorneyFees={requestAttorneyFees}
            requestCourtCosts={requestCourtCosts}
            onAmountChange={setAmountSought}
            onOtherReliefChange={setOtherRelief}
            onAttorneyFeesChange={setRequestAttorneyFees}
            onCourtCostsChange={setRequestCourtCosts}
          />
        </div>

        {isDefendant && (
          <div>
            <h2 className="text-sm font-semibold text-warm-text mb-4">5. Your Response</h2>
            <DefendantSection
              isGeneralDenial={isGeneralDenial}
              specificDefenses={specificDefenses}
              hasCounterclaim={hasCounterclaim}
              counterclaimDetails={counterclaimDetails}
              onGeneralDenialChange={setIsGeneralDenial}
              onDefensesChange={setSpecificDefenses}
              onCounterclaimChange={setHasCounterclaim}
              onCounterclaimDetailsChange={setCounterclaimDetails}
            />
          </div>
        )}
      </div>
    </StepRunner>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/step/filing/ src/components/step/prepare-filing-step.tsx
git commit -m "feat: add prepare-filing step with AI document builder

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 6: File With Court step component

**Files:**
- Create: `src/components/step/filing/checklist-item.tsx`
- Create: `src/components/step/filing/filing-checklist.tsx`
- Create: `src/components/step/filing/filing-fee-card.tsx`
- Create: `src/components/step/file-with-court-step.tsx`

**Step 1: Create checklist components**

`src/components/step/filing/checklist-item.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface ChecklistItemProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function ChecklistItem({ id, label, description, checked, onCheckedChange }: ChecklistItemProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg border border-warm-border p-3">
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} className="mt-0.5" />
        <div className="flex-1">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-left w-full">
            <span className={`text-sm font-medium ${checked ? 'text-warm-muted line-through' : 'text-warm-text'}`}>
              {label}
            </span>
            <span className="text-xs text-warm-muted ml-2">{expanded ? '▾' : '▸'}</span>
          </button>
          {expanded && (
            <div className="mt-2 text-sm text-warm-muted leading-relaxed whitespace-pre-line">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

`src/components/step/filing/filing-fee-card.tsx`:

```typescript
interface FilingFeeCardProps {
  courtType: string
}

const FEE_INFO: Record<string, { range: string; waiver: string }> = {
  jp: {
    range: '$35 – $75',
    waiver: 'If you cannot afford the filing fee, you can file an "Affidavit of Inability to Pay Court Costs" (Texas Rule of Civil Procedure 145).',
  },
  county: {
    range: '$200 – $300',
    waiver: 'If you cannot afford the filing fee, file a "Statement of Inability to Afford Payment of Court Costs" with the clerk.',
  },
  district: {
    range: '$300 – $400',
    waiver: 'If you cannot afford the filing fee, file a "Statement of Inability to Afford Payment of Court Costs" with the clerk.',
  },
  federal: {
    range: '$405',
    waiver: 'If you cannot afford the filing fee, file a motion to proceed In Forma Pauperis (IFP) with a financial affidavit.',
  },
}

export function FilingFeeCard({ courtType }: FilingFeeCardProps) {
  const info = FEE_INFO[courtType] ?? FEE_INFO.district

  return (
    <div className="rounded-lg border border-warm-border bg-white p-4 space-y-2">
      <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">Filing Fee</p>
      <p className="text-base font-semibold text-warm-text">{info.range}</p>
      <p className="text-sm text-warm-muted">{info.waiver}</p>
    </div>
  )
}
```

`src/components/step/filing/filing-checklist.tsx`:

```typescript
import { ChecklistItem } from './checklist-item'
import type { FilingChecklist as ChecklistType } from '@/lib/schemas/filing'

interface FilingChecklistProps {
  courtType: string
  role: string
  checklist: ChecklistType
  onChange: (checklist: ChecklistType) => void
}

interface ChecklistItemDef {
  key: keyof Omit<ChecklistType, 'confirmation_number'>
  label: string
  description: string
}

function getChecklistItems(courtType: string, role: string): ChecklistItemDef[] {
  if (courtType === 'federal') {
    return [
      { key: 'account_created', label: 'Create a PACER account', description: 'Go to pacer.uscourts.gov and register for an account. You will need this to access CM/ECF (the federal electronic filing system).\n\nNote: Pro se filers may need to contact the clerk\'s office directly to request electronic filing privileges.' },
      { key: 'court_selected', label: 'Register for CM/ECF', description: 'Contact the clerk\'s office of your target federal district court (e.g., Western District of Texas, Austin Division).\n\nSome courts allow pro se e-filing; others require you to file in person at the clerk\'s office.' },
      { key: 'filing_type_chosen', label: 'Prepare your civil cover sheet', description: 'Download the JS-44 Civil Cover Sheet from uscourts.gov.\n\nFill in:\n• Basis of jurisdiction (diversity, federal question)\n• Nature of suit\n• Cause of action\n• Party information' },
      { key: 'document_uploaded', label: `Upload your ${role === 'defendant' ? 'answer' : 'complaint'} and cover sheet`, description: 'Upload both documents through CM/ECF, or deliver them to the clerk\'s office if filing in person.\n\nMake sure your documents are in PDF format.' },
      { key: 'fee_paid', label: 'Pay the filing fee ($405)', description: 'The federal filing fee is $405.\n\nIf you cannot afford this, file a motion to proceed In Forma Pauperis (IFP) along with a financial affidavit showing your inability to pay.' },
      { key: 'submitted', label: 'Confirm service of process', description: 'Federal rules require service within 90 days (FRCP Rule 4).\n\nOptions:\n• U.S. Marshal service (free for IFP filers)\n• Private process server\n• Waiver of service (send Form AO 398 to defendant)' },
    ]
  }

  // Texas state courts (JP, County, District)
  const courtName = courtType === 'jp' ? 'JP Court' : courtType === 'county' ? 'County Court' : 'District Court'

  return [
    { key: 'account_created', label: 'Create an eFileTexas account', description: `Go to eFileTexas.gov and click "Register."\n\nSelect "Individual" for the account type. Fill in your name, email, and create a password.\n\n${courtType === 'jp' ? 'Note: Some JP courts still accept paper filing. Check with your local court.' : 'All Texas state civil courts require e-filing.'}` },
    { key: 'court_selected', label: `Select ${courtName}`, description: `In eFileTexas, search for your court:\n\n${courtType === 'jp' ? `"[Your County] Justice of the Peace, Precinct [X]"\n\nIf you don't know your precinct, check your county's website for a JP court locator.` : `"[Your County] ${courtName}"\n\nMake sure to select the correct court level.`}` },
    { key: 'filing_type_chosen', label: 'Choose your filing type', description: role === 'defendant' ? 'Select "Existing Case" and enter your cause number.\n\nFor the filing type, select "Answer" or "Original Answer."' : `Select "New Case" → "Civil" → ${courtType === 'jp' ? '"Small Claims"' : '"Civil Case"'}.\n\nThis creates a new case filing in the system.` },
    { key: 'document_uploaded', label: `Upload your ${role === 'defendant' ? 'answer' : 'petition'}`, description: `Upload the PDF you prepared in the previous step.\n\nDocument type: "${role === 'defendant' ? 'Answer' : 'Petition'}"\n\nMake sure the file is in PDF format and under 10MB.` },
    { key: 'fee_paid', label: `Pay the filing fee`, description: `Filing fees vary by court and claim amount.\n\nIf you cannot afford the fee, you can file a "Statement of Inability to Afford Payment of Court Costs" instead. The clerk will review it and may waive or reduce the fee.` },
    { key: 'submitted', label: 'Submit and save your confirmation', description: 'Click "Submit" to file your documents with the court.\n\nIMPORTANT: Save your confirmation number and filing receipt. You will need these for your records.\n\nThe court will send you a notification when your filing is accepted.' },
  ]
}

export function FilingChecklistComponent({ courtType, role, checklist, onChange }: FilingChecklistProps) {
  const items = getChecklistItems(courtType, role)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ChecklistItem
          key={item.key}
          id={item.key}
          label={item.label}
          description={item.description}
          checked={checklist[item.key]}
          onCheckedChange={(checked) => onChange({ ...checklist, [item.key]: checked })}
        />
      ))}
    </div>
  )
}
```

**Step 2: Create the parent step component**

`src/components/step/file-with-court-step.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import { FilingChecklistComponent } from './filing/filing-checklist'
import { FilingFeeCard } from './filing/filing-fee-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FilingChecklist } from '@/lib/schemas/filing'

interface FileWithCourtStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
  }
}

const DEFAULT_CHECKLIST: FilingChecklist = {
  account_created: false,
  court_selected: false,
  filing_type_chosen: false,
  document_uploaded: false,
  fee_paid: false,
  submitted: false,
}

export function FileWithCourtStep({
  caseId,
  taskId,
  existingMetadata,
  caseData,
}: FileWithCourtStepProps) {
  const meta = existingMetadata ?? {}
  const [checklist, setChecklist] = useState<FilingChecklist>(
    (meta.checklist as FilingChecklist) ?? DEFAULT_CHECKLIST
  )
  const [confirmationNumber, setConfirmationNumber] = useState(
    (meta.confirmation_number as string) ?? ''
  )

  const allChecked = Object.entries(checklist)
    .filter(([key]) => key !== 'confirmation_number')
    .every(([, v]) => v === true)

  async function patchTask(status: string, metadata?: Record<string, unknown>) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(metadata ? { metadata } : {}) }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    const metadata = { checklist, confirmation_number: confirmationNumber || null }
    await patchTask('in_progress', metadata)
    await patchTask('completed')
  }

  async function handleSave() {
    const metadata = { checklist, confirmation_number: confirmationNumber || null }
    await patchTask('in_progress', metadata)
  }

  const filingSystem = caseData.court_type === 'federal' ? 'PACER / CM-ECF' : 'eFileTexas.gov'

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="File With the Court"
      reassurance={`Follow these steps to file your documents through ${filingSystem}. Check off each item as you complete it.`}
      onConfirm={handleConfirm}
      onSave={handleSave}
      skipReview
    >
      <div className="space-y-6">
        <FilingFeeCard courtType={caseData.court_type} />

        <FilingChecklistComponent
          courtType={caseData.court_type}
          role={caseData.role}
          checklist={checklist}
          onChange={setChecklist}
        />

        <div className="space-y-2">
          <Label htmlFor="confirmation">Confirmation / receipt number (optional)</Label>
          <Input
            id="confirmation"
            value={confirmationNumber}
            onChange={(e) => setConfirmationNumber(e.target.value)}
            placeholder="e.g. EFT-2026-12345"
          />
        </div>

        {!allChecked && (
          <p className="text-xs text-warm-muted">
            Complete all checklist items to finish this step.
          </p>
        )}
      </div>
    </StepRunner>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/step/filing/checklist-item.tsx src/components/step/filing/filing-checklist.tsx src/components/step/filing/filing-fee-card.tsx src/components/step/file-with-court-step.tsx
git commit -m "feat: add file-with-court step with e-filing checklist

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Wire steps into step page + update doc type schema

**Files:**
- Modify: `src/app/case/[id]/step/[taskId]/page.tsx`
- Modify: `src/lib/schemas/court-document.ts`

**Step 1: Update the court document schema**

In `src/lib/schemas/court-document.ts`, change:

```typescript
export const DOC_TYPES = [
  'return_of_service',
  'petition',
  'answer',
  'general_denial',
] as const
```

**Step 2: Add cases to the step page switch**

In `src/app/case/[id]/step/[taskId]/page.tsx`, add imports at the top:

```typescript
import { PrepareFilingStep } from '@/components/step/prepare-filing-step'
import { FileWithCourtStep } from '@/components/step/file-with-court-step'
```

Add these cases to the switch statement (after the `intake` case):

```typescript
    case 'prepare_filing': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('role, court_type, county, dispute_type')
        .eq('id', id)
        .single()

      if (!caseRow || caseRow.court_type === 'unknown') {
        return (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href={`/case/${id}`} className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block">&larr; Back to dashboard</Link>
            <Card><CardContent className="pt-6 text-center py-12">
              <h2 className="text-lg font-semibold text-warm-text mb-2">Court type needed</h2>
              <p className="text-sm text-warm-muted">Complete the intake step first so we know which court you are filing in.</p>
            </CardContent></Card>
          </div>
        )
      }

      return (
        <PrepareFilingStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow}
        />
      )
    }

    case 'file_with_court': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('role, court_type, county')
        .eq('id', id)
        .single()

      return (
        <FileWithCourtStep
          caseId={id}
          taskId={taskId}
          existingMetadata={task.metadata}
          caseData={caseRow ?? { role: 'plaintiff', court_type: 'district', county: null }}
        />
      )
    }
```

**Step 3: Commit**

```bash
git add "src/app/case/[id]/step/[taskId]/page.tsx" src/lib/schemas/court-document.ts
git commit -m "feat: wire filing steps into step page and expand doc types

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Build + test verification

**Step 1: Run the build**

```bash
cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -30
```

Expected: Clean build, no type errors.

**Step 2: Run all unit tests**

```bash
cd "/Users/minwang/lawyer free" && npx vitest run
```

Expected: All tests pass, including new filing-safety and filing-prompts tests.

**Step 3: Fix any issues and commit**

```bash
git add -A && git commit -m "fix: address build/test issues from e-filing module

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Migration — filing tasks, doc types, unlock chain | 1 | 0 |
| 2 | Filing schemas + safety checker + tests | 3 | 0 |
| 3 | Filing prompt builder + tests | 2 | 0 |
| 4 | AI generation API route | 1 | 0 |
| 5 | Prepare Filing step (6 form sections + orchestrator) | 7 | 0 |
| 6 | File With Court step (checklist + fee card + orchestrator) | 4 | 0 |
| 7 | Wire into step page + update doc types | 0 | 2 |
| 8 | Build + test verification | 0 | 0 |

**Total: 18 new files, 2 modified files, 8 commits**
