# PI Petition Flow Improvements — Phase 1 Design

**Date:** 2026-04-05
**Scope:** Pre-filing + filing phase enhancements for personal injury cases
**Approach:** Phase-by-phase rollout — Phase 1 delivers highest-impact improvements first

---

## Context

Research into the complete Texas PI petition flow revealed significant gaps in the current guided steps that could cause pro se plaintiffs to lose cases on procedural grounds. The current app has 19 PI tasks across 4 phases with 30 guided step files and 16 React components, but lacks critical protections around government entity claims, hospital liens, insurance tactics, and TRCP-compliant petition drafting.

### Current PI Task Sequence (19 tasks)

**Pre-Filing:** pi_intake → pi_medical_records → evidence_vault → preservation_letter → pi_insurance_communication → prepare_pi_demand_letter → pi_settlement_negotiation
**Filing:** prepare_pi_petition → pi_file_with_court → pi_serve_defendant
**Mid-Litigation:** pi_wait_for_answer → pi_review_answer → pi_discovery_prep → pi_discovery_responses → pi_scheduling_conference → pi_pretrial_motions → pi_mediation
**Trial/Resolution:** pi_trial_prep → pi_post_resolution

---

## Phase 1 Scope

### Enhanced Existing Tasks (4)

#### 1. `pi_intake` — Government Entity Detection + SOL Tolling

**Government Entity Detection:**
After the incident description, add a new section: "Who or what caused your injury?"

Questions (multiple choice + conditional):
- "Was the other party a government employee on duty?" (city bus driver, police officer, public school staff)
- "Did the incident happen on government property?" (public park, state highway, government building)
- "Was a government vehicle involved?" (city bus, county vehicle, state truck)

If any answer is yes:
1. Show alert explaining the Texas Tort Claims Act
2. Calculate 6-month notice deadline from incident date
3. Inject `pi_tort_claims_notice` and `pi_tort_claims_tracking` tasks (before `pi_medical_records`)
4. Create system deadline for notice requirement
5. If 6-month window already passed → critical warning that claim may be barred

**SOL Tolling Guidance:**
After incident date entry, conditional questions:
- "Were you under 18 at the time of the incident?" → Tolling until age 18
- "Were you mentally incapacitated at the time?" → Tolling during incapacity
- "Did you discover the injury later?" → Discovery rule for latent injuries

Adjust SOL countdown on dashboard based on tolling answers.

**Proportionate Responsibility Awareness:**
Educational card at end of intake: "Important: Texas's 51% Rule" — brief explanation that if a jury finds you more than 50% at fault, you recover nothing. Frames as motivation for evidence collection.

#### 2. `pi_medical_records` — Hospital Lien Detection

**Hospital Lien Detection:**
After listing treatment providers, add:

Question: "Were you admitted to a hospital (not just ER visit) within 72 hours of the incident?"

If yes:
1. Explain hospital liens in plain English
2. Guide them to check county clerk records for filed liens
3. Collect lien data: hospital name, lien amount, county where filed
4. Explain 50% cap (lesser of first 100 days charges or 50% of recovery)
5. Explain what liens do NOT attach to: UM/UIM, PIP, med-pay

**Dashboard Lien Warning:**
When user reaches `pi_settlement_negotiation` or `pi_demand_letter`, surface persistent warning card with lien total and requirement to satisfy before distributing settlement.

**Medical Authorization Warning:**
DO/DON'T tip: Don't sign blanket authorizations. Only authorize records related to this injury.

#### 3. `pi_insurance_communication` — Tactics Education + UM/UIM

**Insurance Playbook (prepended to existing content):**

5 DO/DON'T cards:

1. **Recorded Statements:** DON'T give one to other driver's insurer. DO keep notes of every conversation.
2. **Early Settlement Offers:** DON'T accept first offer. DO wait until Maximum Medical Improvement (MMI).
3. **Blanket Authorizations:** DON'T sign blanket medical/employment authorizations. DO only provide records related to this incident.
4. **Surveillance:** DO be aware insurers may hire investigators. DO be honest about limitations.
5. **Social Media:** DON'T post about case/injuries/activities. Insurance companies monitor plaintiff social media.

