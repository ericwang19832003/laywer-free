# Personal Injury / Minor Car Accident Module — Design Document

**Goal:** Add a plaintiff-side personal injury module covering 8 sub-types (auto accident, pedestrian/cyclist, rideshare, uninsured motorist, slip & fall, dog bite, product liability, other) with a 12-step guided task chain, 3 AI-generated documents (demand letter, petition, settlement agreement), and a dynamic wizard orchestrator.

**Architecture:** Follows the Landlord-Tenant module pattern — Supabase migration (details table + trigger branches), case schema sub-types, wizard sub-type selection in case creation, prompt builders with Zod schemas (TDD), wizard orchestrator with dynamic steps per sub-type, StepRunner-based filing steps, educational task chain steps, and step router wiring.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS), Anthropic Claude API, Zod, vitest

---

## Section 1: Case Creation & Sub-Types

`personal_injury` already exists in `DISPUTE_TYPES`. We add `PI_SUB_TYPES` and wire it into the case creation wizard as plaintiff-only.

**Sub-types (8):**

| Value | Label | Description |
|-------|-------|-------------|
| `auto_accident` | Minor car accident | Fender-bender, rear-end collision, parking lot accident |
| `pedestrian_cyclist` | Pedestrian or cyclist hit | Hit while walking, biking, or using e-scooter |
| `rideshare` | Rideshare accident | Uber, Lyft, or other rideshare-related accident |
| `uninsured_motorist` | Uninsured/underinsured motorist | Other driver has no/insufficient insurance |
| `slip_and_fall` | Slip and fall | Injury on someone else's property |
| `dog_bite` | Dog bite | Animal attack or bite injury |
| `product_liability` | Defective product | Injury caused by a faulty product |
| `other` | Other personal injury | General PI claim not covered above |

**Wizard flow (5 steps):**
1. RoleStep → always "plaintiff" (PI module is plaintiff-only)
2. DisputeTypeStep → selects `personal_injury`
3. PISubTypeStep → selects from 8 sub-types
4. AmountStep → estimated total damages range
5. RecommendationStep → court routing + county input

**Court routing:** Standard Texas thresholds — under $20K = JP Court, $20K–$200K = County Court, over $200K = District Court. 2-year SOL (Tex. Civ. Prac. & Rem. Code § 16.003) prominently displayed.

---

## Section 2: Database Schema & Migration

**New table: `personal_injury_details`**

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | uuid | PK, gen_random_uuid() |
| `case_id` | uuid | FK → cases(id) ON DELETE CASCADE, UNIQUE |
| `pi_sub_type` | text | CHECK IN (8 sub-types) |
| `incident_date` | date | |
| `incident_location` | text | |
| `incident_description` | text | |
| `police_report_number` | text | |
| `police_report_filed` | boolean | DEFAULT false |
| `other_driver_name` | text | (auto-specific) |
| `other_driver_insurance` | text | (auto-specific) |
| `other_driver_policy_number` | text | (auto-specific) |
| `your_insurance_carrier` | text | |
| `your_policy_number` | text | |
| `injury_description` | text | |
| `injury_severity` | text | CHECK IN ('minor','moderate','severe') |
| `medical_providers` | jsonb | DEFAULT '[]' |
| `medical_expenses` | numeric(10,2) | |
| `lost_wages` | numeric(10,2) | |
| `property_damage_amount` | numeric(10,2) | |
| `pain_suffering_multiplier` | numeric(3,1) | 1.5–5x medical |
| `total_demand_amount` | numeric(10,2) | |
| `demand_sent_date` | date | |
| `settlement_status` | text | CHECK IN ('not_started','demand_sent','negotiating','settled','filing') |
| `premises_owner` | text | (slip & fall specific) |
| `product_name` | text | (product liability specific) |
| `created_at` | timestamptz | DEFAULT now() |
| `updated_at` | timestamptz | DEFAULT now() |

**RLS:** `case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())`

