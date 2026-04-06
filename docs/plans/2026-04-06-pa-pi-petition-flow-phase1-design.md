# PA PI Petition Flow Improvements — Phase 1 Design

**Date:** 2026-04-06
**Scope:** Adapt TX/CA PI Phase 1 work for Pennsylvania — separate PA-specific guided step configs
**Approach:** Separate PA config files alongside TX/CA versions, state-aware routing (same pattern as CA)

---

## Context

Pennsylvania has unique PI rules that require dedicated configs. The most impactful difference is the **Limited Tort vs. Full Tort** auto insurance system — PA is a choice no-fault state where ~60% of drivers elect limited tort, which bars non-economic damages unless injuries meet the "serious injury" threshold. PA also has a **dual government immunity scheme** (state sovereign immunity vs. political subdivision tort claims), **compulsory arbitration** for cases under $50K, **sheriff-default service**, and **10-day post-trial motion deadlines** (the tightest of any state we support).

### Key PA vs. TX/CA Differences

| Issue | TX (existing) | CA (existing) | PA (new) |
|---|---|---|---|
| Comparative fault | 51% bar | Pure (no bar) | 51% bar (same as TX) |
| Auto insurance | At-fault | At-fault | Choice no-fault (limited/full tort) |
| Limited tort | N/A | N/A | No pain & suffering unless "serious injury" |
| Govt claims | 6-mo notice (uniform) | 6-mo admin claim (uniform) | TWO schemes: state (no notice req) vs political subdivision (6-mo notice) |
| Govt damages cap | None specified | None (general PI) | $250K state / $500K political subdivision |
| Service default method | Any authorized | Any non-party 18+ | Sheriff (default) |
| Answer deadline | Mon after 20 days | 30 days | 20 days |
| Service deadline | 90 days | 60 days | 30 days (must reissue) |
| Pleading standard | Fact pleading (TRCP 47) | Judicial Council forms | Notice pleading |
| Compulsory arbitration | No | Some counties <$50K | Most counties <$50K |
| UM/UIM | Optional | Mandatory default | UM mandatory, UIM offered, stacking |
| Delay damages | N/A | N/A | Prime + 1% from filing (Pa.R.C.P. 238) |
| Jury demand | In petition | $150 by CMC | Must be in complaint or waived |
| Post-trial motions | 30 days | 15 days | 10 days (Pa.R.C.P. 227.1) |
| Appeal | 30/90 days | 60 days | 30 days (Pa.R.A.P. 903) |

---

## PA Phase 1 Scope

### New PA-Specific Guided Step Configs (6 files)

#### 1. `pi-intake-pa.ts` — Limited Tort, Dual Govt Immunity, 51% Bar

**Limited Tort Detection (PA-only, motor vehicle sub-types):**
- "What type of auto insurance coverage did you select?" (full_tort / limited_tort / dont_know)
- If limited_tort: Explain serious injury threshold (death, serious impairment of body function, permanent serious disfigurement)
- Check exceptions: DUI at-fault driver, uninsured at-fault, out-of-state vehicle, intentional injury, pedestrian/cyclist
- If no exception: flag `limited_tort_applies: true`, warn about non-economic damages restriction
- If dont_know: guide to check insurance policy declarations page

**Dual Government Immunity Detection:**
Same 3 detection questions (gov employee, property, vehicle). If yes:
- Determine which scheme: Commonwealth (state agency) or Political Subdivision (city/county/school/authority)
- **Commonwealth (42 Pa.C.S. §8521-8528):** 9 enumerated exceptions, $250K cap per person, NO pre-suit notice required
- **Political Subdivision (42 Pa.C.S. §8541-8564):** 8 enumerated exceptions, $500K cap per occurrence, 6-month written notice REQUIRED
- Check if injury fits within enumerated exception categories
- If political subdivision: inject tort claims notice tasks

**SOL Tolling (PA citations):**
- Minor: tolled until 18 (42 Pa.C.S. §5533)
- Mental incapacity: tolled
- Discovery rule: tolled until knew or should have known
- 7-year statute of repose for medical malpractice (MCARE Act)

**51% Bar Rule (same as TX):**
Same proportionate responsibility education as TX — 51% or more at fault = zero recovery (42 Pa.C.S. §7102)

#### 2. `pi-medical-records-pa.ts` — First-Party Benefits, Coordination of Benefits

**First-Party (No-Fault) Benefits Education:**
- "PA is a choice no-fault state. Your own insurance pays medical benefits regardless of fault."
- Minimum $5,000, up to $100K+ depending on policy
- Guide to file first-party benefits claim with own insurer immediately
- Explain coordination of benefits with health insurance (75 Pa.C.S. §§1716-1720)
- No subrogation for first-party benefits (§1720)

**Medical Lien Tracking:**
- Hospital liens (PA allows)
- Medicare/Medicaid liens (federal — same as CA)
- ERISA plan reimbursement claims
- Collect: lien provider, amount, type

**Medical Authorization Warning:** Same as TX/CA.

#### 3. `pi-insurance-communication-pa.ts` — Playbook + PA UM/UIM + Stacking + Bad Faith

**Insurance Playbook:** Same 5 DO/DON'T cards (universal).

