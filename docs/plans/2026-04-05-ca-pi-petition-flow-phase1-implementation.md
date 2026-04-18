# CA PI Petition Flow Phase 1 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create California-specific PI guided step configs adapting the Texas Phase 1 work, with state-aware routing, CA deadline rules, and CA petition prompts.

**Architecture:** Separate CA config files alongside TX versions. Step router checks case state and loads correct config. Reuses existing task injection API and deadline infrastructure. No new tables.

**Tech Stack:** TypeScript (shared configs), React (step components), PostgreSQL (deadline rules), Next.js API routes

**Design Doc:** `docs/plans/2026-04-05-ca-pi-petition-flow-phase1-design.md`

---

## Task 1: Create `pi-intake-ca.ts` — Prop 213, CA Gov Claims, Pure Comparative Fault

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-intake-ca.ts`
- Reference: `packages/shared/src/guided-steps/personal-injury/pi-intake.ts` (TX version)
- Reference: `packages/shared/src/guided-steps/types.ts` (GuidedStepConfig interface)

**Step 1: Create the CA intake config**

Export `piIntakeCaConfig` as a `GuidedStepConfig`. Follow the exact same structure as `piIntakeConfig` in `pi-intake.ts` but with these CA-specific changes:

**Prop 213 Detection (replaces nothing in TX — new section, add before gov entity):**
```typescript
{
  id: 'prop_213_header',
  type: 'info',
  prompt: '🚗 California Insurance Check (Proposition 213)\n\nCalifornia law restricts damages for drivers who were uninsured at the time of an accident. This is important to check early.',
},
{
  id: 'had_valid_insurance',
  type: 'yes_no',
  prompt: 'Did you have valid auto insurance at the time of the incident?',
  helpText: 'This applies to motor vehicle accidents only. If you were a pedestrian, cyclist, or passenger, select "Yes" or skip.',
},
{
  id: 'prop_213_warning',
  type: 'info',
  prompt: '🚨 Important: Proposition 213 (Civil Code §3333.4)\n\nBecause you were driving without valid insurance, California law prevents you from recovering non-economic damages — pain and suffering, emotional distress, loss of enjoyment of life.\n\nYou CAN still recover economic damages: medical bills, lost wages, and property damage.\n\nThis significantly affects your case value. Keep this in mind when evaluating settlement offers.',
  showIf: (answers) => answers.had_valid_insurance === 'no',
},
{
  id: 'prop_213_exception_check',
  type: 'single_choice',
  prompt: 'Do any of these exceptions apply to you?',
  options: [
    { value: 'dui', label: 'The at-fault driver was convicted of DUI' },
    { value: 'passenger', label: 'I was a passenger (not the driver)' },
    { value: 'pedestrian_cyclist', label: 'I was a pedestrian or cyclist' },
    { value: 'none', label: 'None of these apply' },
  ],
  showIf: (answers) => answers.had_valid_insurance === 'no',
},
{
  id: 'prop_213_exception_good_news',
  type: 'info',
  prompt: '✅ Good news — Proposition 213 does NOT apply to your situation. You can recover both economic and non-economic damages.',
  showIf: (answers) => answers.had_valid_insurance === 'no' && answers.prop_213_exception_check !== 'none' && answers.prop_213_exception_check !== undefined,
},
```

**Government Entity Detection (same 3 questions as TX, different warning content):**
Same `gov_employee_on_duty`, `gov_property`, `gov_vehicle`, `gov_entity_type`, `gov_entity_name` questions.

Change the warning info block:
```typescript
{
  id: 'gov_entity_warning',
  type: 'info',
  prompt: '🚨 Important: California Government Claims Act\n\nBecause a government entity is involved, you MUST file an administrative claim before filing a lawsuit (Government Code §910-913). You have 6 months from the date of injury to file this claim.\n\nIf you miss the 6-month deadline, you may apply for late claim relief within 1 year (Government Code §911.4).\n\nWe\'ll add a special task to help you prepare and file this claim.',
  showIf: (answers) => answers.gov_employee_on_duty === 'yes' || answers.gov_property === 'yes' || answers.gov_vehicle === 'yes',
},
```

Change `gov_entity_type` options:
```typescript
options: [
  { value: 'state_agency', label: 'State Agency (Caltrans, CHP, state hospital)' },
  { value: 'county', label: 'County (county road, county hospital, sheriff)' },
  { value: 'city', label: 'City (city bus, city park, city employee)' },
  { value: 'school_district', label: 'School District (school bus, school property)' },
  { value: 'special_district', label: 'Special District (transit authority, water district)' },
],
```

**SOL Tolling (same structure, CA citations):**
Same questions but update helpText:
- minor: 'If yes, the 2-year clock doesn\'t start until you turn 18 (CCP §352).'
- mental_incapacity: 'If yes, the clock is paused during the period of incapacity (CCP §352).'
- discovered_later: 'California\'s delayed discovery rule may start the clock from when you discovered (or should have discovered) the injury.'
- Add one extra question:
```typescript
{
  id: 'defendant_absent',
  type: 'yes_no',
  prompt: 'Has the defendant been absent from California for an extended period since the incident?',
  helpText: 'If yes, the statute of limitations may be tolled during their absence (CCP §351).',
  showIf: (answers) => answers.minor_at_incident !== 'yes' && answers.mental_incapacity !== 'yes' && answers.discovered_later !== 'yes',
},
```

**Pure Comparative Fault (replaces TX 51% bar):**
```typescript
{
  id: 'comparative_fault_info',
  type: 'info',
  prompt: '📋 Important: California\'s Pure Comparative Fault Rule\n\nCalifornia uses pure comparative negligence (Li v. Yellow Cab Co., 1975). Unlike some states, there is NO minimum threshold — even if you are found 99% at fault, you can still recover 1% of your damages.\n\nHowever, the defendant WILL argue you share fault to reduce your recovery. Documenting the other party\'s negligence is critical to minimizing the percentage of fault attributed to you.',
},
```

**generateSummary:** Same structure as TX but add:
- Prop 213 status (if applies, if exception found)
- CA-specific SOL tolling items (including defendant absent)
- No mention of 51% bar

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-intake-ca.ts
git commit -m "feat(pi-ca): add California intake config with Prop 213, gov claims, pure comparative fault

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Create `pi-medical-records-ca.ts` — Howell, Treatment on Lien, Medi-Cal/Medicare

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-medical-records-ca.ts`
- Reference: `packages/shared/src/guided-steps/personal-injury/pi-medical-records.ts` (TX version)