**UM/UIM Guidance (conditional — motor vehicle sub-types only):**

For auto_accident, pedestrian_cyclist, rideshare, uninsured_motorist:

Questions:
- "Does the at-fault driver have insurance?" (Yes/No/Don't know)
- "Is their coverage enough to cover your damages?" (Yes/No/Don't know)

If no insurance or insufficient:
1. Explain UM/UIM coverage
2. Key fact: Texas Insurance Code §1952.101 — if you didn't reject in writing, you have it by law
3. Guide to check policy declarations page
4. Collect: insurer name, policy number, UM/UIM limits
5. Explain 30-day notification requirement
6. Create system deadline for 30-day UM/UIM notice

#### 4. `prepare_pi_petition` — Guided Petition Builder

Multi-section wizard:

**Section A: Relief Level (TRCP 47(c))**
- "$250,000 or less" → Level 1 expedited (TRCP 169), Discovery Level 1
- "$250,001 to $1,000,000" → Standard, Discovery Level 2
- "Over $1,000,000" → Standard, Discovery Level 2
- Explain consequences for discovery limits
- Warn: cannot recover more than selected level

**Section B: Venue Analysis (CPRC §15.002)**
- County where incident happened (pre-filled from intake)
- County of defendant's residence (if individual)
- County of defendant's main office (if business)
- Show recommendation with reasoning

**Section C: Cause of Action Elements**
- Duty (pre-filled based on sub-type)
- Breach (free text with sub-type examples)
- Causation (free text with AI-suggested language)
- Damages checklist: past/future medical, past/future lost wages, pain & suffering, mental anguish, physical impairment, disfigurement

**Section D: Additional Elements**
- Jury demand (Yes/No with explanation — recommended for PI)
- Pre-suit demand letter reference
- Government entity Tort Claims Act language (if applicable)

**Section E: AI Petition Generation**
Generate formatted petition with all required elements:
1. Case header
2. Discovery control plan designation (first paragraph, TRCP 190.1)
3. Parties
4. Jurisdiction
5. Venue with statutory basis
6. Statement of facts
7. Negligence/cause of action
8. Causation
9. Itemized damages
10. Jury demand (if selected)
11. Prayer for relief

User can review, edit, regenerate sections. Export as PDF.

---

### New Conditional Tasks (2)

#### `pi_tort_claims_notice`

**Trigger:** Government entity detected in `pi_intake`
**Position:** After `pi_intake`, before `pi_medical_records`

Content:
1. Explain 6-month notice requirement (claim barred if missed)
2. Identify correct entity to notify:
   - City → city secretary or city manager
   - County → county judge
   - State agency → Texas Attorney General
   - School district → superintendent
3. Collect notice information: date/time/location, incident description, injuries, damages amount
4. AI generates notice letter
5. Delivery guidance: certified mail, return receipt requested
6. Warn about local variations (Austin 45 days, Houston/Dallas 90 days)

#### `pi_tort_claims_tracking`

**Trigger:** Follows `pi_tort_claims_notice`
**Position:** After `pi_tort_claims_notice`

Content:
1. Record delivery: date mailed, tracking number, return receipt date
2. Create 90-day response window deadline
3. Explain next steps: entity may accept, deny, or ignore
4. If ignored/denied → unlock `prepare_pi_petition` with Tort Claims Act language

---

### New Deadlines (up to 3, conditional)

| Deadline Key | Condition | Window | Consequence |
|---|---|---|---|
| `tort_claims_notice_deadline` | Government entity detected | 6 months from incident (or shorter per local rules) | "Claim against government entity will be barred" |
| `tort_claims_response_window` | Tort claims notice delivered | 90 days from delivery | "You may proceed with filing" |
| `um_uim_notice_30day` | UM/UIM applicable | 30 days from task completion | "Failure to notify insurer may jeopardize UM/UIM claim" |

---

## Data Model

### Task Metadata Extensions (JSONB — no new tables)

**`pi_intake` metadata:**
```typescript
{
  government_entity_detected: boolean
  government_entity_type: 'city' | 'county' | 'state_agency' | 'school_district' | null
  government_entity_name: string | null
  sol_tolling: {
    minor_at_incident: boolean
    mental_incapacity: boolean
    discovery_rule: boolean
    adjusted_sol_date: string | null
  }
}
```

**`pi_medical_records` metadata:**
```typescript
{
  hospital_admission_within_72h: boolean
  hospital_liens: Array<{
    hospital_name: string
    lien_amount: number | null
    county_filed: string
    verified: boolean
  }>
}
```

**`pi_insurance_communication` metadata:**
```typescript
{
  um_uim_applicable: boolean
  um_uim_insurer: string | null
  um_uim_policy_number: string | null
  um_uim_limits: number | null
  um_uim_notice_sent: boolean
  um_uim_notice_date: string | null
}
```

**`prepare_pi_petition` metadata:**
```typescript
{
  relief_level: '250k_or_less' | '250k_to_1m' | 'over_1m'
  discovery_level: 1 | 2 | 3
  venue_county: string
  venue_basis: 'incident_location' | 'defendant_residence' | 'defendant_office'
  jury_demand: boolean
  damages: {
    past_medical: number | null
    future_medical: number | null
    past_lost_wages: number | null
    future_lost_earning: number | null
    pain_suffering: boolean
    mental_anguish: boolean
    physical_impairment: boolean
    disfigurement: boolean
  }
  cause_of_action: {
    duty: string
    breach: string
    causation: string
  }
  petition_generated: boolean
  petition_draft_id: string | null
}
```

### Dynamic Task Injection

New Supabase RPC: `inject_conditional_tasks(p_case_id uuid, p_task_keys text[], p_insert_after text)`

- Inserts tasks with correct `sort_order` (after specified task)
- Shifts subsequent task sort_orders atomically
- Creates associated deadlines
- Emits `task_event` with kind `tasks_injected`
- Matches existing `seed_case_tasks()` pattern

### Lien Warning Surfacing

Dashboard reads `pi_medical_records` task metadata:
```
IF task('pi_medical_records').metadata.hospital_liens.length > 0
AND current_task IN ('pi_settlement_negotiation', 'pi_demand_letter')
THEN show lien warning card with total amount
```

---

## Designed for Phase 2 (not implemented in Phase 1)

- `pi_comparative_fault_strategy` — dedicated task after `pi_review_answer` when defendant raises contributory negligence or designates responsible third parties
- PI-specific discovery templates (motor vehicle vs. premises vs. product liability)
- IME preparation guidance
- Daubert/Robinson challenge awareness

## Designed for Phase 3 (not implemented)

- Jury charge guidance (Texas Pattern Jury Charges)
- Voir dire preparation
- Exhibit list / witness list management
- Motion in limine templates
- Motion for new trial (30-day deadline, 75-day overruling by operation of law)
- Appeal deadline tracking (30/90 day windows)
- Judgment collection workflow
- Lien satisfaction gate at settlement distribution

---

## Key Legal References

| Citation | Subject |
|---|---|
| CPRC §16.003 | Statute of limitations (2 years) |
| CPRC §16.001 | Tolling for minors/incapacitated |
| CPRC Chapter 33 | Proportionate responsibility (51% bar) |
| CPRC §15.002 | Venue |
| TRCP 47 | Petition requirements including relief level |
| TRCP 169 | Expedited actions ($250K or less) |
| TRCP 190 | Discovery control plans (Level 1/2/3) |
| Property Code Chapter 55 | Hospital liens |
| Insurance Code §1952.101 | UM/UIM coverage requirements |
| Texas Tort Claims Act | Government entity claims + 6-month notice |
