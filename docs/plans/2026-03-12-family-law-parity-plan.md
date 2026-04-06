# Family Law Workflow Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give each of the 7 family sub-types (divorce, custody, child_support, visitation, spousal_support, protective_order, modification) its own fully namespaced task chain (~62 total tasks), with enriched intake, case_stage fast-forwarding, shared guided step configs, and sub-type-aware milestones.

**Architecture:** Fully namespaced task_keys per sub-type. Shared guided step config files use factory functions that adapt questions/guidance based on a `sub_type` parameter. Enriched intake collects sub-type-specific info plus `case_stage` for mid-case import. DB migration renames existing family tasks, creates 7 new unlock chains, and handles existing case data.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL triggers), React Server Components.

**Design Doc:** `docs/plans/2026-03-12-family-law-parity-design.md`

---

## Task Chains Reference

```
Divorce (12):       welcome → divorce_intake → divorce_safety_screening → divorce_evidence_vault → divorce_prepare_filing → divorce_file_with_court → divorce_serve_respondent → divorce_waiting_period → divorce_temporary_orders* → divorce_mediation* → divorce_property_division → divorce_final_orders
Custody (10):       welcome → custody_intake → custody_safety_screening → custody_evidence_vault → custody_prepare_filing → custody_file_with_court → custody_serve_respondent → custody_temporary_orders* → custody_mediation → custody_final_orders
Child Support (8):  welcome → child_support_intake → child_support_evidence_vault → child_support_prepare_filing → child_support_file_with_court → child_support_serve_respondent → child_support_temporary_orders* → child_support_final_orders
Visitation (9):     welcome → visitation_intake → visitation_safety_screening → visitation_evidence_vault → visitation_prepare_filing → visitation_file_with_court → visitation_serve_respondent → visitation_mediation → visitation_final_orders
Spousal Support (8): welcome → spousal_support_intake → spousal_support_evidence_vault → spousal_support_prepare_filing → spousal_support_file_with_court → spousal_support_serve_respondent → spousal_support_temporary_orders* → spousal_support_final_orders
Protective Order (6): welcome → po_intake → po_safety_screening → po_prepare_filing → po_file_with_court → po_hearing
Modification (9):   welcome → mod_intake → mod_evidence_vault → mod_existing_order_review → mod_prepare_filing → mod_file_with_court → mod_serve_respondent → mod_mediation* → mod_final_orders
```
`*` = skippable

---

## Task 1: Update workflow-phases.ts

**Files:**
- Modify: `src/lib/workflow-phases.ts:112-133` (replace `family` entry)

**Step 1: Replace the family workflow phases**

Open `src/lib/workflow-phases.ts`. Replace the entire `family: [...]` entry (lines 112-133) with 7 new sub-type entries. Keep all other dispute types unchanged.

```typescript
  divorce: [
    { label: 'Getting Started', taskKeys: ['welcome', 'divorce_intake', 'divorce_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['divorce_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['divorce_waiting_period', 'divorce_temporary_orders', 'divorce_mediation'] },
    { label: 'Resolution', taskKeys: ['divorce_property_division', 'divorce_final_orders'] },
  ],

  custody: [
    { label: 'Getting Started', taskKeys: ['welcome', 'custody_intake', 'custody_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['custody_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['custody_prepare_filing', 'custody_file_with_court', 'custody_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['custody_temporary_orders', 'custody_mediation'] },
    { label: 'Resolution', taskKeys: ['custody_final_orders'] },
  ],

  child_support: [
    { label: 'Getting Started', taskKeys: ['welcome', 'child_support_intake'] },
    { label: 'Building Your Case', taskKeys: ['child_support_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['child_support_prepare_filing', 'child_support_file_with_court', 'child_support_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['child_support_temporary_orders', 'child_support_final_orders'] },
  ],

  visitation: [
    { label: 'Getting Started', taskKeys: ['welcome', 'visitation_intake', 'visitation_safety_screening'] },
    { label: 'Building Your Case', taskKeys: ['visitation_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['visitation_prepare_filing', 'visitation_file_with_court', 'visitation_serve_respondent'] },
    { label: 'Pre-Trial', taskKeys: ['visitation_mediation'] },
    { label: 'Resolution', taskKeys: ['visitation_final_orders'] },
  ],

  spousal_support: [
    { label: 'Getting Started', taskKeys: ['welcome', 'spousal_support_intake'] },
    { label: 'Building Your Case', taskKeys: ['spousal_support_evidence_vault'] },
    { label: 'Filing & Service', taskKeys: ['spousal_support_prepare_filing', 'spousal_support_file_with_court', 'spousal_support_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['spousal_support_temporary_orders', 'spousal_support_final_orders'] },
  ],

  protective_order: [
    { label: 'Getting Started', taskKeys: ['welcome', 'po_intake', 'po_safety_screening'] },
    { label: 'Filing & Hearing', taskKeys: ['po_prepare_filing', 'po_file_with_court'] },
    { label: 'Resolution', taskKeys: ['po_hearing'] },
  ],

  modification: [
    { label: 'Getting Started', taskKeys: ['welcome', 'mod_intake'] },
    { label: 'Building Your Case', taskKeys: ['mod_evidence_vault', 'mod_existing_order_review'] },
    { label: 'Filing & Service', taskKeys: ['mod_prepare_filing', 'mod_file_with_court', 'mod_serve_respondent'] },
    { label: 'Resolution', taskKeys: ['mod_mediation', 'mod_final_orders'] },
  ],
```

**Step 2: Update the case dashboard to map family sub-types to phases**

The case dashboard currently looks up `WORKFLOW_PHASES[dispute_type]`. For family cases, we need it to look up by sub-type instead. Check `src/app/(authenticated)/case/[id]/page.tsx` — wherever it reads `WORKFLOW_PHASES[case.dispute_type]`, add logic:

```typescript
// If family, look up by sub-type from family_case_details
const phases = case.dispute_type === 'family'
  ? WORKFLOW_PHASES[familyDetails?.family_sub_type ?? 'divorce'] ?? WORKFLOW_PHASES['divorce']
  : WORKFLOW_PHASES[case.dispute_type] ?? []
```