**Step 1: Create the CA medical records config**

Export `piMedicalRecordsCaConfig` as a `GuidedStepConfig`. Start with the same base medical records questions as TX (ER visit, specialist records, imaging, prescriptions, PT, mental health, HIPAA, timeline, MMI). Then REPLACE the TX hospital lien section with CA-specific sections:

**Howell v. Hamilton Meats Section (replaces TX hospital lien):**
```typescript
{
  id: 'howell_header',
  type: 'info',
  prompt: '💰 Important California Rule: Billed vs. Paid Medical Bills\n\nIn California, you can only recover the amount actually paid for your medical treatment — not the full billed amount (Howell v. Hamilton Meats, 2011).\n\nExample: If your hospital billed $50,000 but your insurance paid $12,000 in full satisfaction, your recoverable medical damages are $12,000, not $50,000.\n\nThis makes collecting the right documentation critical.',
},
{
  id: 'has_health_insurance',
  type: 'single_choice',
  prompt: 'Do you have health insurance that covered any of your treatment?',
  options: [
    { value: 'yes', label: 'Yes — insurance covered my treatment' },
    { value: 'partial', label: 'Partial — some treatment was covered, some was not' },
    { value: 'no', label: 'No — I paid out of pocket or treatment is on lien' },
  ],
},
{
  id: 'eob_guidance',
  type: 'info',
  prompt: '📋 Collect Your EOB Statements\n\nYou need Explanation of Benefits (EOB) statements from your insurance company for every medical visit related to this injury. EOBs show:\n\n• Amount billed by provider\n• Amount paid by insurance\n• Amount you owe\n\nKeep BOTH the original bills AND the EOBs — you need both to properly document your damages under Howell.',
  showIf: (answers) => answers.has_health_insurance === 'yes' || answers.has_health_insurance === 'partial',
},
{
  id: 'collected_eobs',
  type: 'yes_no',
  prompt: 'Have you collected EOB statements for all injury-related treatment?',
  showIf: (answers) => answers.has_health_insurance === 'yes' || answers.has_health_insurance === 'partial',
},
```

**Treatment on Lien Section:**
```typescript
{
  id: 'lien_header',
  type: 'info',
  prompt: '📋 Treatment on Lien\n\nIn California, medical providers may agree to treat you on a "lien" basis — deferring payment until your case resolves. The provider takes a lien on your settlement proceeds.\n\nImportant: When treatment is on lien, there is no insurance discount. The full billed amount may be argued as the "reasonable value" of services, which can actually help your case under Howell.',
},
{
  id: 'treatment_on_lien',
  type: 'yes_no',
  prompt: 'Are any of your medical providers treating you on a lien basis?',
},
{
  id: 'lien_warning',
  type: 'info',
  prompt: '⚠️ Lien Negotiation\n\nLien doctors know the system. Their bills may be inflated. Remember:\n\n• Lien amounts are negotiable at settlement\n• You are not obligated to pay the full billed amount\n• Get the lien agreement in writing\n• Track all lien amounts — they reduce your net recovery',
  showIf: (answers) => answers.treatment_on_lien === 'yes',
},
{
  id: 'lien_provider_name',
  type: 'text',
  prompt: 'Name of the primary lien provider:',
  placeholder: 'Provider name',
  showIf: (answers) => answers.treatment_on_lien === 'yes',
},
{
  id: 'lien_amount',
  type: 'text',
  prompt: 'Approximate lien amount (if known):',
  placeholder: 'e.g., $25,000',
  showIf: (answers) => answers.treatment_on_lien === 'yes',
},
```

**Medi-Cal / Medicare Lien Section:**
```typescript
{
  id: 'govt_lien_header',
  type: 'info',
  prompt: '🏛️ Government Health Program Liens\n\nIf Medi-Cal (California Medicaid) or Medicare paid for any of your treatment, they have a legal right to be reimbursed from your settlement. These are called statutory liens and MUST be satisfied.',
},
{
  id: 'medi_cal_paid',
  type: 'yes_no',
  prompt: 'Did Medi-Cal pay for any of your injury-related treatment?',
},
{
  id: 'medi_cal_guidance',
  type: 'info',
  prompt: '📞 Contact DHCS\n\nContact the California Department of Health Care Services (DHCS) Third Party Liability and Recovery Division to determine your Medi-Cal lien amount.\n\nPhone: (916) 650-0490\nWebsite: dhcs.ca.gov\n\nDo this early — lien amounts take time to calculate and must be resolved before distributing any settlement.',
  showIf: (answers) => answers.medi_cal_paid === 'yes',
},
{
  id: 'medicare_paid',
  type: 'yes_no',
  prompt: 'Did Medicare pay for any of your injury-related treatment?',
},
{
  id: 'medicare_guidance',
  type: 'info',
  prompt: '📞 Contact BCRC\n\nContact the Benefits Coordination & Recovery Center (BCRC) to report your case and determine your Medicare lien amount.\n\nPhone: 1-855-798-2627\nWebsite: cms.gov/Medicare/Coordination-of-Benefits-and-Recovery\n\nMedicare must be notified of any settlement and their lien must be satisfied.',
  showIf: (answers) => answers.medicare_paid === 'yes',
},
{
  id: 'govt_lien_amount',
  type: 'text',
  prompt: 'Combined Medi-Cal/Medicare lien amount (if known):',
  placeholder: 'e.g., $8,000',
  showIf: (answers) => answers.medi_cal_paid === 'yes' || answers.medicare_paid === 'yes',
},
```