**PA UM/UIM (significantly different from TX and CA):**
- UM is mandatory in PA
- UIM must be offered; can be rejected in writing
- **Stacking available** (75 Pa.C.S. §1738): intra-policy (per vehicle) and inter-policy (household)
- Can waive stacking in writing
- "Did you waive UM/UIM stacking?" — if no, coverage = per-vehicle limit × number of vehicles
- Collect: insurer, policy, limits, number of vehicles, stacking status

**PA Bad Faith (42 Pa.C.S. §8371):**
- PA provides statutory bad faith cause of action against insurers
- Remedies: interest at prime + 3%, punitive damages, costs, attorney fees
- "Is your insurer unreasonably denying or delaying your claim?" — educate about bad faith option

**Limited Tort Reminder:** If flagged in intake, remind about economic-only recovery.

#### 4. `pi-tort-claims-notice-pa.ts` — Political Subdivision Notice Only

**Key difference:** Only needed for political subdivisions (cities, counties, school districts, authorities), NOT for Commonwealth/state agencies.

- Recipients by entity type:
  - Municipality → Clerk or Secretary
  - County → County Commissioners or County Solicitor
  - School district → Secretary of the school board
  - Authority → Secretary or Executive Director
- 6-month deadline (42 Pa.C.S. §8528)
- Contents: name/address, date/place/circumstances, injury description
- Delivery: certified mail or personal delivery

#### 5. `pi-tort-claims-tracking-pa.ts` — PA Political Subdivision Response

- Entity response tracking (no specific statutory response window — different from TX 90d and CA 45d)
- If no response within reasonable time (30-60 days), may proceed with filing
- Explain damages caps: $500,000 per occurrence for political subdivisions
- Must file in Court of Common Pleas (not federal court for state tort claims)

#### 6. `prepare-pi-petition-pa.ts` — PA Notice Pleading + Compulsory Arbitration

**Complaint Structure (Pa.R.C.P.):**
- Caption (Pa.R.C.P. 1018): Court of Common Pleas of [County] County
- Parties with full legal names
- Venue allegations (Pa.R.C.P. 1006)
- Factual allegations in numbered paragraphs
- Causes of action in separate counts
- Damages: "in excess of $50,000" (to avoid compulsory arbitration) or specific threshold
- **Verification required** (Pa.R.C.P. 1024) — sworn statement that facts are true
- **Jury demand MUST be in complaint** (Pa.R.C.P. 1007.1) — omitting it may waive jury right

**Compulsory Arbitration Check:**
- "Is your claim under $50,000?" — if yes, explain compulsory arbitration (42 Pa.C.S. §7361)
- Cases under threshold go to arbitration panel first
- Either party can appeal for trial de novo within 30 days of award
- If appealing, must post costs; if result is not better, may pay other side's costs

**No TRCP 47(c) or Discovery Control Plan** — these are Texas-specific. PA doesn't require them.

**Delay Damages (Pa.R.C.P. 238):**
- Explain: prejudgment interest at prime rate + 1% from date of filing
- Calculated on the damages awarded
- Strong incentive for defendant to settle — interest accrues from day 1

**AI-generated complaint** with PA-specific structure (notice pleading, verification, numbered paragraphs, separate counts).

---

## Modified Files

| File | Change |
|------|--------|
| `page.tsx` (step router) | Add PA config imports and state-aware routing for PA cases |
| `pi-intake-step.tsx` | Add limited tort fields, PA dual govt immunity branching |
| `deadline-rules.ts` | PA service (30d), answer (20d), reissue tracking |
| `pi-petition-prompts.ts` | PA system prompt (notice pleading, verification, no TRCP) |
| `lien-warning-card.tsx` | Limited tort warning, first-party benefits reminder |

### New Deadlines (PA-specific)

| Deadline Key | Trigger | Days | Note |
|---|---|---|---|
| `pa_service_deadline` | `pi_file_with_court` | 30 | Must reissue if not served |
| `pa_answer_deadline` | `pi_serve_defendant` | 20 | Same as current TX |
| `pa_govt_notice_deadline` | (incident date) | 180 | Political subdivisions only |
| `pa_post_trial_motions` | (judgment date) | 10 | Tightest of all states |
| `pa_appeal_deadline` | (judgment date) | 30 | Pa.R.A.P. 903 |

### Dashboard Warnings (PA-specific)

- **Limited Tort Alert** — persistent warning if `limited_tort_applies: true`
- **First-Party Benefits Reminder** — prompt to file with own insurer
- **Damages Cap Warning** — if government case, show $250K or $500K cap
- **Compulsory Arbitration Notice** — if claim under $50K

---

## Data Model (task metadata JSONB — no new tables)

**`pi_intake` (PA additions):**
```typescript
{
  tort_election: 'full_tort' | 'limited_tort' | 'dont_know' | null
  limited_tort_applies: boolean
  limited_tort_exception: string | null
  govt_immunity_scheme: 'commonwealth' | 'political_subdivision' | null
  enumerated_exception_applies: boolean
  damages_cap: number | null
}
```

**`pi_insurance_communication` (PA additions):**
```typescript
{
  um_uim_stacking_waived: string | null
  num_vehicles_on_policy: string | null
  effective_uim_limit: string | null
  bad_faith_suspected: boolean
}
```

---

## Deferred

- Certificate of merit for professional liability (Pa.R.C.P. 1042.3)
- Wrongful death / survival action split
- Minors' settlement court approval (Pa.R.C.P. 2039)
- County-specific local rules (Philadelphia, Allegheny)
- Delay damages calculation tool