**Task chain (12 tasks):**

1. `welcome` — Welcome — Get Started (unlocked)
2. `pi_intake` — Tell Us About Your Injury (locked)
3. `pi_medical_records` — Organize Your Medical Records (locked)
4. `evidence_vault` — Collect Your Evidence (locked)
5. `pi_insurance_communication` — Communicate With Insurance (locked)
6. `prepare_pi_demand_letter` — Draft Your Demand Letter (locked)
7. `pi_settlement_negotiation` — Negotiate Your Settlement (locked)
8. `prepare_pi_petition` — Prepare Your Court Petition (locked)
9. `pi_file_with_court` — File With the Court (locked)
10. `pi_serve_defendant` — Serve the Defendant (locked)
11. `pi_trial_prep` — Prepare for Trial (locked)
12. `pi_post_resolution` — After Resolution (locked)

**Transitions (11):** Each task unlocks the next in linear sequence. All use distinct `pi_` prefixed task_keys.

---

## Section 3: Wizard Steps & Sub-Type UI

**Wizard orchestrator:** `PersonalInjuryWizard` in `src/components/step/personal-injury-wizard.tsx` — follows `LandlordTenantWizard` pattern.

**Dynamic steps via `getStepsForSubType()`:**

| Step ID | Title | Shown For |
|---------|-------|-----------|
| `preflight` | Before You Start | All |
| `incident` | What Happened | All |
| `other_driver` | Other Driver Info | auto_accident, pedestrian_cyclist, rideshare, uninsured_motorist |
| `premises` | Property/Location Info | slip_and_fall |
| `product` | Product Information | product_liability |
| `injuries` | Your Injuries | All |
| `medical` | Medical Treatment | All |
| `damages` | Your Damages | All |
| `insurance` | Insurance Information | All |
| `venue` | Where to File | All |
| `review` | Review Everything | All |

**Step count by sub-type:**
- Auto/pedestrian/rideshare/uninsured: 11 steps (includes other_driver)
- Slip & fall: 11 steps (includes premises)
- Product liability: 11 steps (includes product)
- Dog bite / other: 10 steps (no conditional step)

**Wizard sub-step components** (in `src/components/step/personal-injury-wizard-steps/`):

1. **`pi-preflight.tsx`** — Checklist: photos of injuries/scene, medical records, police report, insurance info, bills/receipts. Sub-type-specific tips via ExpandableSection.
2. **`pi-incident-step.tsx`** — Date, location, description textarea, police report filed (y/n), police report number.
3. **`pi-other-driver-step.tsx`** — Other driver name, insurance carrier, policy number, license plate. Only for auto-related sub-types.
4. **`pi-premises-step.tsx`** — Property owner name, property address, hazard description, prior complaints. Only for slip_and_fall.
5. **`pi-product-step.tsx`** — Product name, manufacturer, purchase date, defect description. Only for product_liability.
6. **`pi-injuries-step.tsx`** — Injury description textarea, severity selector (minor/moderate/severe), body parts affected (multi-select checkboxes), ongoing treatment (y/n).
7. **`pi-medical-step.tsx`** — Dynamic list of medical providers (name, type, dates, cost). Running total. Add/remove pattern from LT financial step.
8. **`pi-damages-step.tsx`** — Four damage categories: medical expenses (auto-summed from medical step), lost wages (days missed × daily rate), property damage (repair estimates), pain & suffering (multiplier × medical expenses with 1.5x–5x slider). Running grand total.
9. **`pi-insurance-step.tsx`** — Your insurance carrier, policy number, other party's insurance (if applicable), policy limits if known. UM/UIM coverage checkbox.
10. **`pi-venue-step.tsx`** — County, court type (auto-suggested from total damages), cause number (optional).
11. **`pi-review-step.tsx`** — Read-only summary of all data with edit buttons per section.

**Damages calculator:** Pain & suffering uses the "multiplier method" — a multiplier (1.5x for minor, 3x for moderate, 5x for severe) applied to total medical expenses. Displayed in real-time with explanation callout.