**Medical Authorization Warning (same as TX):**
```typescript
{
  id: 'medical_auth_warning',
  type: 'info',
  prompt: '🚫 DON\'T Sign Blanket Medical Authorizations\n\nThe insurance company may ask you to sign a broad medical authorization giving them access to your entire medical history. DON\'T do this.\n\n✅ DO: Only authorize release of records directly related to this injury.\n❌ DON\'T: Sign anything that gives them access to unrelated medical history.\n\nThey want to find pre-existing conditions to reduce your claim.',
},
```

**generateSummary:** Include Howell documentation status, lien tracking, Medi-Cal/Medicare lien status.

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-medical-records-ca.ts
git commit -m "feat(pi-ca): add California medical records config with Howell, liens, Medi-Cal/Medicare

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Create `pi-insurance-communication-ca.ts` — Playbook + CA UM/UIM + MedPay

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-insurance-communication-ca.ts`
- Reference: `packages/shared/src/guided-steps/personal-injury/pi-insurance-communication.ts` (TX version)

**Step 1: Create the CA insurance config**

Export `piInsuranceCommunicationCaConfig`. Structure:

1. **Playbook section** — IDENTICAL to TX (same 7 questions including acknowledgment). Copy verbatim.

2. **Insurance claim tracking** — Same as TX middle section (claim filed, adjuster contacted, recorded statement, quick settlement, documentation, policy limits).

3. **CA UM/UIM section (replaces TX UM/UIM):**

```typescript
{
  id: 'uim_section_header',
  type: 'info',
  prompt: '🚗 California UM/UIM Coverage\n\nCalifornia law requires all auto liability policies to include Uninsured/Underinsured Motorist (UM/UIM) coverage (Insurance Code §11580.2). This coverage is automatic unless you specifically rejected it in writing.\n\nKey difference: UM/UIM claims in California are resolved through binding arbitration with your own insurer — not through a lawsuit.',
},
{
  id: 'at_fault_has_insurance',
  type: 'single_choice',
  prompt: 'Does the at-fault driver have insurance?',
  options: [
    { value: 'yes', label: 'Yes — they have insurance' },
    { value: 'no', label: 'No — they are uninsured' },
    { value: 'unknown', label: 'I don\'t know yet' },
    { value: 'not_vehicle', label: 'This is not a motor vehicle case' },
  ],
},
{
  id: 'coverage_sufficient',
  type: 'single_choice',
  prompt: 'Is their insurance coverage enough to cover your damages?',
  options: [
    { value: 'yes', label: 'Yes — their coverage seems sufficient' },
    { value: 'no', label: 'No — their limits are too low' },
    { value: 'unknown', label: 'I don\'t know their coverage limits' },
  ],
  showIf: (answers) => answers.at_fault_has_insurance === 'yes',
},
{
  id: 'um_uim_rejected',
  type: 'single_choice',
  prompt: 'Did you ever sign a written rejection of UM/UIM coverage on your auto policy?',
  options: [
    { value: 'yes', label: 'Yes — I signed a written rejection' },
    { value: 'no', label: 'No — I never rejected it' },
    { value: 'unknown', label: 'I don\'t know' },
  ],
  showIf: (answers) =>
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown',
},
{
  id: 'uim_guidance',
  type: 'info',
  prompt: '📋 File a UM/UIM Claim\n\nIf you never signed a written rejection, you have UM/UIM coverage by law. Here\'s what to do:\n\n1. Find your auto insurance policy declarations page\n2. Look for "Uninsured Motorist" or "Underinsured Motorist" coverage and limits\n3. Notify your insurer of the claim\n4. Your claim will be resolved through binding arbitration — a private process, typically faster than court\n\n⚠️ You have 2 years from the date of the accident to initiate UM/UIM arbitration (Insurance Code §11580.2(i)(1)).\n\n⚠️ For UIM claims: You must exhaust the at-fault driver\'s policy limits first, OR get your insurer\'s written consent to settle for less.',
  showIf: (answers) =>
    (answers.at_fault_has_insurance === 'no' || answers.at_fault_has_insurance === 'unknown' || answers.coverage_sufficient === 'no' || answers.coverage_sufficient === 'unknown') &&
    answers.um_uim_rejected !== 'yes',
},
{
  id: 'uim_insurer_name',
  type: 'text',
  prompt: 'What is your auto insurance company name?',
  placeholder: 'e.g., State Farm, GEICO, Progressive',
  showIf: (answers) =>
    (answers.at_fault_has_insurance === 'no' || answers.at_fault_has_insurance === 'unknown' || answers.coverage_sufficient === 'no' || answers.coverage_sufficient === 'unknown') &&
    answers.um_uim_rejected !== 'yes',
},
{
  id: 'uim_policy_number',
  type: 'text',
  prompt: 'What is your policy number?',
  placeholder: 'Policy number from declarations page',
  showIf: (answers) =>
    (answers.at_fault_has_insurance === 'no' || answers.at_fault_has_insurance === 'unknown' || answers.coverage_sufficient === 'no' || answers.coverage_sufficient === 'unknown') &&
    answers.um_uim_rejected !== 'yes',
},
{
  id: 'uim_limits',
  type: 'text',
  prompt: 'What are your UM/UIM coverage limits?',
  placeholder: 'e.g., $30,000/$60,000',
  showIf: (answers) =>
    (answers.at_fault_has_insurance === 'no' || answers.at_fault_has_insurance === 'unknown' || answers.coverage_sufficient === 'no' || answers.coverage_sufficient === 'unknown') &&
    answers.um_uim_rejected !== 'yes',
},
```

4. **MedPay section (CA-specific, no TX equivalent):**

```typescript
{
  id: 'medpay_header',
  type: 'info',
  prompt: '💊 Medical Payments (MedPay) Coverage\n\nCalifornia auto insurers must offer MedPay coverage of at least $1,000 (Insurance Code §11580.06). MedPay covers your medical expenses regardless of who was at fault.\n\nMedPay is optional — you may have declined it. Check your policy.',
},
{
  id: 'has_medpay',
  type: 'single_choice',
  prompt: 'Does your auto insurance policy include MedPay coverage?',
  options: [
    { value: 'yes', label: 'Yes — I have MedPay' },
    { value: 'no', label: 'No — I declined it' },
    { value: 'unknown', label: 'I don\'t know — I\'ll check my policy' },
  ],
},
{
  id: 'medpay_guidance',
  type: 'info',
  prompt: '✅ File Your MedPay Claim Now\n\nMedPay pays your medical bills regardless of fault — file the claim with your own insurer immediately. There is no reason to wait.\n\n⚠️ Be aware: your insurer may seek reimbursement (subrogation) from any settlement you receive. Factor this into your net recovery calculation.',
  showIf: (answers) => answers.has_medpay === 'yes' || answers.has_medpay === 'unknown',
},
{
  id: 'medpay_limit',
  type: 'text',
  prompt: 'What is your MedPay coverage limit?',
  placeholder: 'e.g., $5,000',
  showIf: (answers) => answers.has_medpay === 'yes',
},
```

5. **Prop 213 Reinforcement (if applicable):**
```typescript
{
  id: 'prop_213_reminder',
  type: 'info',
  prompt: '⚠️ Reminder: Proposition 213\n\nBecause you did not have valid insurance at the time of the accident, your recovery is limited to economic damages only (medical bills, lost wages, property damage). Keep this in mind when evaluating settlement offers.',
  showIf: (answers) => answers.prop_213_reminder_flag === 'yes',
},
```

Note: The `prop_213_reminder_flag` would need to be pre-populated from intake metadata. Since GuidedStep configs only see their own answers, we'll handle this by passing it as an `existingAnswer` from the component. Alternatively, add a question that re-asks: "Were you uninsured at the time of the accident?" and use showIf on that.

**generateSummary:** Playbook status, UM/UIM tracking (with arbitration note), MedPay status.

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-insurance-communication-ca.ts
git commit -m "feat(pi-ca): add California insurance config with UM/UIM arbitration and MedPay

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Create `pi-tort-claims-notice-ca.ts` and `pi-tort-claims-tracking-ca.ts`

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/pi-tort-claims-notice-ca.ts`
- Create: `packages/shared/src/guided-steps/personal-injury/pi-tort-claims-tracking-ca.ts`