This requires fetching `family_case_details` on the dashboard page (check if it's already fetched).

**Step 3: Verify build**

Run: `npx next build 2>&1 | tail -30`

Expected: May have TypeScript errors for missing switch cases (those will be added later). The workflow-phases file itself should compile.

---

## Task 2: Update SKIPPABLE_TASKS in workflow-sidebar.tsx

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx:16-33`

**Step 1: Replace the old family skippable entries with new ones**

In `src/components/case/workflow-sidebar.tsx`, update the `SKIPPABLE_TASKS` set. Remove the old generic entries `'temporary_orders'` and `'mediation'`. Add the 6 new family-specific skippable tasks:

```typescript
const SKIPPABLE_TASKS = new Set([
  'prepare_pi_demand_letter',
  'pi_settlement_negotiation',
  'pi_mediation',
  'prepare_demand_letter',
  'prepare_lt_demand_letter',
  'lt_negotiation',
  'lt_mediation',
  'preservation_letter',
  'contract_demand_letter',
  'contract_negotiation',
  'contract_mediation',
  'property_demand_letter',
  'property_negotiation',
  'other_demand_letter',
  'divorce_temporary_orders',
  'divorce_mediation',
  'custody_temporary_orders',
  'child_support_temporary_orders',
  'spousal_support_temporary_orders',
  'mod_mediation',
])
```

Note: `custody_mediation` and `visitation_mediation` are **NOT** skippable (mandatory §153.0071 TX Family Code).

---

## Task 3: Add step-guidance entries for all new family task_keys

**Files:**
- Modify: `src/lib/step-guidance.ts:792-846` (replace old family section)

**Step 1: Replace the `// --- Family ---` section**

Remove lines 792-846 (the old `family_intake`, `safety_screening`, `prepare_family_filing`, `waiting_period`, `temporary_orders`, `mediation`, `final_orders` entries). Replace with all new sub-type-specific entries. Pattern: each entry has `why`, `checklist`, optional `tip`.

```typescript
  // --- Family: Divorce ---
  divorce_intake: {
    why: 'Divorce details — marriage dates, children, property — shape every document and deadline in your case.',
    checklist: [
      'Marriage date and separation date',
      'Whether you have children together',
      'General overview of community property and debts',
      'County where you or your spouse has lived for at least 90 days',
    ],
    tip: 'Texas requires 6 months of state residency and 90 days of county residency before filing.',
  },
  divorce_safety_screening: {
    why: 'Your safety comes first. This screening helps identify if protective measures are needed.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  divorce_evidence_vault: {
    why: 'Organized evidence strengthens your case at every stage — from temporary orders to final decree.',
    checklist: [
      'Financial documents (tax returns, bank statements, pay stubs)',
      'Property records (deeds, titles, appraisals)',
      'Photos and communications relevant to the case',
    ],
    tip: 'Upload what you have now. You can always add more later.',
  },
  divorce_prepare_filing: {
    why: 'Your divorce petition establishes your claims. Getting the paperwork right avoids delays.',
    checklist: [
      'Financial information (income, debts, assets)',
      'Children\'s information (if applicable)',
      'Filing fee or fee waiver application',
    ],
  },
  divorce_file_with_court: {
    why: 'Filing officially starts your divorce case and sets legal deadlines in motion.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  divorce_serve_respondent: {
    why: 'Your spouse must be formally notified of the divorce filing before the case can proceed.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or constable',
    ],
    tip: 'If your spouse will sign a waiver of service, that can save time and money.',
  },
  divorce_waiting_period: {
    why: 'Texas requires a 60-day waiting period from filing before the court can finalize a divorce.',
    checklist: [
      'Mark the 60-day end date on your calendar',
      'Use this time to gather financial documents and prepare',
    ],
  },
  divorce_temporary_orders: {
    why: 'Temporary orders set the rules while your divorce is pending — custody, support, property use.',
    checklist: [
      'Current living and custody arrangements',
      'Monthly income and expenses',
      'Immediate concerns that need court attention',
    ],
  },
  divorce_mediation: {
    why: 'Mediation helps both sides reach agreement with a neutral third party. Courts often require it.',
    checklist: [
      'Your ideal outcome for each issue',
      'Your minimum acceptable terms',
      'All relevant financial documents',
    ],
  },
  divorce_property_division: {
    why: 'Texas is a community property state. This step helps you inventory and value marital assets and debts.',
    checklist: [
      'List of all community property (real estate, vehicles, accounts)',
      'List of separate property with proof of separate character',
      'Debt inventory with account balances',
      'Appraisals or valuations of major assets',
    ],
    tip: 'Property acquired during marriage is presumed community property. You must prove separate property with clear and convincing evidence.',
  },
  divorce_final_orders: {
    why: 'The final decree is the court\'s binding decision on property, custody, and support.',
    checklist: [
      'Proposed final decree prepared',
      'All financial documents gathered',
      'Hearing date scheduled (if needed)',
    ],
  },

  // --- Family: Custody ---
  custody_intake: {
    why: 'Custody details — children\'s ages, current arrangements, existing orders — shape your legal strategy.',
    checklist: [
      'Number and ages of children',
      'Current living arrangement',
      'Whether existing court orders affect custody',
      'County where the children have lived for at least 6 months',
    ],
    tip: 'Texas uses "best interest of the child" as the primary standard for custody decisions.',
  },
  custody_safety_screening: {
    why: 'Your safety and your children\'s safety come first. This screening helps identify protective measures.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  custody_evidence_vault: {
    why: 'Custody cases rely heavily on evidence of parenting involvement, stability, and the children\'s needs.',
    checklist: [
      'School records and report cards',
      'Medical records for children',
      'Photos showing your involvement in the children\'s lives',
      'Communications about custody arrangements',
    ],
  },
  custody_prepare_filing: {
    why: 'Your custody petition (SAPCR) establishes your requests for conservatorship and possession.',
    checklist: [
      'Children\'s information (names, DOB, current arrangements)',
      'Proposed custody schedule',
      'Filing fee or fee waiver application',
    ],
  },
  custody_file_with_court: {
    why: 'Filing officially starts your custody case. Family courts handle SAPCR (Suit Affecting Parent-Child Relationship) filings.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  custody_serve_respondent: {
    why: 'The other parent must be formally notified of the custody filing before the case can proceed.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or constable',
    ],
  },
  custody_temporary_orders: {
    why: 'Temporary custody orders protect the children while the case is pending.',
    checklist: [
      'Current custody and visitation arrangements',
      'Children\'s school and activity schedules',
      'Any immediate safety concerns',
    ],
  },
  custody_mediation: {
    why: 'Texas Family Code §153.0071 requires mediation in custody cases before trial. This is mandatory.',
    checklist: [
      'Your proposed custody schedule',
      'Children\'s needs and best interests',
      'Your minimum acceptable terms',
    ],
    tip: 'Mediation is required by Texas law in custody cases. Come prepared with a detailed proposed schedule.',
  },
  custody_final_orders: {
    why: 'The final custody order establishes conservatorship, possession schedule, and child support.',
    checklist: [
      'Proposed parenting plan / possession schedule',
      'Child support calculations',
      'Hearing date scheduled',
    ],
  },

  // --- Family: Child Support ---
  child_support_intake: {
    why: 'Child support is calculated based on income, number of children, and special needs. These details determine the correct amount.',
    checklist: [
      'Number of children requiring support',
      'Both parents\' employment status and income',
      'Whether an existing support order is in place',
      'Children\'s special needs (medical, educational)',
    ],
  },
  child_support_evidence_vault: {
    why: 'Income documentation is critical for child support calculations.',
    checklist: [
      'Recent pay stubs (both parents if available)',
      'Tax returns (last 2 years)',
      'Documentation of other income sources',
      'Children\'s expense records (medical, childcare, activities)',
    ],
  },
  child_support_prepare_filing: {
    why: 'Your child support petition must include income information and the proposed support amount.',
    checklist: [
      'Income documentation gathered',
      'Child support calculation worksheet',
      'Filing fee or fee waiver application',
    ],
  },
  child_support_file_with_court: {
    why: 'Filing officially starts your child support case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  child_support_serve_respondent: {
    why: 'The other parent must be formally notified of the child support filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  child_support_temporary_orders: {
    why: 'Temporary child support orders ensure the children are financially supported while the case is pending.',
    checklist: [
      'Both parents\' current income documentation',
      'Children\'s monthly expenses',
      'Childcare and medical insurance costs',
    ],
  },
  child_support_final_orders: {
    why: 'The final child support order sets the ongoing support amount and wage withholding.',
    checklist: [
      'Updated income documentation',
      'Child support calculation worksheet',
      'Proposed wage withholding order',
    ],
    tip: 'Texas child support is typically 20% of net resources for one child, 25% for two, up to 40% for five or more.',
  },

  // --- Family: Visitation ---
  visitation_intake: {
    why: 'Visitation details help us craft a schedule that serves the children\'s best interests.',
    checklist: [
      'Number and ages of children',
      'Current custody arrangement',
      'Your relationship to the children (parent, grandparent, etc.)',
      'Any existing court orders',
    ],
  },
  visitation_safety_screening: {
    why: 'Your safety and your children\'s safety come first.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  visitation_evidence_vault: {
    why: 'Evidence of your relationship with the children and involvement in their lives strengthens your case.',
    checklist: [
      'Photos showing your relationship with the children',
      'Communications about visitation arrangements',
      'Records of your involvement (school events, activities)',
    ],
  },
  visitation_prepare_filing: {
    why: 'Your visitation petition requests a specific possession schedule.',
    checklist: [
      'Proposed visitation schedule',
      'Children\'s school and activity schedules',
      'Filing fee or fee waiver application',
    ],
  },
  visitation_file_with_court: {
    why: 'Filing officially starts your visitation case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  visitation_serve_respondent: {
    why: 'The other party must be formally notified of the visitation filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  visitation_mediation: {
    why: 'Texas Family Code §153.0071 requires mediation in visitation cases before trial. This is mandatory.',
    checklist: [
      'Your proposed visitation schedule',
      'Children\'s needs and best interests',
      'Your minimum acceptable terms',
    ],
    tip: 'Mediation is required by Texas law. Come prepared with a detailed proposed schedule.',
  },
  visitation_final_orders: {
    why: 'The final visitation order establishes the possession and access schedule.',
    checklist: [
      'Proposed possession schedule',
      'Holiday and summer schedule',
      'Hearing date scheduled',
    ],
  },

  // --- Family: Spousal Support ---
  spousal_support_intake: {
    why: 'Spousal support eligibility depends on marriage duration, income disparity, and other factors.',
    checklist: [
      'Marriage date and anticipated end date',
      'Marriage duration',
      'Both spouses\' employment status and income',
      'Any disability or health concerns',
    ],
    tip: 'Texas spousal maintenance is typically limited to marriages of 10+ years, unless there are special circumstances (family violence, disability).',
  },
  spousal_support_evidence_vault: {
    why: 'Financial documentation proves the need for (or ability to pay) spousal support.',
    checklist: [
      'Income documentation for both spouses',
      'Monthly living expenses',
      'Education and employment history',
      'Medical records (if disability is a factor)',
    ],
  },
  spousal_support_prepare_filing: {
    why: 'Your spousal support petition must demonstrate eligibility and the requested amount.',
    checklist: [
      'Income and expense documentation',
      'Marriage duration documentation',
      'Filing fee or fee waiver application',
    ],
  },
  spousal_support_file_with_court: {
    why: 'Filing officially starts your spousal support case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  spousal_support_serve_respondent: {
    why: 'Your spouse must be formally notified of the support filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  spousal_support_temporary_orders: {
    why: 'Temporary spousal support ensures financial stability while the case is pending.',
    checklist: [
      'Both spouses\' current income',
      'Monthly expenses and financial needs',
      'Existing financial obligations',
    ],
  },
  spousal_support_final_orders: {
    why: 'The final support order sets the amount, duration, and terms of spousal maintenance.',
    checklist: [
      'Updated income documentation',
      'Proposed support amount and duration',
      'Hearing date scheduled',
    ],
    tip: 'Texas caps spousal maintenance at $5,000/month or 20% of the obligor\'s average monthly gross income, whichever is less.',
  },

  // --- Family: Protective Order ---
  po_intake: {
    why: 'Protective order details help us prepare your application and assess urgency.',
    checklist: [
      'Your relationship to the respondent',
      'Type of abuse or violence experienced',
      'Whether you are in immediate danger',
      'Any prior incidents or existing orders',
    ],
    tip: 'If you are in immediate danger, call 911. The National DV Hotline is 1-800-799-7233.',
  },
  po_safety_screening: {
    why: 'This screening helps assess the level of danger and determine if an emergency protective order is needed.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'If you need immediate protection, you can request an emergency ex parte order (without the other party present).',
  },
  po_prepare_filing: {
    why: 'Your protective order application must detail the abuse and the protections you need.',
    checklist: [
      'Specific dates and descriptions of abuse incidents',
      'Names of witnesses',
      'Photos or documentation of injuries',
      'Filing fee waiver application (PO filings are free in Texas)',
    ],
  },
  po_file_with_court: {
    why: 'Filing your protective order application starts the court process. The court may grant a temporary ex parte order the same day.',
    checklist: [
      'Your prepared application',
      'Government-issued ID',
      'Safety plan in place',
    ],
    tip: 'There is no filing fee for protective orders in Texas. The court handles service to the respondent.',
  },
  po_hearing: {
    why: 'The full protective order hearing occurs within 14 days of filing. The court decides whether to grant a 2-year order.',
    checklist: [
      'All evidence of abuse (photos, messages, medical records)',
      'Witness availability',
      'Government-issued ID',
      'Arrive early and check in with the court coordinator',
    ],
    tip: 'The respondent has a right to be present and contest the order. Focus on specific incidents and evidence.',
  },

  // --- Family: Modification ---
  mod_intake: {
    why: 'Modification requires showing a material and substantial change in circumstances since the last order.',
    checklist: [
      'Existing order court and cause number',
      'What you want to modify (custody, support, visitation)',
      'Description of the change in circumstances',
    ],
    tip: 'Texas law requires a "material and substantial change" or that the order was entered more than 3 years ago (for support).',
  },
  mod_evidence_vault: {
    why: 'Evidence of changed circumstances is the foundation of your modification case.',
    checklist: [
      'Copy of the existing court order',
      'Documentation of changed circumstances',
      'Updated financial information (if modifying support)',
    ],
  },
  mod_existing_order_review: {
    why: 'Understanding your existing order helps identify exactly what to modify and what legal standard applies.',
    checklist: [
      'Upload or review your existing court order',
      'List the specific provisions you want to change',
      'Document the change in circumstances for each provision',
    ],
  },
  mod_prepare_filing: {
    why: 'Your modification petition must specify what changed and what new terms you\'re requesting.',
    checklist: [
      'Existing order details (court, cause number)',
      'Proposed changes and supporting evidence',
      'Filing fee or fee waiver application',
    ],
  },
  mod_file_with_court: {
    why: 'Filing officially starts your modification case. It should be filed in the court that issued the original order.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
    tip: 'Modifications are usually filed in the same court that issued the original order.',
  },
  mod_serve_respondent: {
    why: 'The other party must be formally notified of the modification filing.',
    checklist: [
      'Respondent\'s current address for service',
      'Budget for process server or certified mail',
    ],
  },
  mod_mediation: {
    why: 'Mediation can resolve modification disputes without the cost and uncertainty of a hearing.',
    checklist: [
      'Your proposed modified terms',
      'Evidence of changed circumstances',
      'Your minimum acceptable terms',
    ],
  },
  mod_final_orders: {
    why: 'The modified order replaces the relevant provisions of the original order.',
    checklist: [
      'Proposed modified order prepared',
      'All evidence of changed circumstances',
      'Hearing date scheduled',
    ],
  },
```

**Step 2: Verify build**

Run: `npx next build 2>&1 | tail -30`

---

## Task 4: Update milestones.ts with 7 sub-type-specific milestone arrays

**Files:**
- Modify: `src/lib/rules/milestones.ts:568-661` (replace `FAMILY_MILESTONES`)
- Modify: `src/lib/rules/milestones.ts:788-799` (update dispatch map)
- Modify: `src/lib/rules/milestones.ts:807-808` (update `getMilestones` signature)

**Step 1: Replace FAMILY_MILESTONES with 7 arrays**

Replace lines 568-661 with:

```typescript
// -- Divorce Milestones -------------------------------------------------------

const DIVORCE_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my divorce case.',
    firstUnlockedTask: 'divorce_file_with_court',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served my spouse.',
    firstUnlockedTask: 'divorce_waiting_period',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
      'divorce_file_with_court', 'divorce_serve_respondent',
    ],
  },
  {
    id: 'waiting_period',
    label: 'In waiting period',
    description: 'I\'m in the 60-day waiting period.',
    firstUnlockedTask: 'divorce_temporary_orders',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
      'divorce_file_with_court', 'divorce_serve_respondent',
      'divorce_waiting_period',
    ],
  },
  {
    id: 'temporary_orders',
    label: 'Temporary orders',
    description: 'I\'m dealing with temporary orders.',
    firstUnlockedTask: 'divorce_mediation',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
      'divorce_file_with_court', 'divorce_serve_respondent',
      'divorce_waiting_period', 'divorce_temporary_orders',
    ],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'divorce_property_division',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
      'divorce_file_with_court', 'divorce_serve_respondent',
      'divorce_waiting_period', 'divorce_temporary_orders',
      'divorce_mediation',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'divorce_final_orders',
    tasksToSkip: [
      'welcome', 'divorce_intake', 'divorce_safety_screening',
      'divorce_evidence_vault', 'divorce_prepare_filing',
      'divorce_file_with_court', 'divorce_serve_respondent',
      'divorce_waiting_period', 'divorce_temporary_orders',
      'divorce_mediation', 'divorce_property_division',
    ],
  },
]

// -- Custody Milestones -------------------------------------------------------

const CUSTODY_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my custody case.',
    firstUnlockedTask: 'custody_file_with_court',
    tasksToSkip: [
      'welcome', 'custody_intake', 'custody_safety_screening',
      'custody_evidence_vault', 'custody_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other parent.',
    firstUnlockedTask: 'custody_temporary_orders',
    tasksToSkip: [
      'welcome', 'custody_intake', 'custody_safety_screening',
      'custody_evidence_vault', 'custody_prepare_filing',
      'custody_file_with_court', 'custody_serve_respondent',
    ],
  },
  {
    id: 'temporary_orders',
    label: 'Temporary orders',
    description: 'I\'m dealing with temporary orders.',
    firstUnlockedTask: 'custody_mediation',
    tasksToSkip: [
      'welcome', 'custody_intake', 'custody_safety_screening',
      'custody_evidence_vault', 'custody_prepare_filing',
      'custody_file_with_court', 'custody_serve_respondent',
      'custody_temporary_orders',
    ],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'custody_final_orders',
    tasksToSkip: [
      'welcome', 'custody_intake', 'custody_safety_screening',
      'custody_evidence_vault', 'custody_prepare_filing',
      'custody_file_with_court', 'custody_serve_respondent',
      'custody_temporary_orders', 'custody_mediation',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'custody_final_orders',
    tasksToSkip: [
      'welcome', 'custody_intake', 'custody_safety_screening',
      'custody_evidence_vault', 'custody_prepare_filing',
      'custody_file_with_court', 'custody_serve_respondent',
      'custody_temporary_orders', 'custody_mediation',
    ],
  },
]

// -- Child Support Milestones -------------------------------------------------

const CHILD_SUPPORT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my child support case.',
    firstUnlockedTask: 'child_support_file_with_court',
    tasksToSkip: [
      'welcome', 'child_support_intake',
      'child_support_evidence_vault', 'child_support_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other parent.',
    firstUnlockedTask: 'child_support_temporary_orders',
    tasksToSkip: [
      'welcome', 'child_support_intake',
      'child_support_evidence_vault', 'child_support_prepare_filing',
      'child_support_file_with_court', 'child_support_serve_respondent',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'child_support_final_orders',
    tasksToSkip: [
      'welcome', 'child_support_intake',
      'child_support_evidence_vault', 'child_support_prepare_filing',
      'child_support_file_with_court', 'child_support_serve_respondent',
      'child_support_temporary_orders',
    ],
  },
]

// -- Visitation Milestones ----------------------------------------------------

const VISITATION_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my visitation case.',
    firstUnlockedTask: 'visitation_file_with_court',
    tasksToSkip: [
      'welcome', 'visitation_intake', 'visitation_safety_screening',
      'visitation_evidence_vault', 'visitation_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party.',
    firstUnlockedTask: 'visitation_mediation',
    tasksToSkip: [
      'welcome', 'visitation_intake', 'visitation_safety_screening',
      'visitation_evidence_vault', 'visitation_prepare_filing',
      'visitation_file_with_court', 'visitation_serve_respondent',
    ],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'visitation_final_orders',
    tasksToSkip: [
      'welcome', 'visitation_intake', 'visitation_safety_screening',
      'visitation_evidence_vault', 'visitation_prepare_filing',
      'visitation_file_with_court', 'visitation_serve_respondent',
      'visitation_mediation',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'visitation_final_orders',
    tasksToSkip: [
      'welcome', 'visitation_intake', 'visitation_safety_screening',
      'visitation_evidence_vault', 'visitation_prepare_filing',
      'visitation_file_with_court', 'visitation_serve_respondent',
      'visitation_mediation',
    ],
  },
]

// -- Spousal Support Milestones -----------------------------------------------

const SPOUSAL_SUPPORT_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my spousal support case.',
    firstUnlockedTask: 'spousal_support_file_with_court',
    tasksToSkip: [
      'welcome', 'spousal_support_intake',
      'spousal_support_evidence_vault', 'spousal_support_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served my spouse.',
    firstUnlockedTask: 'spousal_support_temporary_orders',
    tasksToSkip: [
      'welcome', 'spousal_support_intake',
      'spousal_support_evidence_vault', 'spousal_support_prepare_filing',
      'spousal_support_file_with_court', 'spousal_support_serve_respondent',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on final orders.',
    firstUnlockedTask: 'spousal_support_final_orders',
    tasksToSkip: [
      'welcome', 'spousal_support_intake',
      'spousal_support_evidence_vault', 'spousal_support_prepare_filing',
      'spousal_support_file_with_court', 'spousal_support_serve_respondent',
      'spousal_support_temporary_orders',
    ],
  },
]

// -- Protective Order Milestones ----------------------------------------------

const PROTECTIVE_ORDER_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my protective order application.',
    firstUnlockedTask: 'po_hearing',
    tasksToSkip: [
      'welcome', 'po_intake', 'po_safety_screening',
      'po_prepare_filing', 'po_file_with_court',
    ],
  },
]

// -- Modification Milestones --------------------------------------------------

const MODIFICATION_MILESTONES: Milestone[] = [
  {
    id: 'start',
    label: 'Just getting started',
    description: 'I haven\'t filed anything yet.',
    firstUnlockedTask: 'welcome',
    tasksToSkip: [],
  },
  {
    id: 'filed',
    label: 'Filed with court',
    description: 'I\'ve filed my modification.',
    firstUnlockedTask: 'mod_file_with_court',
    tasksToSkip: [
      'welcome', 'mod_intake', 'mod_evidence_vault',
      'mod_existing_order_review', 'mod_prepare_filing',
    ],
  },
  {
    id: 'served',
    label: 'Served the other party',
    description: 'I\'ve served the other party.',
    firstUnlockedTask: 'mod_mediation',
    tasksToSkip: [
      'welcome', 'mod_intake', 'mod_evidence_vault',
      'mod_existing_order_review', 'mod_prepare_filing',
      'mod_file_with_court', 'mod_serve_respondent',
    ],
  },
  {
    id: 'mediation',
    label: 'In mediation',
    description: 'I\'m in mediation.',
    firstUnlockedTask: 'mod_final_orders',
    tasksToSkip: [
      'welcome', 'mod_intake', 'mod_evidence_vault',
      'mod_existing_order_review', 'mod_prepare_filing',
      'mod_file_with_court', 'mod_serve_respondent',
      'mod_mediation',
    ],
  },
  {
    id: 'final',
    label: 'Final orders',
    description: 'I\'m working on the modified order.',
    firstUnlockedTask: 'mod_final_orders',
    tasksToSkip: [
      'welcome', 'mod_intake', 'mod_evidence_vault',
      'mod_existing_order_review', 'mod_prepare_filing',
      'mod_file_with_court', 'mod_serve_respondent',
      'mod_mediation',
    ],
  },
]
```

**Step 2: Update dispatch map**

Replace `family: FAMILY_MILESTONES` with 7 entries:

```typescript
const MILESTONES_BY_TYPE: Record<string, Milestone[]> = {
  contract: CONTRACT_MILESTONES,
  property: PROPERTY_MILESTONES,
  other: OTHER_MILESTONES,
  personal_injury: PERSONAL_INJURY_MILESTONES,
  debt_collection: DEBT_DEFENSE_MILESTONES,
  small_claims: SMALL_CLAIMS_MILESTONES,
  divorce: DIVORCE_MILESTONES,
  custody: CUSTODY_MILESTONES,
  child_support: CHILD_SUPPORT_MILESTONES,
  visitation: VISITATION_MILESTONES,
  spousal_support: SPOUSAL_SUPPORT_MILESTONES,
  protective_order: PROTECTIVE_ORDER_MILESTONES,
  modification: MODIFICATION_MILESTONES,
  landlord_tenant: LANDLORD_TENANT_MILESTONES,
}
```

**Step 3: Add optional familySubType parameter to getMilestones**

The dispute_type in the DB is still `'family'` for all sub-types. The `getMilestones` function needs to accept a second parameter for the sub-type:

```typescript
export function getMilestones(disputeType: DisputeType, familySubType?: string): Milestone[] {
  if (disputeType === 'family' && familySubType) {
    return MILESTONES_BY_TYPE[familySubType] ?? DIVORCE_MILESTONES
  }
  return MILESTONES_BY_TYPE[disputeType] ?? CIVIL_MILESTONES
}
```

Update `getTasksToSkip` and `getMilestoneByID` similarly to pass through `familySubType`.

**Step 4: Verify build**

Run: `npx next build 2>&1 | tail -30`

---

## Task 5: Create shared guided step config — family-intake-factory.ts

**Files:**
- Create: `src/lib/guided-steps/family/family-intake-factory.ts`

**Step 1: Create the intake factory**

This factory returns a `GuidedStepConfig` customized per sub-type. It collects shared fields (county, case_stage, contested) plus sub-type-specific fields.

```typescript
import type { GuidedStepConfig, QuestionDef } from '../types'

type FamilySubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'

const CASE_STAGE_OPTIONS: Record<FamilySubType, { value: string; label: string }[]> = {
  divorce: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'waiting_period', label: 'In the 60-day waiting period' },
    { value: 'temporary_orders', label: 'Dealing with temporary orders' },
    { value: 'mediation', label: 'In mediation' },
  ],
  custody: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'temporary_orders', label: 'Dealing with temporary orders' },
    { value: 'mediation', label: 'In mediation' },
  ],
  child_support: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
  ],
  visitation: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'mediation', label: 'In mediation' },
  ],
  spousal_support: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
  ],
  protective_order: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
  ],
  modification: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'mediation', label: 'In mediation' },
  ],
}

const SUB_TYPE_QUESTIONS: Record<FamilySubType, QuestionDef[]> = {
  divorce: [
    { id: 'marriage_date', type: 'text', prompt: 'When did you get married?', placeholder: 'e.g., June 2015' },
    { id: 'separation_date', type: 'text', prompt: 'When did you separate?', placeholder: 'e.g., January 2026' },
    { id: 'has_children', type: 'yes_no', prompt: 'Do you have children together?' },
    { id: 'has_community_property', type: 'yes_no', prompt: 'Do you own property or have significant debts together?' },
  ],
  custody: [
    { id: 'num_children', type: 'text', prompt: 'How many children are involved?', placeholder: 'e.g., 2' },
    { id: 'current_arrangement', type: 'single_choice', prompt: 'What is the current living arrangement?', options: [
      { value: 'with_me', label: 'Children live with me' },
      { value: 'with_other', label: 'Children live with the other parent' },
      { value: 'shared', label: 'Shared between both parents' },
      { value: 'other', label: 'Other arrangement' },
    ]},
    { id: 'existing_orders', type: 'yes_no', prompt: 'Are there existing court orders affecting custody?' },
  ],
  child_support: [
    { id: 'num_children', type: 'text', prompt: 'How many children need support?', placeholder: 'e.g., 2' },
    { id: 'employment_status', type: 'single_choice', prompt: 'What is your employment status?', options: [
      { value: 'employed_full', label: 'Employed full-time' },
      { value: 'employed_part', label: 'Employed part-time' },
      { value: 'self_employed', label: 'Self-employed' },
      { value: 'unemployed', label: 'Unemployed' },
    ]},
    { id: 'existing_support_order', type: 'yes_no', prompt: 'Is there an existing child support order?' },
  ],
  visitation: [
    { id: 'num_children', type: 'text', prompt: 'How many children are involved?', placeholder: 'e.g., 2' },
    { id: 'current_custody', type: 'single_choice', prompt: 'What is the current custody arrangement?', options: [
      { value: 'other_parent', label: 'Other parent has primary custody' },
      { value: 'shared', label: 'Shared custody' },
      { value: 'no_order', label: 'No formal custody order' },
    ]},
    { id: 'relationship', type: 'single_choice', prompt: 'What is your relationship to the children?', options: [
      { value: 'parent', label: 'Parent' },
      { value: 'grandparent', label: 'Grandparent' },
      { value: 'other_relative', label: 'Other relative' },
    ]},
  ],
  spousal_support: [
    { id: 'marriage_date', type: 'text', prompt: 'When did you get married?', placeholder: 'e.g., June 2010' },
    { id: 'marriage_duration', type: 'single_choice', prompt: 'How long have you been married?', options: [
      { value: 'under_10', label: 'Less than 10 years' },
      { value: '10_to_20', label: '10 to 20 years' },
      { value: '20_to_30', label: '20 to 30 years' },
      { value: 'over_30', label: 'More than 30 years' },
    ]},
    { id: 'employment_status', type: 'single_choice', prompt: 'What is your employment status?', options: [
      { value: 'employed_full', label: 'Employed full-time' },
      { value: 'employed_part', label: 'Employed part-time' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'disabled', label: 'Unable to work due to disability' },
    ]},
  ],
  protective_order: [
    { id: 'relationship_to_respondent', type: 'single_choice', prompt: 'What is your relationship to the person you need protection from?', options: [
      { value: 'spouse', label: 'Spouse or ex-spouse' },
      { value: 'partner', label: 'Dating partner or ex-partner' },
      { value: 'family_member', label: 'Family member' },
      { value: 'household_member', label: 'Household member' },
    ]},
    { id: 'type_of_abuse', type: 'single_choice', prompt: 'What type of abuse have you experienced?', options: [
      { value: 'physical', label: 'Physical violence' },
      { value: 'threat', label: 'Threats of violence' },
      { value: 'sexual', label: 'Sexual assault' },
      { value: 'stalking', label: 'Stalking' },
      { value: 'multiple', label: 'Multiple types' },
    ]},
    { id: 'immediate_danger', type: 'yes_no', prompt: 'Are you in immediate danger right now?' },
    { id: 'immediate_danger_info', type: 'info', prompt: 'If you are in immediate danger, call 911 now. You can also contact the National Domestic Violence Hotline at 1-800-799-7233.', showIf: (a) => a.immediate_danger === 'yes' },
  ],
  modification: [
    { id: 'existing_court', type: 'text', prompt: 'Which court issued the existing order?', placeholder: 'e.g., 256th District Court, Dallas County' },
    { id: 'cause_number', type: 'text', prompt: 'What is the cause number of the existing order?', placeholder: 'e.g., DF-2024-12345' },
    { id: 'what_to_modify', type: 'single_choice', prompt: 'What do you want to modify?', options: [
      { value: 'custody', label: 'Custody / conservatorship' },
      { value: 'visitation', label: 'Visitation / possession schedule' },
      { value: 'child_support', label: 'Child support amount' },
      { value: 'multiple', label: 'Multiple provisions' },
    ]},
    { id: 'change_circumstances', type: 'text', prompt: 'Briefly describe the change in circumstances.', placeholder: 'e.g., I got a new job and relocated...' },
  ],
}

const TITLES: Record<FamilySubType, string> = {
  divorce: 'Divorce Intake',
  custody: 'Custody Intake',
  child_support: 'Child Support Intake',
  visitation: 'Visitation Intake',
  spousal_support: 'Spousal Support Intake',
  protective_order: 'Protective Order Intake',
  modification: 'Modification Intake',
}

const REASSURANCES: Record<FamilySubType, string> = {
  divorce: 'These details help us tailor your divorce case. Take your time — accuracy matters more than speed.',
  custody: 'Understanding your family situation helps us guide you to the right custody arrangement.',
  child_support: 'These details help us calculate appropriate support and guide you through the process.',
  visitation: 'Understanding your situation helps us craft a visitation schedule that serves the children\'s best interests.',
  spousal_support: 'These details help us assess spousal support eligibility and guide your case.',
  protective_order: 'Your safety is our top priority. These details help us prepare the strongest possible application.',
  modification: 'Understanding the existing order and what changed helps us build a strong modification case.',
}

export function createFamilyIntakeConfig(subType: FamilySubType): GuidedStepConfig {
  const questions: QuestionDef[] = [
    {
      id: 'county',
      type: 'text',
      prompt: 'Which Texas county will you file in?',
      helpText: 'Family cases are usually filed where you or the other party has lived for at least 90 days.',
      placeholder: 'e.g., Harris County',
    },
    {
      id: 'case_stage',
      type: 'single_choice',
      prompt: 'Where are you in the process?',
      helpText: 'If you\'ve already started your case, we can skip ahead to where you are.',
      options: CASE_STAGE_OPTIONS[subType],
    },
    ...(subType !== 'protective_order' ? [{
      id: 'contested',
      type: 'single_choice' as const,
      prompt: 'Is this contested or uncontested?',
      helpText: 'Uncontested means both parties agree on the terms. Contested means there are disagreements that the court will need to resolve.',
      options: [
        { value: 'contested', label: 'Contested — we disagree on terms' },
        { value: 'uncontested', label: 'Uncontested — we agree on terms' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    }] : []),
    ...SUB_TYPE_QUESTIONS[subType],
  ]

  return {
    title: TITLES[subType],
    reassurance: REASSURANCES[subType],
    questions,
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.county) {
        items.push({ status: 'done', text: `Filing county: ${answers.county}` })
      } else {
        items.push({ status: 'needed', text: 'Determine which county to file in.' })
      }

      if (answers.case_stage && answers.case_stage !== 'start') {
        items.push({ status: 'info', text: `Case stage: ${answers.case_stage}. We\'ll skip ahead to where you are.` })
      }

      if (answers.contested === 'uncontested') {
        items.push({ status: 'info', text: 'Uncontested case — this typically moves faster.' })
      } else if (answers.contested === 'contested') {
        items.push({ status: 'info', text: 'Contested case — prepare for a more involved process.' })
      }

      // Sub-type-specific summary items
      if (subType === 'protective_order' && answers.immediate_danger === 'yes') {
        items.push({ status: 'needed', text: 'URGENT: You indicated immediate danger. Call 911 or the DV Hotline: 1-800-799-7233.' })
      }

      if (subType === 'modification' && answers.cause_number) {
        items.push({ status: 'done', text: `Existing order cause number: ${answers.cause_number}` })
      }

      items.push({ status: 'info', text: 'Your intake is complete. The next steps are tailored to your specific situation.' })

      return items
    },
  }
}
```

---

## Task 6: Create shared guided step configs (8 files)

**Files to create (all in `src/lib/guided-steps/family/`):**
- `family-safety-screening.ts`
- `family-evidence-vault.ts`
- `family-file-with-court.ts`
- `family-serve-respondent.ts`
- `family-prepare-filing.ts`
- `family-property-division.ts`
- `family-existing-order-review.ts`
- `po-hearing.ts`

Each file follows the `GuidedStepConfig` pattern. Create each file with sub-type-aware content. Use the existing `temporary-orders.ts`, `mediation.ts`, `waiting-period.ts`, `final-orders.ts` as patterns.

### 6a: family-safety-screening.ts

Shared DV screening for divorce, custody, visitation, protective_order. PO gets stronger "file immediately" guidance.

```typescript
import type { GuidedStepConfig } from '../types'