**SOL warning:** If `incident_date` is more than 18 months ago, show amber warning: "The Texas statute of limitations for personal injury is 2 years from the date of injury. You have X days remaining to file."

---

## Section 4: AI Document Generation (Prompts)

Three prompt builders, each with Zod schema and `{ system, user }` output.

### 4.1 Insurance Demand Letter

**Schema:** `piDemandLetterFactsSchema`
- `your_info` (partySchema), `defendant_info` (partySchema)
- `insurance_carrier`, `policy_number`, `claim_number` (optional)
- `pi_sub_type`, `incident_date`, `incident_location`, `incident_description`
- `injuries_description`, `injury_severity`
- `medical_providers` (array of { name, type, dates, amount })
- `total_medical_expenses`, `lost_wages`, `property_damage`, `pain_suffering_amount`
- `total_demand_amount`
- `county` (optional)

**System prompt:** Role: legal document formatting assistant. Format: DATE → YOUR INFO → VIA CERTIFIED MAIL → INSURANCE ADDRESS → RE LINE → OPENING → FACTS OF INCIDENT → INJURIES & TREATMENT → DAMAGES (itemized table) → DEMAND (30-day deadline) → CLOSING. Legal citations: Tex. Ins. Code § 542, Tex. Civ. Prac. & Rem. Code § 16.003.

### 4.2 Court Petition / Complaint

**Schema:** `piPetitionFactsSchema`
- `your_info`, `opposing_parties` (array), `court_type`, `county`, `cause_number` (optional)
- `pi_sub_type`, `incident_date`, `incident_location`, `incident_description`
- `injuries_description`, `injury_severity`
- `damages` (medical, lost_wages, property_damage, pain_suffering, total)
- `negligence_theory`, `prior_demand_sent` (boolean), `demand_date` (optional)

**System prompt:** Court caption → PARTIES → JURISDICTION & VENUE → FACTS → NEGLIGENCE/LIABILITY → DAMAGES → CONDITIONS PRECEDENT → PRAYER FOR RELIEF → JURY DEMAND. Sub-type-specific negligence theories (auto: failure to maintain lookout; slip & fall: Tex. Civ. Prac. & Rem. Code § 75; product: Tex. Civ. Prac. & Rem. Code § 82.001; dog bite: known dangerous propensities).

### 4.3 Settlement Agreement / Release

**Schema:** `piSettlementFactsSchema`
- `your_info`, `defendant_info`, `insurance_carrier`, `settlement_amount`
- `incident_date`, `incident_description`, `county`
- `include_medical_liens_release` (boolean), `include_confidentiality` (boolean)

**System prompt:** SETTLEMENT AGREEMENT AND RELEASE OF ALL CLAIMS → PARTIES → RECITALS → SETTLEMENT PAYMENT → RELEASE OF CLAIMS → MEDICAL LIENS (conditional) → CONFIDENTIALITY (conditional) → REPRESENTATIONS → GOVERNING LAW → SIGNATURES. Prominent DRAFT disclaimer.

**MOTION_REGISTRY entries:** `pi_demand_letter`, `pi_petition`, `pi_settlement_agreement`

---

## Section 5: Task Chain Steps