**Step 1: Create CA tort claims notice config**

Export `piTortClaimsNoticeCaConfig`. Same structure as TX but:

- Change all TX Tort Claims Act references to CA Government Code §910-913
- Change recipients:
  - State agency → "Department of General Services, Office of Risk and Insurance Management, P.O. Box 989052, West Sacramento, CA 95798"
  - County → "County Clerk or Board of Supervisors"
  - City → "City Clerk"
  - School district → "District Secretary or governing board"
  - Special district → "Clerk or secretary of the governing body"
- Change damages guidance: "If your claim exceeds $10,000, state 'damages exceed $10,000' rather than specifying an exact amount"
- Remove TX city-specific deadline warnings (Austin 45d, Houston 90d) — CA is uniform 6 months
- Add late claim relief note: "If you missed the 6-month deadline but are within 1 year of the incident, you may apply for late claim relief under Government Code §911.4"

**Step 2: Create CA tort claims tracking config**

Export `piTortClaimsTrackingCaConfig`. Same structure as TX but:

- Change response window from 90 days to **45 days** (Gov. Code §912.4)
- Update entity_response options:
  - `not_yet` → "Not yet — still within 45-day window"
  - `accepted` → same
  - `denied` → "They denied the claim in writing"
  - `deemed_rejected` → "45 days passed with no response (deemed rejected)"
- If denied: "You have 6 months from the date of the written rejection notice to file your lawsuit (Government Code §945.6)."
- If deemed rejected: "The claim is deemed rejected. You have 2 years from the date of injury to file your lawsuit."
- Add late claim relief question:
```typescript
{
  id: 'missed_deadline',
  type: 'yes_no',
  prompt: 'Did you miss the original 6-month claim filing deadline?',
},
{
  id: 'late_claim_guidance',
  type: 'info',
  prompt: '📋 Late Claim Relief (Government Code §911.4)\n\nYou may apply in writing to the government entity for permission to file a late claim. Your application must:\n\n• Explain why the claim was not filed on time\n• Include a copy of the proposed claim\n• Be filed within 1 year of the incident date\n\nIf the entity denies your late claim application, you may petition the Superior Court within 6 months of that denial (Government Code §946.6). Courts consider whether the delay was due to mistake, inadvertence, surprise, or excusable neglect.',
  showIf: (answers) => answers.missed_deadline === 'yes',
},
```

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 4: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/pi-tort-claims-notice-ca.ts packages/shared/src/guided-steps/personal-injury/pi-tort-claims-tracking-ca.ts
git commit -m "feat(pi-ca): add California tort claims notice and tracking configs

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Create `prepare-pi-petition-ca.ts` — Judicial Council Form Wizard

**Files:**
- Create: `packages/shared/src/guided-steps/personal-injury/prepare-pi-petition-ca.ts`

**Step 1: Create the CA petition wizard config**

Export `preparePiPetitionCaConfig` as a `GuidedStepConfig`. This is a GUIDED STEP config (not a custom component like the TX petition wizard). It walks users through form selection and preparation.

