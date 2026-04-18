# CA PI Petition Flow Improvements — Phase 1 Design

**Date:** 2026-04-05
**Scope:** Adapt Texas PI Phase 1 work for California — separate CA-specific guided step configs
**Approach:** Separate CA config files alongside TX versions, state-aware routing

---

## Context

Research into the California PI petition flow revealed significant differences from Texas that require dedicated CA configs rather than parameterized branching. The most impactful differences: pure comparative fault (no threshold vs. TX 51% bar), mandatory Judicial Council forms (vs. TX free-form petition), Proposition 213 (uninsured driver restriction), Howell v. Hamilton Meats (billed vs. paid medical bills), and different government claims process.

### Key CA vs. TX Differences

| Issue | Texas | California |
|---|---|---|
| Comparative fault | 51% bar — zero recovery if 51%+ at fault | Pure — recover even at 99% fault |
| Complaint format | Free-form petition with TRCP requirements | Mandatory Judicial Council forms (PLD-PI-001) |
| Damages in complaint | Must state relief level (TRCP 47(c)) | Prohibited from stating dollar amount (CCP §425.10(b)) |
| Service deadline | 90 days | 60 days (CRC 3.110) |
| Answer deadline | Monday after 20 days | 30 days |
| Jury fees | $30-$50, any time | $150, must post by initial CMC or waive right |
| UM/UIM | Not mandatory; litigation | Mandatory default; binding arbitration |
| Medical bills | Billed amounts recoverable | Paid amounts only (Howell v. Hamilton Meats) |
| Uninsured drivers | No restriction | Prop 213 — lose non-economic damages |
| Gov claims response | 90 days | 45 days |

---

## CA Phase 1 Scope

### New CA-Specific Guided Step Configs (6 files)

#### 1. `pi-intake-ca.ts` — Prop 213, Government Claims, Pure Comparative Fault

**Prop 213 Detection (motor vehicle sub-types only):**
- Question: "Did you have valid auto insurance at the time of the accident?"
- If no: critical warning about losing non-economic damages (CC §3333.4)
- Exception checks: DUI by at-fault driver, passenger, pedestrian/cyclist
- Flag `prop_213_applies: true` in metadata, surface as persistent dashboard risk

**Government Claims (Gov. Code §910-913):**
Same 3 detection questions (gov employee, property, vehicle). If yes:
- Explain CA Government Code §910 process (different from TX Tort Claims Act)
- Recipients by entity type:
  - State agency → Department of General Services
  - County → County Clerk or Board of Supervisors
  - City → City Clerk
  - School district → District Secretary or governing board
- Uniform 6-month deadline statewide (no city-specific variations like TX)
- Late claim relief available within 1 year (Gov. Code §911.4)
- Inject `pi_tort_claims_notice_ca` and `pi_tort_claims_tracking_ca` tasks

**SOL Tolling (CA citations):**
- Minor: tolled until 18 (CCP §352)
- Mental incapacity: tolled (CCP §352)
- Discovery rule: tolled until discovery
- Defendant absent from state: tolled (CCP §351)

**Pure Comparative Fault Education:**
Info card explaining Li v. Yellow Cab Co. — no threshold, recover even at 99% fault. Frames evidence gathering as reducing the defendant's comparative fault argument.

#### 2. `pi-medical-records-ca.ts` — Howell, Billed vs. Paid, Treatment on Lien

**Howell v. Hamilton Meats Education:**
- Explain billed vs. paid distinction
- Collect per-provider: provider name, amount billed, amount paid by insurance, amount paid out of pocket
- Guide EOB (Explanation of Benefits) collection from insurance

**Treatment on Lien:**
- Question: "Are any providers treating you on lien?"
- If yes: explain that full billed amount may be argued as reasonable value (advantage under Howell)
- Warn about inflated lien bills, negotiability at settlement
- Collect: provider name, lien amount, written agreement status

**Medi-Cal / Medicare Liens:**
- Question: "Did Medi-Cal or Medicare pay for any treatment?"
- If yes: explain statutory reimbursement right, guide to DHCS (Medi-Cal) or BCRC (Medicare)
- Collect: which program, approximate lien amount