| # | Task Key | Component | Type | Pattern |
|---|----------|-----------|------|---------|
| 1 | `welcome` | (shared) WelcomeStep | Educational | Existing |
| 2 | `pi_intake` | PIIntakeStep | Form → StepRunner | `lt-intake-step.tsx` |
| 3 | `pi_medical_records` | PIMedicalRecordsStep | Educational | `evidence-vault-step.tsx` |
| 4 | `evidence_vault` | (shared) EvidenceVaultStep | Educational | Existing |
| 5 | `pi_insurance_communication` | PIInsuranceCommunicationStep | Educational | `serve-plaintiff-step.tsx` |
| 6 | `prepare_pi_demand_letter` | PIDemandLetterStep | AI Generation | `lt-demand-letter-step.tsx` |
| 7 | `pi_settlement_negotiation` | PISettlementNegotiationStep | Educational | `debt-hearing-prep-step.tsx` |
| 8 | `prepare_pi_petition` | PersonalInjuryWizard | AI Generation | `landlord-tenant-wizard.tsx` |
| 9 | `pi_file_with_court` | PIFileWithCourtStep | Educational | `debt-file-with-court-step.tsx` |
| 10 | `pi_serve_defendant` | PIServeDefendantStep | Educational | `serve-plaintiff-step.tsx` |
| 11 | `pi_trial_prep` | PITrialPrepStep | Educational | `debt-hearing-prep-step.tsx` |
| 12 | `pi_post_resolution` | PIPostResolutionStep | Educational | `debt-post-judgment-step.tsx` |

**Educational step content highlights:**

- **`pi_medical_records`** — "What medical records to collect", "How to request records" (HIPAA authorization), "Organizing your medical timeline", "Maximum Medical Improvement (MMI) — when to send your demand"
- **`pi_insurance_communication`** — "Filing a claim", "What to say (and not say) to adjusters", "Recorded statements — your rights", "Common adjuster tactics". Warning: "Do not accept any settlement before completing medical treatment."
- **`pi_settlement_negotiation`** — "Evaluating the offer", "Writing a counter-offer", "When to accept vs. file suit", "Mediation". Tex. Ins. Code § 542 (15-day acknowledgment, 15-business-day accept/deny).
- **`pi_file_with_court`** — Filing fees, e-filing, court selection. 2-year SOL deadline warning.
- **`pi_serve_defendant`** — Process server or constable, service on insurance company's registered agent, certificate of service.
- **`pi_trial_prep`** — What to bring, presenting damages, direct examination outline, cross-examination tips.
- **`pi_post_resolution`** — "If you settled" (release, check timeline, lien resolution), "If you won" (collecting judgment, 5% post-judgment interest), "If you lost" (30-day appeal), "Tax implications" (IRC § 104(a)(2)).

**Transitions:** welcome → pi_intake → pi_medical_records → evidence_vault → pi_insurance_communication → prepare_pi_demand_letter → pi_settlement_negotiation → prepare_pi_petition → pi_file_with_court → pi_serve_defendant → pi_trial_prep → pi_post_resolution

---

## Section 6: Testing Strategy

**Unit tests:**

| Test File | What's Tested | Count |
|-----------|---------------|-------|
| `tests/unit/rules/pi-demand-letter-prompts.test.ts` | Schema validation, prompt builder, DRAFT disclaimer, insurance carrier, itemized damages, 30-day deadline, Tex. Ins. Code § 542, medical providers | ~20 |
| `tests/unit/rules/pi-petition-prompts.test.ts` | Schema validation, court caption, negligence section, sub-type theories (4 tests), damages prayer, jury demand, prior demand reference | ~18 |
| `tests/unit/rules/pi-settlement-prompts.test.ts` | Schema validation, settlement amount, medical liens conditional, confidentiality conditional, DRAFT disclaimer, release language | ~12 |
| `tests/unit/schemas/case.test.ts` | pi_sub_type validation (accepts valid, rejects invalid) | +3 |

**Total new tests:** ~53

**Build verification:** `npx vitest run` + `npx next build` — all pass, no type errors.

**Edge cases:**

| Scenario | Behavior |
|----------|----------|
| Incident date > 2 years ago | SOL warning, schema still accepts |
| Incident date > 18 months ago | Amber warning with days remaining |
| $0 medical expenses | Pain & suffering = $0, calculator works |
| Slip & fall sub-type | Premises step shown, other_driver hidden |
| Product liability | Product step shown, strict liability theory |
| Dog bite | No conditional step, 10-step wizard |
| Settlement amount = $0 | Schema rejects — must be positive |