**Form Selection Section:**
```typescript
{
  id: 'forms_overview',
  type: 'info',
  prompt: '📋 California Judicial Council Forms\n\nCalifornia requires specific court forms for personal injury complaints. Unlike some states where you draft a complaint from scratch, California uses standardized Judicial Council forms.\n\nWe\'ll help you identify which forms you need and how to fill them out.',
},
{
  id: 'main_forms_info',
  type: 'info',
  prompt: '📄 Required Forms (everyone files these):\n\n• PLD-PI-001 — Complaint: Personal Injury, Property Damage, Wrongful Death\n• SUM-100 — Summons (issued by the court)\n• CM-010 — Civil Case Cover Sheet\n\nDownload these from the California Courts website: courts.ca.gov/forms',
},
{
  id: 'cause_of_action_form',
  type: 'single_choice',
  prompt: 'Which cause of action attachment matches your case?',
  options: [
    { value: 'PLD-PI-001(1)', label: 'Motor Vehicle — auto accident, pedestrian, rideshare' },
    { value: 'PLD-PI-001(2)', label: 'General Negligence — dog bite, other negligence' },
    { value: 'PLD-PI-001(4)', label: 'Premises Liability — slip and fall, unsafe property' },
    { value: 'PLD-PI-001(5)', label: 'Products Liability — defective product' },
  ],
},
{
  id: 'fee_waiver_needed',
  type: 'yes_no',
  prompt: 'Do you need a fee waiver? (Filing fees are $435 for unlimited civil cases, $240-$370 for limited civil)',
  helpText: 'If you cannot afford the filing fee, you can request a fee waiver using form FW-001.',
},
{
  id: 'punitive_damages',
  type: 'yes_no',
  prompt: 'Are you claiming punitive damages? (The defendant acted with malice, oppression, or fraud)',
  helpText: 'If yes, you will also need form PLD-PI-001(6). Punitive damages require clear and convincing evidence under Civil Code §3294.',
},
```

**Case Classification Section:**
```typescript
{
  id: 'case_classification_info',
  type: 'info',
  prompt: '⚖️ Case Classification\n\nCalifornia divides civil cases into two categories:\n\n• Limited Civil: $35,000 or less (filing fee ~$240-$370)\n• Unlimited Civil: Over $35,000 (filing fee $435)\n\nMost PI cases with significant injuries are unlimited civil cases.',
},
{
  id: 'case_classification',
  type: 'single_choice',
  prompt: 'What is the approximate total value of your claim?',
  options: [
    { value: 'limited_civil', label: '$35,000 or less (Limited Civil)' },
    { value: 'unlimited_civil', label: 'Over $35,000 (Unlimited Civil)' },
  ],
},
{
  id: 'no_dollar_amount_warning',
  type: 'info',
  prompt: '🚫 Important: Do NOT State a Dollar Amount\n\nCalifornia law (CCP §425.10(b)) PROHIBITS stating a specific dollar amount in your complaint for personal injury cases. Your complaint will request damages "according to proof."\n\nThis is the opposite of Texas, which requires a relief level statement.',
},
```

**Venue Section:**
```typescript
{
  id: 'venue_info',
  type: 'info',
  prompt: '📍 Filing Venue (CCP §395)\n\nYou can file your lawsuit in:\n• The county where the injury occurred\n• The county where the defendant resides (if an individual)\n• The county of the defendant\'s principal place of business (if a company)',
},
{
  id: 'venue_county',
  type: 'text',
  prompt: 'In which county will you file?',
  placeholder: 'e.g., Los Angeles, San Francisco, San Diego',
},
{
  id: 'venue_basis',
  type: 'single_choice',
  prompt: 'Why is this county the correct venue?',
  options: [
    { value: 'incident_location', label: 'The injury occurred in this county' },
    { value: 'defendant_residence', label: 'The defendant lives in this county' },
    { value: 'defendant_business', label: 'The defendant\'s principal office is in this county' },
  ],
},
```

**Damages Categories (checkboxes as yes_no questions — no dollar amounts):**
```typescript
{
  id: 'damages_header',
  type: 'info',
  prompt: '💰 Damages Categories\n\nSelect all categories of damages you intend to claim. Remember: you will NOT state specific dollar amounts in the complaint — just the categories. Specific amounts will be proven through evidence at trial or settlement.',
},
{
  id: 'damages_past_medical',
  type: 'yes_no',
  prompt: 'Past medical expenses?',
},
{
  id: 'damages_future_medical',
  type: 'yes_no',
  prompt: 'Future medical expenses?',
},
{
  id: 'damages_past_lost_earnings',
  type: 'yes_no',
  prompt: 'Past lost earnings?',
},
{
  id: 'damages_future_lost_earning',
  type: 'yes_no',
  prompt: 'Future lost earning capacity?',
},
{
  id: 'damages_pain_suffering',
  type: 'yes_no',
  prompt: 'Pain and suffering?',
},
{
  id: 'damages_emotional_distress',
  type: 'yes_no',
  prompt: 'Emotional distress?',
},
{
  id: 'damages_loss_enjoyment',
  type: 'yes_no',
  prompt: 'Loss of enjoyment of life?',
},
{
  id: 'damages_property_damage',
  type: 'yes_no',
  prompt: 'Property damage?',
},
```

**Jury Fee Warning:**
```typescript
{
  id: 'jury_demand',
  type: 'yes_no',
  prompt: 'Do you want a jury trial?',
  helpText: 'Juries tend to award higher damages than judges in PI cases. Strongly recommended.',
},
{
  id: 'jury_fee_warning',
  type: 'info',
  prompt: '🚨 Critical: $150 Jury Fee Deadline\n\nYou MUST post a $150 non-refundable jury fee at or before your initial Case Management Conference (CMC), which is typically scheduled about 180 days after filing.\n\nIf you miss this deadline, you PERMANENTLY waive your right to a jury trial. This is one of the most common pro se mistakes in California.\n\nWe will track this deadline for you.',
  showIf: (answers) => answers.jury_demand === 'yes',
},
```