**Medical Authorization Warning:** Same as TX — don't sign blanket authorizations.

#### 3. `pi-insurance-communication-ca.ts` — Playbook + UM/UIM + MedPay

**Insurance Playbook:** Same 5 DO/DON'T cards as TX (universal tactics).

**CA UM/UIM (significantly different from TX):**
- Mandatory default coverage (Insurance Code §11580.2) — must reject in writing
- Question: "Did you reject UM/UIM coverage in writing?"
- Claims resolved through **binding arbitration** (not litigation)
- 2-year statute of limitations for arbitration (not 30-day notice like TX)
- Must exhaust at-fault driver's limits before UIM claim (or get insurer consent)
- No cross-policy stacking; intra-policy stacking across vehicles permitted

**MedPay Guidance (CA-specific):**
- Explain: mandatory offer of at least $1,000 (Insurance Code §11580.06), optional to accept
- Question: "Does your policy include MedPay?"
- If yes: file immediately, covers medical expenses regardless of fault
- Warn about subrogation from settlement

**Prop 213 Reinforcement:** If flagged in intake, remind about economic-only recovery.

#### 4. `pi-tort-claims-notice-ca.ts` — Gov. Code §910 Process

Key differences from TX version:
- CA-specific recipients (Dept of General Services for state, City Clerk for cities, etc.)
- Damages language: "in excess of $10,000" for claims over jurisdictional limit (not specific amount)
- No city-specific deadline variations — uniform 6 months
- Late claim relief note: "If you missed the 6-month deadline but are within 1 year, you may apply under Gov. Code §911.4"
- Same delivery guidance (certified mail recommended)

#### 5. `pi-tort-claims-tracking-ca.ts` — 45-Day Response + Late Claim Relief

Key differences from TX version:
- Entity has **45 days** to respond (not 90)
- If rejected: 6 months from rejection date to file lawsuit (Gov. Code §945.6)
- If deemed rejected (no response after 45 days): 2 years from accrual to file
- Late claim relief path: guide through §911.4 application if original deadline was missed
- Court considers "mistake, inadvertence, surprise, or excusable neglect"

#### 6. `prepare-pi-petition-ca.ts` — Judicial Council Form Wizard

**Step 1: Form Selection**
Based on sub-type, show required forms:
- Always: PLD-PI-001, SUM-100, CM-010
- By sub-type: PLD-PI-001(1) Motor Vehicle, PLD-PI-001(2) General Negligence, PLD-PI-001(4) Premises Liability, PLD-PI-001(5) Products Liability
- Optional: FW-001 (fee waiver), PLD-PI-001(6) (punitive damages)

**Step 2: Case Classification**
- $35,000 or less → Limited civil ($240-370 fee)
- Over $35,000 → Unlimited civil ($435 fee)
- Explain CCP §425.10(b) — dollar amount prohibited in complaint

**Step 3: Venue (CCP §395)**
- County where injury occurred
- County of defendant's residence
- County of defendant's principal place of business

**Step 4: Cause of Action Elements**
Duty pre-filled by sub-type with CA-specific language:
- Dog bite: strict liability under CC §3342
- Premises: Rowland v. Christian factors
- Motor vehicle: standard negligence

**Step 5: Damages Categories (no dollar amounts)**
Checkboxes only: past/future medical, past/future lost earnings, pain & suffering, emotional distress, loss of enjoyment of life, property damage, loss of consortium

**Step 6: Jury Fee Warning**
"You MUST post a $150 non-refundable jury fee at or before your initial Case Management Conference (~180 days after filing). Missing this permanently waives your right to a jury trial."

**Step 7: AI Statement of Facts Generation**
Generate narrative statement of facts (attachable to PLD-PI-001) + field-by-field form completion guide.

---

## Modified Files

### Step Router (`page.tsx`)
State-aware routing — check `caseData.state` and load CA configs for CA cases, TX configs (default) otherwise.

### Intake Component (`pi-intake-step.tsx`)
Add Prop 213 state fields (insurance status, exception checks). Pass state to determine which config to use.

### Deadline Rules (`deadline-rules.ts`)
Add CA-specific rules with state condition:

| Deadline Key | Trigger | Days | Note |
|---|---|---|---|
| `ca_service_deadline` | `pi_file_with_court` | 60 | TX is 90 |
| `ca_answer_deadline` | `pi_serve_defendant` | 30 | TX is 20 |
| `ca_govt_claim_deadline` | (incident date) | 180 | Same as TX |
| `ca_govt_response_window` | tort claims notice | 45 | TX is 90 |
| `ca_jury_fee_deadline` | `pi_file_with_court` | 180 | No TX equivalent |
| `ca_um_uim_arbitration` | `pi_insurance_communication` | 730 | TX is 30-day notice |

### Petition Prompts (`pi-petition-prompts.ts`)
CA system prompt: CCP citations, Judicial Council form references, no dollar amounts, pure comparative fault, Doe defendants (CCP §474).

### Task Injection SQL
Modify `inject_conditional_tasks` to handle CA tort claims tasks with 45-day response deadline (instead of 90-day).

---

## Data Model

### Task Metadata Extensions (JSONB — no new tables)

**`pi_intake` (CA additions):**
```typescript
{
  prop_213_applies: boolean
  had_valid_insurance: string | null
  prop_213_exception: string | null  // 'dui' | 'passenger' | 'pedestrian_cyclist'
}
```

**`pi_medical_records` (CA additions):**
```typescript
{
  has_health_insurance: string | null  // 'yes' | 'no' | 'partial'
  providers_billed_vs_paid: Array<{
    provider_name: string
    amount_billed: string | null
    amount_paid_insurance: string | null
    amount_paid_out_of_pocket: string | null
  }>
  treatment_on_lien: boolean
  lien_providers: Array<{ provider_name: string; lien_amount: string | null; written_agreement: boolean }>
  medi_cal_paid: boolean
  medicare_paid: boolean
  government_lien_amount: string | null
}
```

**`pi_insurance_communication` (CA additions):**
```typescript
{
  um_uim_rejected_in_writing: string | null  // 'yes' | 'no' | 'unknown'
  has_medpay: string | null
  medpay_limit: string | null
}
```

**`prepare_pi_petition` (CA-specific):**
```typescript
{
  case_classification: 'limited_civil' | 'unlimited_civil'
  forms_needed: string[]
  cause_of_action_forms: string[]
  damages_categories: string[]
  statement_of_facts_generated: boolean
  fee_waiver_needed: boolean
  jury_demand: boolean
}
```

---

## Deferred to Later Phases

- Case management statement (CM-110) guidance
- CCP §998 offer to compromise strategy
- MICRA caps for medical malpractice sub-type
- Expert witness disclosure timeline (50 days before trial)
- Sargon challenge awareness
- County-specific local rules (LA, SF, SD, OC)
- Judicial arbitration for cases under $50K

---

## Key Legal References

| Citation | Subject |
|---|---|
| CCP §335.1 | Statute of limitations (2 years PI) |
| CCP §338(b) | Property damage (3 years) |
| CCP §352 | Tolling for minors/incapacitated |
| CCP §351 | Tolling for absent defendant |
| CCP §395 | Venue |
| CCP §412.20 | Answer deadline (30 days) |
| CCP §415.10-415.50 | Service methods |
| CCP §425.10(b) | Damages amount prohibited in PI complaint |
| CCP §474 | Doe defendants (up to 100) |
| CRC 3.110 | Service within 60 days |
| CC §3333.4 | Proposition 213 (uninsured driver restriction) |
| CC §3342 | Dog bite strict liability |
| Gov. Code §910-913 | Government claims requirements |
| Gov. Code §911.4 | Late claim relief |
| Gov. Code §945.6 | Time to file after rejection |
| Insurance Code §11580.2 | UM/UIM mandatory coverage |
| Insurance Code §11580.06 | MedPay offer requirement |
| Howell v. Hamilton Meats (2011) | Billed vs. paid medical bills |
| Li v. Yellow Cab Co. (1975) | Pure comparative fault |
| Pebley v. Santa Clara Organics (2018) | Billed amounts as evidence of reasonable value |