type SafetySubType = 'divorce' | 'custody' | 'visitation' | 'protective_order'

export function createSafetyScreeningConfig(subType: SafetySubType): GuidedStepConfig {
  return {
    title: 'Safety Screening',
    reassurance: 'Your safety comes first. This confidential screening helps us identify if any protective measures are needed.',
    questions: [
      {
        id: 'physical_violence',
        type: 'yes_no',
        prompt: 'Has the other party ever been physically violent toward you or your children?',
      },
      {
        id: 'threats',
        type: 'yes_no',
        prompt: 'Has the other party made threats of violence or harm?',
      },
      {
        id: 'controlling_behavior',
        type: 'yes_no',
        prompt: 'Does the other party control your finances, movements, or communications?',
      },
      {
        id: 'safety_plan_info',
        type: 'info',
        prompt: subType === 'protective_order'
          ? 'Based on your responses, filing for a protective order is the right step. The court can grant an emergency ex parte order the same day you file. There is no filing fee.'
          : 'If you answered yes to any question, consider requesting a protective order. The National DV Hotline is 1-800-799-7233. You can also request the court to keep your address confidential.',
        showIf: (a) => a.physical_violence === 'yes' || a.threats === 'yes' || a.controlling_behavior === 'yes',
      },
      {
        id: 'safe_info',
        type: 'info',
        prompt: 'No safety concerns identified. If your situation changes at any time, you can request protective measures.',
        showIf: (a) => a.physical_violence === 'no' && a.threats === 'no' && a.controlling_behavior === 'no',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
      const hasConcerns = answers.physical_violence === 'yes' || answers.threats === 'yes' || answers.controlling_behavior === 'yes'

      if (hasConcerns) {
        items.push({ status: 'needed', text: 'Safety concerns identified. Consider protective measures.' })
        if (subType === 'protective_order') {
          items.push({ status: 'needed', text: 'File your protective order application as soon as possible.' })
        } else {
          items.push({ status: 'info', text: 'National DV Hotline: 1-800-799-7233.' })
        }
      } else {
        items.push({ status: 'done', text: 'No immediate safety concerns identified.' })
      }

      items.push({ status: 'info', text: 'Safety screening complete. Your answers are confidential.' })
      return items
    },
  }
}
```

### 6b: family-evidence-vault.ts

Sub-type-aware evidence checklist.

```typescript
import type { GuidedStepConfig, QuestionDef } from '../types'

type EvidenceSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

const EVIDENCE_ITEMS: Record<EvidenceSubType, QuestionDef[]> = {
  divorce: [
    { id: 'financial_docs', type: 'yes_no', prompt: 'Have you gathered financial documents (tax returns, bank statements, pay stubs)?' },
    { id: 'property_docs', type: 'yes_no', prompt: 'Do you have property records (deeds, titles, mortgage statements)?' },
    { id: 'debt_docs', type: 'yes_no', prompt: 'Have you documented debts and liabilities?' },
  ],
  custody: [
    { id: 'school_records', type: 'yes_no', prompt: 'Do you have the children\'s school records?' },
    { id: 'medical_records', type: 'yes_no', prompt: 'Do you have the children\'s medical records?' },
    { id: 'involvement_evidence', type: 'yes_no', prompt: 'Do you have evidence of your parenting involvement (photos, activity records)?' },
  ],
  child_support: [
    { id: 'income_docs', type: 'yes_no', prompt: 'Have you gathered income documentation (pay stubs, tax returns)?' },
    { id: 'expense_docs', type: 'yes_no', prompt: 'Have you documented the children\'s expenses (childcare, medical, activities)?' },
    { id: 'other_income', type: 'yes_no', prompt: 'Have you documented any other income sources for either parent?' },
  ],
  visitation: [
    { id: 'relationship_evidence', type: 'yes_no', prompt: 'Do you have photos or records showing your relationship with the children?' },
    { id: 'communication_records', type: 'yes_no', prompt: 'Do you have records of communication about visitation?' },
  ],
  spousal_support: [
    { id: 'income_docs', type: 'yes_no', prompt: 'Have you gathered income documentation for both spouses?' },
    { id: 'expense_docs', type: 'yes_no', prompt: 'Have you documented monthly living expenses?' },
    { id: 'employment_history', type: 'yes_no', prompt: 'Do you have education and employment history documentation?' },
  ],
  modification: [
    { id: 'existing_order', type: 'yes_no', prompt: 'Do you have a copy of the existing court order?' },
    { id: 'change_evidence', type: 'yes_no', prompt: 'Have you gathered evidence of the changed circumstances?' },
    { id: 'updated_financials', type: 'yes_no', prompt: 'Do you have updated financial information (if modifying support)?' },
  ],
}

export function createEvidenceVaultConfig(subType: EvidenceSubType): GuidedStepConfig {
  return {
    title: 'Organize Your Evidence',
    reassurance: 'Well-organized evidence strengthens your case at every stage. Upload what you have now — you can always add more later.',
    questions: [
      { id: 'general_docs', type: 'yes_no', prompt: 'Do you have any written communications with the other party (texts, emails)?' },
      ...EVIDENCE_ITEMS[subType],
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
      const allQuestions = ['general_docs', ...EVIDENCE_ITEMS[subType].map(q => q.id)]

      for (const qId of allQuestions) {
        const q = [{ id: 'general_docs', prompt: 'Written communications' }, ...EVIDENCE_ITEMS[subType]].find(q => q.id === qId)
        if (answers[qId] === 'yes') {
          items.push({ status: 'done', text: `${q?.prompt?.replace(/^(Have you gathered |Do you have )/, '').replace(/\?$/, '') ?? qId} — gathered.` })
        } else if (answers[qId] === 'no') {
          items.push({ status: 'needed', text: `${q?.prompt?.replace(/^(Have you gathered |Do you have )/, '').replace(/\?$/, '') ?? qId} — still needed.` })
        }
      }

      items.push({ status: 'info', text: 'You can upload additional evidence at any time from the Evidence Vault.' })
      return items
    },
  }
}
```

### 6c: family-file-with-court.ts

```typescript
import type { GuidedStepConfig } from '../types'

type FilingSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'

export function createFileWithCourtConfig(subType: FilingSubType): GuidedStepConfig {
  const isPO = subType === 'protective_order'
  const isMod = subType === 'modification'

  return {
    title: 'File With the Court',
    reassurance: isPO
      ? 'There is no filing fee for protective orders in Texas. The court may grant an emergency ex parte order the same day.'
      : 'Filing officially starts your case. This step guides you through the process.',
    questions: [
      {
        id: 'filing_method',
        type: 'single_choice',
        prompt: 'How will you file?',
        options: [
          { value: 'in_person', label: 'In person at the courthouse' },
          { value: 'efiling', label: 'E-filing online' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'efiling_info',
        type: 'info',
        prompt: 'Texas requires e-filing in most counties. Check eFileTexas.gov for your county\'s requirements.',
        showIf: (a) => a.filing_method === 'not_sure',
      },
      ...(isPO ? [{
        id: 'po_fee_info',
        type: 'info' as const,
        prompt: 'There is no filing fee for protective orders in Texas (TX Family Code §81.002). The court will handle service to the respondent.',
      }] : [{
        id: 'filing_fee_ready',
        type: 'yes_no' as const,
        prompt: 'Do you have the filing fee ready?',
        helpText: 'Filing fees vary by county. If you cannot afford the fee, you can apply for a fee waiver (Statement of Inability to Afford Payment of Court Costs).',
      }]),
      ...(isMod ? [{
        id: 'original_court_info',
        type: 'info' as const,
        prompt: 'Modifications should be filed in the court that issued the original order, unless the case has been transferred.',
      }] : []),
      {
        id: 'documents_ready',
        type: 'yes_no',
        prompt: 'Are all your filing documents prepared and ready to submit?',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.filing_method) {
        items.push({ status: 'done', text: `Filing method: ${answers.filing_method === 'efiling' ? 'E-filing' : answers.filing_method === 'in_person' ? 'In person' : 'TBD'}` })
      }

      if (!isPO) {
        if (answers.filing_fee_ready === 'yes') {
          items.push({ status: 'done', text: 'Filing fee ready.' })
        } else if (answers.filing_fee_ready === 'no') {
          items.push({ status: 'needed', text: 'Prepare filing fee or apply for a fee waiver.' })
        }
      } else {
        items.push({ status: 'info', text: 'No filing fee required for protective orders.' })
      }

      if (answers.documents_ready === 'yes') {
        items.push({ status: 'done', text: 'Filing documents are ready.' })
      } else {
        items.push({ status: 'needed', text: 'Prepare your filing documents.' })
      }

      return items
    },
  }
}
```

### 6d: family-serve-respondent.ts

```typescript
import type { GuidedStepConfig } from '../types'

type ServeSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'

export function createServeRespondentConfig(subType: ServeSubType): GuidedStepConfig {
  return {
    title: 'Serve the Respondent',
    reassurance: 'The other party must receive formal notice before the case can proceed. There are several ways to accomplish this.',
    questions: [
      {
        id: 'service_method',
        type: 'single_choice',
        prompt: 'How will the other party be served?',
        options: [
          { value: 'process_server', label: 'Process server or constable' },
          { value: 'certified_mail', label: 'Certified mail, return receipt requested' },
          { value: 'waiver', label: 'Waiver of service (they agree to sign)' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'waiver_info',
        type: 'info',
        prompt: 'A waiver of service is the fastest and cheapest option. The other party signs a document acknowledging they received the papers. This works best in uncontested cases.',
        showIf: (a) => a.service_method === 'waiver',
      },
      {
        id: 'address_known',
        type: 'yes_no',
        prompt: 'Do you know the other party\'s current address?',
      },
      {
        id: 'address_info',
        type: 'info',
        prompt: 'If you cannot locate the other party, you may be able to serve by publication (posting in a newspaper). This requires court approval and has specific requirements.',
        showIf: (a) => a.address_known === 'no',
      },
      {
        id: 'service_timeline',
        type: 'info',
        prompt: subType === 'divorce'
          ? 'After service, the respondent has 20 days (plus Monday) to file an answer. The 60-day waiting period runs from the filing date, not the service date.'
          : 'After service, the respondent typically has 20 days (plus Monday) to file an answer.',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.service_method && answers.service_method !== 'not_sure') {
        items.push({ status: 'done', text: `Service method: ${answers.service_method.replace('_', ' ')}` })
      } else {
        items.push({ status: 'needed', text: 'Choose a service method.' })
      }

      if (answers.address_known === 'yes') {
        items.push({ status: 'done', text: 'Other party\'s address is known.' })
      } else if (answers.address_known === 'no') {
        items.push({ status: 'needed', text: 'Locate the other party\'s address, or seek court approval for service by publication.' })
      }

      items.push({ status: 'info', text: 'After service, the respondent has approximately 20 days to file an answer.' })
      return items
    },
  }
}
```

### 6e: family-prepare-filing.ts

```typescript
import type { GuidedStepConfig } from '../types'

type PrepareSubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'

export function createPrepareFilingConfig(subType: PrepareSubType): GuidedStepConfig {
  return {
    title: 'Prepare Your Filing',
    reassurance: 'We\'ll guide you through preparing your court documents. The filing wizard will create the documents based on your answers.',
    questions: [
      {
        id: 'documents_reviewed',
        type: 'yes_no',
        prompt: 'Have you reviewed all the information from your intake and evidence vault?',
      },
      {
        id: 'review_info',
        type: 'info',
        prompt: 'Go back and review your intake answers and evidence vault before starting the filing preparation. The wizard will pull information from both.',
        showIf: (a) => a.documents_reviewed === 'no',
      },
      {
        id: 'ready_to_start',
        type: 'info',
        prompt: 'Click "Complete" to launch the filing wizard. It will guide you step by step through creating your court documents.',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.documents_reviewed === 'yes') {
        items.push({ status: 'done', text: 'Intake and evidence reviewed.' })
      } else {
        items.push({ status: 'needed', text: 'Review your intake answers and evidence vault.' })
      }

      items.push({ status: 'info', text: 'Ready to start the filing wizard.' })
      return items
    },
  }
}
```

### 6f: family-property-division.ts (divorce only)

```typescript
import type { GuidedStepConfig } from '../types'

export const propertyDivisionConfig: GuidedStepConfig = {
  title: 'Property Division',
  reassurance: 'Texas is a community property state. Property acquired during marriage is generally divided "just and right," which doesn\'t always mean 50/50.',
  questions: [
    {
      id: 'inventory_complete',
      type: 'yes_no',
      prompt: 'Have you completed an inventory of all community property?',
      helpText: 'Community property includes real estate, vehicles, bank accounts, retirement accounts, and personal property acquired during marriage.',
    },
    {
      id: 'inventory_info',
      type: 'info',
      prompt: 'Create a detailed inventory: real estate, vehicles, bank accounts, retirement/investment accounts, household items of value, and any business interests.',
      showIf: (a) => a.inventory_complete === 'no',
    },
    {
      id: 'separate_property',
      type: 'yes_no',
      prompt: 'Do either of you claim separate property?',
      helpText: 'Separate property is what you owned before marriage, inherited, or received as a gift. You must prove it with clear and convincing evidence.',
    },
    {
      id: 'separate_property_info',
      type: 'info',
      prompt: 'Gather documentation proving separate property: pre-marriage bank statements, inheritance documents, gift records. Commingled funds can be hard to trace.',
      showIf: (a) => a.separate_property === 'yes',
    },
    {
      id: 'debts_documented',
      type: 'yes_no',
      prompt: 'Have you documented all community debts?',
      helpText: 'Include mortgages, car loans, credit cards, student loans, and any other debts incurred during marriage.',
    },
    {
      id: 'valuations_obtained',
      type: 'yes_no',
      prompt: 'Have you obtained valuations for major assets?',
      helpText: 'Real estate appraisals, business valuations, and retirement account statements help ensure fair division.',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.inventory_complete === 'yes') {
      items.push({ status: 'done', text: 'Community property inventory completed.' })
    } else {
      items.push({ status: 'needed', text: 'Complete a detailed inventory of all community property.' })
    }

    if (answers.separate_property === 'yes') {
      items.push({ status: 'info', text: 'Separate property claims identified. Gather documentation to prove separate character.' })
    }

    if (answers.debts_documented === 'yes') {
      items.push({ status: 'done', text: 'Community debts documented.' })
    } else {
      items.push({ status: 'needed', text: 'Document all community debts.' })
    }

    if (answers.valuations_obtained === 'yes') {
      items.push({ status: 'done', text: 'Asset valuations obtained.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain valuations for major assets (real estate, business, retirement accounts).' })
    }

    items.push({ status: 'info', text: 'Texas divides community property "just and right" — not necessarily 50/50.' })
    return items
  },
}
```

### 6g: family-existing-order-review.ts (modification only)

```typescript
import type { GuidedStepConfig } from '../types'

export const existingOrderReviewConfig: GuidedStepConfig = {
  title: 'Review Existing Order',
  reassurance: 'Understanding your existing order is essential to identifying what can be modified and what legal standard applies.',
  questions: [
    {
      id: 'order_uploaded',
      type: 'yes_no',
      prompt: 'Have you uploaded your existing court order to the evidence vault?',
    },
    {
      id: 'upload_info',
      type: 'info',
      prompt: 'Upload your existing order to the Evidence Vault so we can reference it. If you don\'t have a copy, request one from the court clerk.',
      showIf: (a) => a.order_uploaded === 'no',
    },
    {
      id: 'provisions_identified',
      type: 'yes_no',
      prompt: 'Have you identified the specific provisions you want to change?',
    },
    {
      id: 'provisions_info',
      type: 'info',
      prompt: 'Review each section of your order: custody/conservatorship, possession schedule, child support, and any other provisions. List exactly what you want changed.',
      showIf: (a) => a.provisions_identified === 'no',
    },
    {
      id: 'change_documented',
      type: 'yes_no',
      prompt: 'Have you documented the material and substantial change in circumstances?',
      helpText: 'Texas requires proof of a "material and substantial change" since the last order, or that the order is at least 3 years old (for support modifications).',
    },
    {
      id: 'change_info',
      type: 'info',
      prompt: 'Document what changed: job loss/new job, relocation, children\'s needs changed, safety concerns, or significant time passage. Be specific with dates and details.',
      showIf: (a) => a.change_documented === 'no',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.order_uploaded === 'yes') {
      items.push({ status: 'done', text: 'Existing order uploaded to evidence vault.' })
    } else {
      items.push({ status: 'needed', text: 'Upload your existing court order to the Evidence Vault.' })
    }

    if (answers.provisions_identified === 'yes') {
      items.push({ status: 'done', text: 'Provisions to modify identified.' })
    } else {
      items.push({ status: 'needed', text: 'Identify the specific provisions you want to change.' })
    }

    if (answers.change_documented === 'yes') {
      items.push({ status: 'done', text: 'Change in circumstances documented.' })
    } else {
      items.push({ status: 'needed', text: 'Document the material and substantial change in circumstances.' })
    }

    items.push({ status: 'info', text: 'Texas law requires a "material and substantial change" in circumstances to modify a family court order.' })
    return items
  },
}
```

### 6h: po-hearing.ts (protective order only)

```typescript
import type { GuidedStepConfig } from '../types'

export const poHearingConfig: GuidedStepConfig = {
  title: 'Protective Order Hearing',
  reassurance: 'The full hearing typically occurs within 14 days of filing. The court will decide whether to grant a protective order lasting up to 2 years.',
  questions: [
    {
      id: 'hearing_date_known',
      type: 'yes_no',
      prompt: 'Do you know the date of your hearing?',
    },
    {
      id: 'hearing_info',
      type: 'info',
      prompt: 'The hearing must be set within 14 days of your application. Check with the court clerk for your hearing date and time.',
      showIf: (a) => a.hearing_date_known === 'no',
    },
    {
      id: 'evidence_prepared',
      type: 'yes_no',
      prompt: 'Have you gathered evidence of the abuse to present at the hearing?',
      helpText: 'Photos of injuries, threatening messages, medical records, police reports, and witness statements are all powerful evidence.',
    },
    {
      id: 'evidence_info',
      type: 'info',
      prompt: 'Gather: photos of injuries, screenshots of threatening messages, medical records, police reports, and names of witnesses. Organize them chronologically.',
      showIf: (a) => a.evidence_prepared === 'no',
    },
    {
      id: 'witnesses_available',
      type: 'yes_no',
      prompt: 'Will any witnesses be available to testify?',
    },
    {
      id: 'safety_plan',
      type: 'yes_no',
      prompt: 'Do you have a safety plan in place?',
      helpText: 'A safety plan includes a safe place to go, emergency contacts, and copies of important documents.',
    },
    {
      id: 'safety_plan_info',
      type: 'info',
      prompt: 'Create a safety plan: identify a safe place to go, save emergency contacts, keep copies of IDs and important documents in a secure location. The DV Hotline can help: 1-800-799-7233.',
      showIf: (a) => a.safety_plan === 'no',
    },
    {
      id: 'hearing_procedure',
      type: 'info',
      prompt: 'At the hearing: both parties can present evidence and testimony. The respondent has a right to be present and contest the order. Focus on specific incidents with dates and details. The judge will decide whether to grant a 2-year protective order.',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.hearing_date_known === 'yes') {
      items.push({ status: 'done', text: 'Hearing date is known.' })
    } else {
      items.push({ status: 'needed', text: 'Check with the court clerk for your hearing date.' })
    }

    if (answers.evidence_prepared === 'yes') {
      items.push({ status: 'done', text: 'Evidence of abuse gathered.' })
    } else {
      items.push({ status: 'needed', text: 'Gather evidence: photos, messages, medical records, police reports.' })
    }

    if (answers.witnesses_available === 'yes') {
      items.push({ status: 'done', text: 'Witnesses available to testify.' })
    } else {
      items.push({ status: 'info', text: 'No witnesses available. Your testimony alone can be sufficient.' })
    }

    if (answers.safety_plan === 'yes') {
      items.push({ status: 'done', text: 'Safety plan in place.' })
    } else {
      items.push({ status: 'needed', text: 'Create a safety plan. DV Hotline: 1-800-799-7233.' })
    }

    items.push({ status: 'info', text: 'The hearing occurs within 14 days. If granted, the protective order lasts up to 2 years.' })
    return items
  },
}
```

---

## Task 7: Refactor existing family guided configs for sub-type awareness

**Files:**
- Modify: `src/lib/guided-steps/family/temporary-orders.ts`
- Modify: `src/lib/guided-steps/family/mediation.ts`
- Modify: `src/lib/guided-steps/family/waiting-period.ts`
- Modify: `src/lib/guided-steps/family/final-orders.ts`

For each file, add a factory function that accepts `subType` parameter while keeping the existing exported config as the default. This allows the page.tsx to call the factory with the appropriate sub-type.

### Example for temporary-orders.ts:

Add at the bottom of the existing file:

```typescript
export function createTemporaryOrdersConfig(subType: 'divorce' | 'custody' | 'child_support' | 'spousal_support'): GuidedStepConfig {
  // Reuse the base config, customize title/reassurance per sub-type
  const titles: Record<string, string> = {
    divorce: 'Temporary Orders',
    custody: 'Temporary Custody Orders',
    child_support: 'Temporary Child Support',
    spousal_support: 'Temporary Spousal Support',
  }

  return {
    ...temporaryOrdersConfig,
    title: titles[subType] ?? 'Temporary Orders',
  }
}
```

### Example for mediation.ts:

Add factory with mandatory mediation note for custody/visitation:

```typescript
export function createMediationConfig(subType: 'divorce' | 'custody' | 'visitation' | 'modification'): GuidedStepConfig {
  const mandatory = subType === 'custody' || subType === 'visitation'

  return {
    ...mediationConfig,
    reassurance: mandatory
      ? 'Texas Family Code §153.0071 requires mediation in custody and visitation cases before trial. This is mandatory.'
      : mediationConfig.reassurance,
  }
}
```

### For waiting-period.ts and final-orders.ts:

Similar factory pattern — minimal customization needed since these are already fairly generic.

---

## Task 8: Update page.tsx with ~62 new switch cases

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`

**Step 1: Add imports for all new guided step configs**

Add these imports near the top of the file (after existing family imports):

```typescript
import { createFamilyIntakeConfig } from '@/lib/guided-steps/family/family-intake-factory'
import { createSafetyScreeningConfig } from '@/lib/guided-steps/family/family-safety-screening'
import { createEvidenceVaultConfig } from '@/lib/guided-steps/family/family-evidence-vault'
import { createFileWithCourtConfig } from '@/lib/guided-steps/family/family-file-with-court'
import { createServeRespondentConfig } from '@/lib/guided-steps/family/family-serve-respondent'
import { createPrepareFilingConfig } from '@/lib/guided-steps/family/family-prepare-filing'
import { propertyDivisionConfig } from '@/lib/guided-steps/family/family-property-division'
import { existingOrderReviewConfig } from '@/lib/guided-steps/family/family-existing-order-review'
import { poHearingConfig } from '@/lib/guided-steps/family/po-hearing'
import { createTemporaryOrdersConfig } from '@/lib/guided-steps/family/temporary-orders'
import { createMediationConfig } from '@/lib/guided-steps/family/mediation'
import { createFinalOrdersConfig } from '@/lib/guided-steps/family/final-orders'
```

**Step 2: Remove old family switch cases**

Remove the old cases: `family_intake`, `safety_screening`, `prepare_family_filing`, `waiting_period`, `temporary_orders`, `mediation`, `final_orders` (lines ~485-525).

**Step 3: Add new switch cases for all 62 family task_keys**

Add after the existing `evidence_vault` case. Each sub-type intake needs to fetch `family_case_details` to get the sub-type. For the guided step configs, use the factory functions. Example pattern:

```typescript
    // --- Divorce ---
    case 'divorce_intake':
      return <GuidedStep caseId={id} taskId={taskId} config={createFamilyIntakeConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_safety_screening':
      return <GuidedStep caseId={id} taskId={taskId} config={createSafetyScreeningConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_evidence_vault':
      return <GuidedStep caseId={id} taskId={taskId} config={createEvidenceVaultConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_prepare_filing': {
      const { data: caseRow } = await supabase.from('cases').select('county').eq('id', id).single()
      const { data: familyDetails } = await supabase.from('family_case_details').select('*').eq('case_id', id).maybeSingle()
      return (
        <FamilyLawWizard caseId={id} taskId={taskId} existingMetadata={task.metadata} familyDetails={familyDetails} caseData={{ county: caseRow?.county ?? null }} />
      )
    }
    case 'divorce_file_with_court':
      return <GuidedStep caseId={id} taskId={taskId} config={createFileWithCourtConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_serve_respondent':
      return <GuidedStep caseId={id} taskId={taskId} config={createServeRespondentConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_waiting_period':
      return <WaitingPeriodStep caseId={id} taskId={taskId} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_temporary_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createTemporaryOrdersConfig('divorce')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'divorce_mediation':
      return <GuidedStep caseId={id} taskId={taskId} config={createMediationConfig('divorce')} existingAnswers={task.metadata?.guided_answers} skippable />
    case 'divorce_property_division':
      return <GuidedStep caseId={id} taskId={taskId} config={propertyDivisionConfig} existingAnswers={task.metadata?.guided_answers} />
    case 'divorce_final_orders':
      return <GuidedStep caseId={id} taskId={taskId} config={createFinalOrdersConfig('divorce')} existingAnswers={task.metadata?.guided_answers} />
```

Repeat this pattern for all 7 sub-types. Key notes:
- **`*_prepare_filing`** cases use `<FamilyLawWizard>` (already branches by sub-type)
- **`divorce_waiting_period`** uses `<WaitingPeriodStep>` (existing component)
- **`*_temporary_orders`** uses `createTemporaryOrdersConfig(subType)` with `skippable`
- **`custody_mediation`** and **`visitation_mediation`** are **NOT** skippable (mandatory)
- **`po_hearing`** uses `poHearingConfig`
- **`mod_existing_order_review`** uses `existingOrderReviewConfig`
- **`divorce_property_division`** uses `propertyDivisionConfig`

**Step 4: Verify build**

Run: `npx next build 2>&1 | tail -30`

Expected: Build passes with zero errors.

---

## Task 9: DB Migration

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_family_law_parity.sql`

This is the largest task. The migration must:

1. **Read existing family_sub_type** for each family case from `family_case_details`
2. **Rename existing family tasks** to sub-type-specific keys
3. **Insert new sub-type-specific tasks** that didn't exist before
4. **Remove tasks that don't apply** to the specific sub-type
5. **Replace `seed_case_tasks()`** — 7 new family branches replacing the single `family` branch
6. **Replace `unlock_next_task()`** — 7 new unlock chains with case_stage branching

### Step 1: Rename existing tasks

```sql
-- For each existing family case, rename tasks based on family_sub_type
-- Example: divorce cases
UPDATE public.tasks t
SET task_key = 'divorce_intake'
FROM public.cases c
JOIN public.family_case_details fcd ON fcd.case_id = c.id
WHERE t.case_id = c.id
  AND t.task_key = 'family_intake'
  AND c.dispute_type = 'family'
  AND fcd.family_sub_type = 'divorce';
```

Repeat for each (sub_type, old_key, new_key) combination. The mapping:
- `family_intake` → `{subtype}_intake` (e.g., `divorce_intake`, `custody_intake`, etc. For PO: `po_intake`, for mod: `mod_intake`)
- `safety_screening` → `{subtype}_safety_screening` (only divorce, custody, visitation, PO)
- `evidence_vault` → `{subtype}_evidence_vault` (all except PO)
- `prepare_family_filing` → `{subtype}_prepare_filing` (all)
- `file_with_court` → `{subtype}_file_with_court` (all. For PO: `po_file_with_court`)
- `upload_return_of_service` + `confirm_service_facts` → `{subtype}_serve_respondent` (merge into single task, all except PO)
- `waiting_period` → `divorce_waiting_period` (divorce only, delete for others)
- `temporary_orders` → `{subtype}_temporary_orders` (divorce, custody, child_support, spousal_support only)
- `mediation` → `{subtype}_mediation` (divorce, custody, visitation, mod only)
- `final_orders` → `{subtype}_final_orders` (all except PO)

### Step 2: Insert new tasks

For each existing case, insert sub-type-specific tasks that didn't exist:
- Divorce: `divorce_property_division`
- Modification: `mod_existing_order_review`
- Protective Order: `po_hearing`

### Step 3: Remove tasks that don't apply

- Child support: remove safety_screening, mediation
- Spousal support: remove safety_screening, mediation
- Protective Order: remove evidence_vault, serve (upload_return_of_service + confirm_service_facts), waiting_period, temporary_orders, mediation, final_orders
- Modification: remove safety_screening

### Step 4: seed_case_tasks() — 7 new family branches

Replace the single `IF NEW.dispute_type = 'family'` block with 7 branches that check `family_sub_type` from `family_case_details`:

```sql
IF NEW.dispute_type = 'family' THEN
  -- Look up family_sub_type
  SELECT fcd.family_sub_type INTO v_family_sub_type
  FROM public.family_case_details fcd
  WHERE fcd.case_id = NEW.id;

  -- Default to divorce if not found
  v_family_sub_type := COALESCE(v_family_sub_type, 'divorce');

  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  IF v_family_sub_type = 'divorce' THEN
    INSERT INTO public.tasks (case_id, task_key, title, status) VALUES
      (NEW.id, 'divorce_intake', 'Tell Us About Your Divorce', 'locked'),
      (NEW.id, 'divorce_safety_screening', 'Safety Check', 'locked'),
      (NEW.id, 'divorce_evidence_vault', 'Organize Your Evidence', 'locked'),
      (NEW.id, 'divorce_prepare_filing', 'Prepare Your Divorce Filing', 'locked'),
      (NEW.id, 'divorce_file_with_court', 'File With the Court', 'locked'),
      (NEW.id, 'divorce_serve_respondent', 'Serve the Respondent', 'locked'),
      (NEW.id, 'divorce_waiting_period', 'Mandatory Waiting Period', 'locked'),
      (NEW.id, 'divorce_temporary_orders', 'Request Temporary Orders', 'locked'),
      (NEW.id, 'divorce_mediation', 'Attend Mediation', 'locked'),
      (NEW.id, 'divorce_property_division', 'Property Division', 'locked'),
      (NEW.id, 'divorce_final_orders', 'Final Decree', 'locked');
  ELSIF v_family_sub_type = 'custody' THEN
    -- ... 9 tasks
  ELSIF v_family_sub_type = 'child_support' THEN
    -- ... 7 tasks
  -- ... etc for all 7 sub-types
  END IF;

  RETURN NEW;
END IF;
```

### Step 5: unlock_next_task() — 7 new chains

Replace the family chain section with 7 separate chains. Each chain follows the task progression defined in the Task Chains Reference at the top of this plan.

For intakes with case_stage branching, follow the contract pattern:

```sql
IF NEW.task_key = 'divorce_intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
  v_case_stage := COALESCE(NEW.metadata->'guided_answers'->>'case_stage', 'start');

  IF v_case_stage = 'start' THEN
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_safety_screening' AND status = 'locked';

  ELSIF v_case_stage = 'filed' THEN
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_file_with_court' AND status = 'locked';

  ELSIF v_case_stage = 'served' THEN
    UPDATE public.tasks SET status = 'skipped'
    WHERE case_id = NEW.case_id
      AND task_key IN ('divorce_safety_screening', 'divorce_evidence_vault', 'divorce_prepare_filing', 'divorce_file_with_court', 'divorce_serve_respondent')
      AND status = 'locked';
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_waiting_period' AND status = 'locked';

  -- ... etc for waiting_period, temporary_orders, mediation stages

  ELSE
    UPDATE public.tasks SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id AND task_key = 'divorce_safety_screening' AND status = 'locked';
  END IF;
END IF;
```

Skippable task transitions use `IN ('completed', 'skipped')` and `NOT IN ('completed', 'skipped')`.

**Step 6: Verify migration syntax**

Run: `npx supabase db diff` to validate syntax if available, or review manually.

---

## Task 10: Update case dashboard to use family sub-type for phases

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

The case dashboard must fetch `family_case_details` and use `family_sub_type` to look up the correct `WORKFLOW_PHASES` entry. Check if this is already fetched (it likely is for the FamilyLawWizard).

Add or update the phases lookup:
```typescript
const disputeKey = caseData.dispute_type === 'family'
  ? familyDetails?.family_sub_type ?? 'divorce'
  : caseData.dispute_type
const phases = WORKFLOW_PHASES[disputeKey] ?? []
```

Also update the milestones lookup to pass `familySubType` where needed.

---

## Task 11: Update import-case-dialog.tsx and new-case-dialog.tsx

**Files:**
- Modify: `src/components/cases/import-case-dialog.tsx`
- Modify: `src/components/cases/new-case-dialog.tsx`

These files pass `family_sub_type` to the API when creating family cases. The API inserts it into `family_case_details`. This flow already works — but the milestone selection in the import dialog needs updating to use the sub-type-specific milestones.

Check the import dialog's milestone step — it likely calls `getMilestones('family')`. Update it to pass the sub-type:

```typescript
const milestones = getMilestones(state.disputeType, state.familySubType || undefined)
```

---

## Task 12: Build Verification

Run: `npx next build`

Verify:
1. Build passes with zero errors
2. All ~62 family task_keys have matching switch cases in page.tsx
3. All ~62 task_keys appear in workflow-phases.ts across 7 sub-type entries
4. All new task_keys have step-guidance entries
5. 7 sub-type milestone arrays exist with correct namespaced keys
6. SKIPPABLE_TASKS has the correct 6 family entries
7. Small claims, LT, contract, property, other switch cases still work (no regression)
8. `custody_mediation` and `visitation_mediation` are NOT in SKIPPABLE_TASKS

---

## Verification Checklist

- [ ] `npx next build` passes
- [ ] 7 sub-type entries in workflow-phases.ts
- [ ] ~62 switch cases in page.tsx
- [ ] ~62 step-guidance entries
- [ ] 7 milestone arrays in milestones.ts
- [ ] 6 family entries in SKIPPABLE_TASKS
- [ ] DB migration renames existing tasks correctly
- [ ] DB migration seeds 7 sub-type branches
- [ ] DB migration has 7 unlock chains with case_stage branching
- [ ] Case dashboard uses family_sub_type for phase lookup
- [ ] Import dialog uses sub-type-specific milestones
- [ ] No regression on other dispute types