**Doe Defendants (CA-specific):**
```typescript
{
  id: 'doe_defendants_info',
  type: 'info',
  prompt: '👤 Doe Defendants (CCP §474)\n\nCalifornia allows you to name up to 100 "Doe" defendants in your complaint. This is useful when you don\'t know the names of all responsible parties at the time of filing.\n\nThe PLD-PI-001 form includes a section for Doe defendants. It is standard practice to include them.',
},
```

**generateSummary:** Forms needed, case classification, venue, damages categories selected, jury demand status.

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 3: Commit**

```bash
git add packages/shared/src/guided-steps/personal-injury/prepare-pi-petition-ca.ts
git commit -m "feat(pi-ca): add California petition wizard with Judicial Council forms and jury fee warning

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Add state-aware routing in page.tsx

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add imports for all CA configs**

```typescript
import { piIntakeCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-intake-ca'
import { piMedicalRecordsCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-medical-records-ca'
import { piInsuranceCommunicationCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-insurance-communication-ca'
import { piTortClaimsNoticeCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-notice-ca'
import { piTortClaimsTrackingCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-tort-claims-tracking-ca'
import { preparePiPetitionCaConfig } from '@lawyer-free/shared/guided-steps/personal-injury/prepare-pi-petition-ca'
```

**Step 2: Update routing for state awareness**

For each PI task that has a CA variant, add state check. The case's state is available from the cases table. We need to fetch it.

Find where `pi_intake` is routed (around line 1291). The existing code already fetches `personal_injury_details`. We also need the case's state. Check if `caseData` or similar is already available in the page component. If not, add a query for the case's state field.

Update routing pattern for each divergent step:

```typescript
// For guided step configs (tort claims, medical records, insurance, petition)
case 'pi_tort_claims_notice': {
  const { data: caseRow } = await supabase.from('cases').select('state').eq('id', id).single()
  const config = caseRow?.state === 'California' ? piTortClaimsNoticeCaConfig : piTortClaimsNoticeConfig
  return <GuidedStep caseId={id} taskId={taskId} config={config} existingAnswers={task.metadata?.guided_answers} />
}
```

Apply the same pattern for:
- `pi_tort_claims_tracking` → TX config or CA config
- `pi_medical_records` → TX config or CA config (for GuidedStep-wrapped cases)
- `pi_insurance_communication` → TX config or CA config (for GuidedStep-wrapped cases)

For `pi_intake` (custom component), pass the state to `PIIntakeStep` as a new prop so it can use the correct guided step config internally.

For `prepare_pi_petition` (TX uses PersonalInjuryWizard custom component), CA uses a GuidedStep config. Route based on state:
```typescript
case 'prepare_pi_petition': {
  const { data: caseRow } = await supabase.from('cases').select('state').eq('id', id).single()
  if (caseRow?.state === 'California') {
    return <GuidedStep caseId={id} taskId={taskId} config={preparePiPetitionCaConfig} existingAnswers={task.metadata?.guided_answers} />
  }
  // else: existing TX PersonalInjuryWizard
}
```

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`

**Step 4: Commit**

```bash
git add "apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx"
git commit -m "feat(pi-ca): add state-aware routing for CA PI guided steps

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Update intake component for CA support

**Files:**
- Modify: `apps/web/src/components/step/personal-injury/pi-intake-step.tsx`

**Step 1: Add Prop 213 state variables**

```typescript
// Prop 213 (CA only)
const [hadValidInsurance, setHadValidInsurance] = useState(
  (meta.had_valid_insurance as string) ?? ''
)
const [prop213Exception, setProp213Exception] = useState(
  (meta.prop_213_exception as string) ?? ''
)

const prop213Applies = hadValidInsurance === 'no' && (prop213Exception === 'none' || prop213Exception === '')
```

**Step 2: Update buildMetadata()**

Add CA-specific fields:
```typescript
had_valid_insurance: hadValidInsurance || null,
prop_213_exception: hadValidInsurance === 'no' ? prop213Exception || null : null,
prop_213_applies: prop213Applies,
```

**Step 3: Update handleConfirm() for CA task injection**

The existing injection calls `pi_tort_claims_notice` and `pi_tort_claims_tracking`. For CA cases, we need to check the state and inject CA-specific task keys. However, since the inject API and SQL function use the same task keys regardless of state (the CONFIG loaded at render time handles the content difference), we can reuse the same task keys.

No change needed to the injection call — the state-aware routing in page.tsx handles loading the correct config when the user opens the injected task.

**Step 4: Add Prop 213 form section to JSX**

Add BEFORE the government entity section (only shown for CA cases). The component needs to know the state — add a `state` prop to the component interface:

```typescript
interface PIIntakeStepProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  piSubType?: string
  state?: string  // NEW
}
```

Then conditionally render Prop 213 section:
```typescript
{state === 'California' && (
  // Prop 213 section: insurance check, warning, exception check
)}
```

And conditionally render pure comparative fault instead of 51% bar:
```typescript
{state === 'California' ? (
  // Pure comparative fault info card
) : (
  // TX 51% bar info card (existing)
)}
```

**Step 5: Update page.tsx to pass state prop**

In the `pi_intake` routing case, fetch the state and pass it:
```typescript
case 'pi_intake': {
  const [{ data: piDetails }, { data: caseRow }] = await Promise.all([
    supabase.from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle(),
    supabase.from('cases').select('state').eq('id', id).single(),
  ])
  return (
    <PIIntakeStep
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      piSubType={piDetails?.pi_sub_type ?? undefined}
      state={caseRow?.state ?? undefined}
    />
  )
}
```

**Step 6: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`

**Step 7: Commit**

```bash
git add apps/web/src/components/step/personal-injury/pi-intake-step.tsx "apps/web/src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx"
git commit -m "feat(pi-ca): add Prop 213 detection and state-aware intake component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Add CA deadline rules

**Files:**
- Modify: `packages/shared/src/rules/deadline-rules.ts`

**Step 1: Add state condition to DeadlineRule interface**

Check if a `condition_state` field already exists. If not, add:

```typescript
export interface DeadlineRule {
  // ... existing fields ...
  condition_state?: string  // Only create deadline if case state matches (e.g., 'California')
}
```

**Step 2: Add CA-specific deadline rules to `buildDisputeSpecificRules()`**

```typescript
// CA: Service deadline (60 days, not 90)
{
  trigger_task: 'pi_file_with_court',
  deadline_key: 'ca_service_deadline',
  deadline_label: 'Deadline to Serve (California)',
  offset_days: 60,
  reference: 'task_completed_at' as const,
  apply_rule_4: false,
  consequence: 'If you do not serve the defendant within 60 days of filing, the court may dismiss your case or impose sanctions (CRC 3.110(b)).',
  condition_state: 'California',
},
// CA: Answer deadline (30 days, not 20)
{
  trigger_task: 'pi_serve_defendant',
  deadline_key: 'ca_answer_deadline',
  deadline_label: 'Defendant Answer Deadline (California)',
  offset_days: 30,
  reference: 'task_completed_at' as const,
  apply_rule_4: false,
  consequence: 'If the defendant does not respond within 30 days, you may request entry of default (CCP §412.20).',
  condition_state: 'California',
},
// CA: Jury fee deadline (~180 days from filing)
{
  trigger_task: 'pi_file_with_court',
  deadline_key: 'ca_jury_fee_deadline',
  deadline_label: 'Jury Fee Posting Deadline',
  offset_days: 180,
  reference: 'task_completed_at' as const,
  apply_rule_4: false,
  consequence: 'You must post the $150 non-refundable jury fee at or before your initial Case Management Conference. Missing this permanently waives your right to a jury trial.',
  condition_state: 'California',
  condition_metadata_field: 'guided_answers.jury_demand',
  condition_metadata_values: ['yes'],
},
// CA: UM/UIM arbitration deadline (2 years)
{
  trigger_task: 'pi_insurance_communication',
  deadline_key: 'ca_um_uim_arbitration_deadline',
  deadline_label: 'UM/UIM Arbitration Deadline',
  offset_days: 730,
  reference: 'task_completed_at' as const,
  apply_rule_4: false,
  consequence: 'You have 2 years from the date of the accident to initiate UM/UIM arbitration (Insurance Code §11580.2(i)(1)). After this, your UM/UIM claim is time-barred.',
  condition_state: 'California',
  condition_metadata_field: 'guided_answers.at_fault_has_insurance',
  condition_metadata_values: ['no', 'unknown'],
},
```

**Step 3: Update deadline generator to check `condition_state`**

In `packages/shared/src/rules/deadline-generator.ts`, add state check in the `generateDeadlines` function. The `GenerateDeadlinesInput` interface needs a `caseState` field:

```typescript
export interface GenerateDeadlinesInput {
  // ... existing fields ...
  caseState?: string  // e.g., 'California', 'Texas'
}
```

Add check after the existing condition_metadata check:

```typescript
// --- State condition: skip if rule is for a different state ---
if (rule.condition_state && input.caseState !== rule.condition_state) {
  continue
}
```

Also update wherever `generateDeadlines` is called to pass the case state.

**Step 4: Update the SQL injection function for CA tort claims**

Modify `inject_conditional_tasks` to support CA's 45-day response window. Add a parameter `p_state` to the function. If state is California, create the tort claims deadline with the same 6-month window but the response window should be 45 days (handled by the unlock trigger).

Create new migration: `supabase/migrations/20260405000003_ca_tort_claims_unlock.sql`

```sql
-- CA-specific unlock: 45-day response window (vs TX 90-day)
CREATE OR REPLACE FUNCTION public.unlock_ca_tort_claims_tasks()
RETURNS TRIGGER AS $$
DECLARE
  v_dispute_type text;
  v_state text;
BEGIN
  SELECT dispute_type, state INTO v_dispute_type, v_state FROM public.cases WHERE id = NEW.case_id;
  IF v_dispute_type != 'personal_injury' OR v_state != 'California' THEN RETURN NEW; END IF;

  IF NEW.task_key = 'pi_tort_claims_notice' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_tort_claims_tracking' AND status = 'locked';

    INSERT INTO public.deadlines (case_id, key, due_at, source, rationale, label, consequence, auto_generated)
    VALUES (
      NEW.case_id,
      'ca_govt_response_window',
      now() + interval '45 days',
      'system',
      'Government entity has 45 days from receipt of claim to respond (Government Code §912.4).',
      'Government Claim Response Window',
      'After 45 days without response, the claim is deemed rejected. You have 2 years from injury to file suit.',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;

  IF NEW.task_key = 'pi_tort_claims_tracking' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'pi_medical_records' AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS unlock_ca_tort_claims_trigger ON public.tasks;
CREATE TRIGGER unlock_ca_tort_claims_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_ca_tort_claims_tasks();
```

**Step 5: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 6: Commit**

```bash
git add packages/shared/src/rules/deadline-rules.ts packages/shared/src/rules/deadline-generator.ts supabase/migrations/20260405000003_ca_tort_claims_unlock.sql
git commit -m "feat(pi-ca): add CA deadline rules and tort claims unlock trigger

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Update petition prompts for CA

**Files:**
- Modify: `packages/shared/src/rules/pi-petition-prompts.ts`

**Step 1: Add CA system prompt builder**

Add a `buildCaStateSystemPrompt()` function (or extend the existing `buildStateSystemPrompt()` with state parameter). The CA prompt should include:

```
CALIFORNIA PETITION REQUIREMENTS:

MANDATORY JUDICIAL COUNCIL FORMS:
Use PLD-PI-001 (Complaint — Personal Injury) as the primary form. The plaintiff must also file SUM-100 (Summons) and CM-010 (Civil Case Cover Sheet).

DO NOT STATE DOLLAR AMOUNTS:
Under CCP §425.10(b), it is PROHIBITED to state a specific dollar amount of damages in the body of a personal injury complaint. The prayer for relief must request damages "according to proof."

VENUE:
State venue under CCP §395: "Venue is proper in [County] County because [the acts or omissions giving rise to this action occurred in this county / Defendant resides in this county / Defendant's principal place of business is in this county]."

COMPARATIVE FAULT:
California follows pure comparative negligence (Li v. Yellow Cab Co., 1975). There is no threshold — plaintiff may recover even if majority at fault.

DOE DEFENDANTS:
Include Doe defendants 1-50 under CCP §474: "Plaintiff is ignorant of the true names and capacities of defendants sued herein as Does 1 through 50, inclusive."

STATEMENT OF FACTS:
Generate a narrative statement of facts that can be attached to the PLD-PI-001 form. Include:
1. Date, time, and location of incident
2. Parties involved
3. Description of defendant's negligent conduct
4. Causation
5. Injuries and damages sustained (categories, not amounts)

CAUSE OF ACTION:
For negligence: duty, breach, causation, damages
For strict liability (dog bite CC §3342): ownership, bite in public/lawful private place, damages
For premises liability: ownership/control, dangerous condition, knowledge, failure to warn/fix, causation

DAMAGES CATEGORIES (no dollar amounts):
List each claimed category without specific amounts:
- Past and future medical expenses
- Past and future lost earnings
- Pain and suffering
- Emotional distress
- Loss of enjoyment of life
- Property damage
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/shared`

**Step 3: Commit**

```bash
git add packages/shared/src/rules/pi-petition-prompts.ts
git commit -m "feat(pi-ca): add California petition prompt with Judicial Council form instructions

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Add Prop 213 + Howell warning to dashboard

**Files:**
- Modify: `apps/web/src/components/dashboard/lien-warning-card.tsx`

**Step 1: Extend the existing lien warning card**

The lien warning card already checks for hospital liens. Extend it to also show:

1. **Prop 213 warning** (CA only) — if `pi_intake` metadata has `prop_213_applies: true`, show a persistent amber warning: "Proposition 213: Your recovery is limited to economic damages only (no pain & suffering)."

2. **Howell reminder** (CA only, settlement phase) — if case is CA and in settlement phase, show: "California Rule: Your recoverable medical damages are limited to amounts actually paid, not billed (Howell v. Hamilton Meats)."

3. **Medi-Cal/Medicare lien warning** (CA only) — if `pi_medical_records` metadata has `medi_cal_paid: 'yes'` or `medicare_paid: 'yes'`, show: "Government Health Lien: Medi-Cal/Medicare liens must be satisfied from your settlement."

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx turbo typecheck --filter=@lawyer-free/web`

**Step 3: Commit**

```bash
git add apps/web/src/components/dashboard/lien-warning-card.tsx
git commit -m "feat(pi-ca): add Prop 213, Howell, and Medi-Cal/Medicare warnings to dashboard

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: End-to-end verification

**Step 1: Run full typecheck**

```bash
cd "/Users/minwang/lawyer free" && npx turbo typecheck
```
Expected: Only pre-existing errors (NY child support tests)

**Step 2: Manual test — CA PI case (standard, no gov entity)**

1. Create new PI case with state=California, sub-type=auto_accident
2. Complete `pi_intake` — verify Prop 213 question appears, pure comparative fault (not 51% bar)
3. Answer "no" to valid insurance — verify Prop 213 warning, exception check
4. Answer "no" to gov entity questions
5. Complete `pi_medical_records` — verify Howell education, billed vs. paid tracking, Medi-Cal/Medicare questions
6. Complete `pi_insurance_communication` — verify same playbook, CA UM/UIM (arbitration, 2-year deadline, not 30-day), MedPay section
7. Complete `prepare_pi_petition` — verify Judicial Council form selection, no dollar amounts, jury fee warning, Doe defendants
8. Verify CA-specific deadlines created (60-day service, 30-day answer, jury fee if applicable)

**Step 3: Manual test — CA PI case with gov entity**

1. Create CA PI case, answer yes to gov entity
2. Verify tort claims tasks injected with CA content (Gov. Code §910, not TX Tort Claims Act)
3. Verify 6-month deadline created
4. Complete notice — verify 45-day response window (not 90)
5. Verify late claim relief question appears

**Step 4: Manual test — TX PI case still works**

1. Create TX PI case — verify all TX-specific content still appears correctly
2. Verify no CA content leaks into TX flow

**Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: address issues found during CA PI Phase 1 end-to-end testing

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | CA intake config (Prop 213, gov claims, pure comparative fault) | 1 created |
| 2 | CA medical records config (Howell, lien, Medi-Cal/Medicare) | 1 created |
| 3 | CA insurance config (playbook, UM/UIM arbitration, MedPay) | 1 created |
| 4 | CA tort claims notice + tracking configs | 2 created |
| 5 | CA petition wizard (Judicial Council forms, jury fee) | 1 created |
| 6 | State-aware routing in page.tsx | 1 modified |
| 7 | Intake component CA support (Prop 213, state prop) | 2 modified |
| 8 | CA deadline rules + tort claims unlock trigger | 3 modified/created |
| 9 | CA petition prompts | 1 modified |
| 10 | Dashboard warnings (Prop 213, Howell, Medi-Cal) | 1 modified |
| 11 | End-to-end verification | 0 |

**Total: 11 tasks, ~15 files touched/created**
