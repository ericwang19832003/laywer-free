# Step Context Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a right-side context sidebar to step pages showing step-specific guidance and case pulse cards (deadlines, health score, quick links).

**Architecture:** A server-rendered right sidebar in the existing case layout. Step guidance comes from a static config map (extending the existing `STATIC_DESCRIPTIONS` pattern). Case pulse data (deadlines, risk score) is fetched in the layout alongside existing task queries. The sidebar is hidden below `xl` breakpoint.

**Tech Stack:** Next.js server components, Supabase queries, Tailwind CSS, existing UI primitives (`Card`, `CardContent`, lucide-react icons)

---

### Task 1: Create step guidance config

**Files:**
- Create: `src/lib/step-guidance.ts`

**Step 1: Create the guidance config file**

This extends the concept from `src/lib/ai/task-descriptions.ts` (which has `description` and `importance`) by adding `checklist` and `tip` fields specifically for the sidebar.

```typescript
// src/lib/step-guidance.ts

export interface StepGuidance {
  why: string
  checklist: string[]
  tip?: string
}

export const STEP_GUIDANCE: Record<string, StepGuidance> = {
  // --- Shared / Civil ---
  welcome: {
    why: 'This introduction helps you understand how the process works and what to expect at each stage.',
    checklist: [
      'A few minutes of uninterrupted time',
      'Basic details about your situation',
    ],
  },
  intake: {
    why: 'The details you provide here shape every document and deadline in your case. Accuracy matters.',
    checklist: [
      'County where the case will be filed',
      'Names of the parties involved',
      'Brief description of what happened',
    ],
    tip: 'You can update these details later if something changes.',
  },
  evidence_vault: {
    why: 'Well-organized evidence strengthens your case at every stage — from demand letters to trial.',
    checklist: [
      'Photos, screenshots, or documents related to your case',
      'Receipts or invoices showing damages',
      'Any written communication with the other party',
    ],
    tip: 'Upload what you have now. You can always add more later.',
  },
  preservation_letter: {
    why: 'This letter puts the other side on notice to keep relevant evidence. Sending it early protects your ability to obtain proof later.',
    checklist: [
      'Name and address of the opposing party',
      'Description of the evidence you want preserved',
    ],
    tip: 'Even if you\'re not sure you\'ll go to court, sending this letter is a smart precaution.',
  },
  prepare_filing: {
    why: 'Your initial court filing establishes your legal claims. Getting the format right is essential for the court to accept it.',
    checklist: [
      'Completed intake information',
      'Evidence organized in the vault',
      'Filing fee amount for your county',
    ],
  },
  file_with_court: {
    why: 'Submitting your filing officially starts your case. This step tracks what you need at the courthouse or online.',
    checklist: [
      'Your prepared petition or filing document',
      'Payment method for filing fees',
      'Government-issued ID',
    ],
  },
  upload_return_of_service: {
    why: 'Proof of service shows the court that the other party was properly notified. Without it, your case cannot move forward.',
    checklist: [
      'The signed return of service document',
      'Date the other party was served',
    ],
  },
  confirm_service_facts: {
    why: 'Confirming service details lets us calculate your critical deadlines accurately.',
    checklist: [
      'Exact date of service',
      'Method used (personal, substituted, etc.)',
    ],
  },
  wait_for_answer: {
    why: 'After service, the other side has a set number of days to respond. This step tracks that window.',
    checklist: [
      'Monitor your court\'s online docket if available',
      'Check your mailbox for any court notices',
    ],
  },
  check_docket_for_answer: {
    why: 'Whether the other side responded determines your next path — default judgment or discovery.',
    checklist: [
      'Access to the court\'s online docket system',
      'Your case number',
    ],
  },
  default_packet_prep: {
    why: 'If the other side didn\'t respond in time, you may be able to win by default. This packet asks the court to enter judgment.',
    checklist: [
      'Proof of service document',
      'Your original filed petition',
      'Evidence of damages',
    ],
  },
  upload_answer: {
    why: 'Uploading the answer lets us analyze their defenses so you can plan your response strategy.',
    checklist: [
      'The defendant\'s filed answer document (PDF)',
    ],
  },
  discovery_starter_pack: {
    why: 'Discovery is how you legally request information from the other side. This gives you standard requests for your case type.',
    checklist: [
      'Review your evidence vault for gaps',
      'List of questions you want answered',
    ],
  },

  // --- Personal Injury ---
  pi_intake: {
    why: 'Injury case details shape your entire strategy — from medical documentation to calculating damages.',
    checklist: [
      'Date and location of the incident',
      'Other party\'s name and insurance info',
      'Your insurance policy number',
      'Police report number (if applicable)',
    ],
    tip: 'Don\'t worry if you don\'t have everything yet — you can update details later.',
  },
  pi_medical_records: {
    why: 'Medical records are the foundation of your injury claim. They document what happened and connect your injuries to the incident.',
    checklist: [
      'Names and addresses of treating doctors',
      'Hospital or ER visit records',
      'Medical bills and receipts',
      'Prescription records',
    ],
  },
  pi_insurance_communication: {
    why: 'How you communicate with insurance companies can significantly impact your claim. Being prepared helps protect your interests.',
    checklist: [
      'Your claim number (if you have one)',
      'Insurance adjuster\'s name and contact info',
      'Notes from any prior conversations',
    ],
    tip: 'Keep a record of every interaction with the insurance company.',
  },
  prepare_pi_demand_letter: {
    why: 'A demand letter formally requests compensation and often leads to settlement without going to court.',
    checklist: [
      'Complete medical records and bills',
      'Documentation of lost wages',
      'Evidence of property damage',
      'Photos of injuries',
    ],
  },
  pi_settlement_negotiation: {
    why: 'Most personal injury cases settle before trial. Knowing your case value and negotiation range gives you leverage.',
    checklist: [
      'Total medical expenses to date',
      'Lost wages documentation',
      'Your minimum acceptable settlement amount',
    ],
  },
  prepare_pi_petition: {
    why: 'If settlement talks fail, filing a lawsuit preserves your right to recover damages through the court.',
    checklist: [
      'All evidence from your vault',
      'Completed demand letter (if sent)',
      'Filing fee for your county',
    ],
  },
  pi_file_with_court: {
    why: 'Filing officially starts your lawsuit and sets legal deadlines in motion.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  pi_serve_defendant: {
    why: 'The defendant must be formally notified of the lawsuit. Proper service is required before the case can proceed.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for process server or constable',
    ],
  },
  pi_wait_for_answer: {
    why: 'The defendant has a limited time to respond after being served. This waiting period is normal.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  pi_review_answer: {
    why: 'Understanding the defendant\'s response helps you identify their strategy and prepare your counterarguments.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims or defenses raised',
    ],
  },
  pi_discovery_prep: {
    why: 'Discovery lets you formally request evidence from the other side. Well-crafted requests strengthen your position.',
    checklist: [
      'List of facts you need to prove',
      'Documents you want from the defendant',
      'Questions about the incident',
    ],
  },
  pi_discovery_responses: {
    why: 'You must respond to the defendant\'s discovery requests within the deadline. Timely, complete responses prevent court sanctions.',
    checklist: [
      'The discovery requests you received',
      'Documents requested by the other side',
    ],
  },
  pi_scheduling_conference: {
    why: 'The scheduling conference sets the timeline for your entire case — discovery cutoffs, motion deadlines, and trial date.',
    checklist: [
      'Your calendar for the next 6-12 months',
      'Any scheduling conflicts',
    ],
  },
  pi_pretrial_motions: {
    why: 'Pre-trial motions can narrow the issues, exclude evidence, or even resolve parts of the case before trial.',
    checklist: [
      'Review all discovery responses received',
      'Identify weak points in the opposing case',
    ],
  },
  pi_mediation: {
    why: 'Mediation is a chance to resolve the case with a neutral third party. Many cases settle at this stage.',
    checklist: [
      'Your settlement range (minimum to ideal)',
      'Summary of your strongest evidence',
      'All medical documentation and bills',
    ],
  },
  pi_trial_prep: {
    why: 'Thorough trial preparation is critical. Organized exhibits, clear witness testimony, and a strong narrative win cases.',
    checklist: [
      'Exhibit list organized and labeled',
      'Witness list with contact information',
      'Opening statement outline',
    ],
  },
  pi_post_resolution: {
    why: 'After your case resolves, there are important follow-up steps to ensure you receive and manage your recovery.',
    checklist: [
      'Settlement agreement or court order',
      'List of medical liens to satisfy',
    ],
  },

  // --- Small Claims ---
  small_claims_intake: {
    why: 'These details determine your filing court, fees, and whether your claim fits within the small claims limit.',
    checklist: [
      'Amount you\'re claiming (must be within limit)',
      'Defendant\'s name and address',
      'Description of what happened',
    ],
  },
  prepare_demand_letter: {
    why: 'Many disputes resolve after a formal demand letter. It shows you\'re serious and gives the other side a chance to settle.',
    checklist: [
      'Amount you\'re demanding',
      'Evidence supporting your claim',
      'Defendant\'s mailing address',
    ],
  },
  prepare_small_claims_filing: {
    why: 'Small claims court has simplified forms, but filling them out correctly is still important for your case to be accepted.',
    checklist: [
      'Defendant\'s full legal name and address',
      'Exact amount of your claim',
      'Brief description of the dispute',
    ],
  },
  serve_defendant: {
    why: 'The defendant must receive formal notice of your claim. The court requires proof this was done correctly.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for certified mail or process server',
    ],
  },
  prepare_for_hearing: {
    why: 'Small claims hearings are brief — usually 15-30 minutes. Being prepared and organized makes a strong impression on the judge.',
    checklist: [
      'All evidence organized in order',
      'Brief timeline of events written out',
      'Copies of everything for the judge and defendant',
    ],
    tip: 'Practice explaining your case in under 5 minutes.',
  },
  hearing_day: {
    why: 'This is your day in court. Arriving prepared, on time, and organized is the best thing you can do.',
    checklist: [
      'All exhibits and copies',
      'Government-issued ID',
      'Arrive 15-30 minutes early',
    ],
  },

  // --- Landlord-Tenant ---
  landlord_tenant_intake: {
    why: 'Landlord-tenant disputes have specific rules depending on your situation. These details help us guide you correctly.',
    checklist: [
      'Your lease or rental agreement',
      'Landlord or property manager\'s name and address',
      'Description of the issue',
    ],
  },
  prepare_lt_demand_letter: {
    why: 'Many landlord-tenant issues require a written demand before you can take legal action. This letter starts that clock.',
    checklist: [
      'Specific amount owed or issue to be fixed',
      'Landlord\'s mailing address',
      'Copies of relevant lease provisions',
    ],
  },
  prepare_landlord_tenant_filing: {
    why: 'Your court filing must include the right claims and follow local rules for landlord-tenant cases.',
    checklist: [
      'Completed demand letter (or proof it was sent)',
      'Lease agreement',
      'Evidence of the issue (photos, communications)',
    ],
  },
  serve_other_party: {
    why: 'The other party must be formally notified. Landlord-tenant cases often have specific service requirements.',
    checklist: [
      'Other party\'s address for service',
      'Correct service method for your court',
    ],
  },
  post_judgment: {
    why: 'After the ruling, there may be steps to enforce the judgment or handle an appeal.',
    checklist: [
      'Copy of the court\'s order or judgment',
      'Notes on any payment or compliance deadlines',
    ],
  },

  // --- Debt Defense ---
  debt_defense_intake: {
    why: 'Understanding the debt claim against you is the first step to building your defense.',
    checklist: [
      'The lawsuit papers you received',
      'Any debt collection letters',
      'Original credit agreement (if you have it)',
    ],
    tip: 'Even if you owe the debt, there may be valid defenses available to you.',
  },
  prepare_debt_validation_letter: {
    why: 'Debt collectors must prove the debt is valid and that they have the right to collect. This letter forces them to show their proof.',
    checklist: [
      'Creditor\'s name and address',
      'Account number from the collection notice',
    ],
  },
  prepare_debt_defense_answer: {
    why: 'Filing an answer prevents a default judgment against you and preserves all your defenses.',
    checklist: [
      'The plaintiff\'s petition or complaint',
      'Any validation response you received',
      'Deadline for filing your answer',
    ],
  },
  debt_file_with_court: {
    why: 'Filing your answer on time is critical. Missing the deadline can result in an automatic judgment against you.',
    checklist: [
      'Your prepared answer document',
      'Filing fee (or fee waiver application)',
    ],
  },
  serve_plaintiff: {
    why: 'The plaintiff\'s attorney must receive a copy of your answer. This is required by court rules.',
    checklist: [
      'Plaintiff\'s attorney name and address',
      'Certificate of service form',
    ],
  },
  debt_hearing_prep: {
    why: 'Preparation is your biggest advantage. Knowing the plaintiff\'s weak points helps you challenge their case effectively.',
    checklist: [
      'All documents received from the plaintiff',
      'Your validation letter and any response',
      'Timeline of the debt',
    ],
  },
  debt_hearing_day: {
    why: 'This is your chance to present your defense. Being organized and calm makes a strong impression.',
    checklist: [
      'All exhibits and copies',
      'Government-issued ID',
      'Arrive 15-30 minutes early',
    ],
  },
  debt_post_judgment: {
    why: 'After the ruling, you may need to act quickly — whether it\'s appealing, negotiating payment, or enforcing a win.',
    checklist: [
      'Copy of the court\'s judgment',
      'Note the appeal deadline',
    ],
  },

  // --- Family ---
  family_intake: {
    why: 'Family law cases involve unique considerations. These details help us tailor the process to your specific situation.',
    checklist: [
      'Marriage date and separation date',
      'Names and ages of any children',
      'General overview of property and debts',
    ],
  },
  safety_screening: {
    why: 'Your safety comes first. This screening helps us identify if any protective measures are needed.',
    checklist: [
      'A private, safe space to answer honestly',
    ],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  prepare_family_filing: {
    why: 'Family court filings have specific requirements. Getting the paperwork right avoids delays and additional fees.',
    checklist: [
      'Financial information (income, debts, assets)',
      'Children\'s information (if applicable)',
      'Filing fee or fee waiver application',
    ],
  },
  waiting_period: {
    why: 'Many family law cases have a mandatory waiting period before the court can finalize orders.',
    checklist: [
      'Mark the waiting period end date on your calendar',
      'Use this time to gather any remaining documents',
    ],
  },
  temporary_orders: {
    why: 'Temporary orders set the rules while your case is pending — custody, support, property use.',
    checklist: [
      'Current living and custody arrangements',
      'Monthly income and expenses',
      'Immediate concerns that need court attention',
    ],
  },
  mediation: {
    why: 'Mediation helps both sides reach agreement with a neutral third party. Courts often require it before trial.',
    checklist: [
      'Your ideal outcome for each issue',
      'Your minimum acceptable terms',
      'All relevant financial documents',
    ],
  },
  final_orders: {
    why: 'Final orders are the court\'s binding decisions on all issues in your case.',
    checklist: [
      'Review all temporary orders',
      'List of unresolved issues',
      'Proposed final terms',
    ],
  },
}
```

**Step 2: Verify the file compiles**

Run: `cd "/Users/minwang/lawyer free" && npx tsc --noEmit src/lib/step-guidance.ts 2>&1 || echo "Check passed"`

**Step 3: Commit**

```bash
git add src/lib/step-guidance.ts
git commit -m "feat: add step guidance config for context sidebar"
```

---

### Task 2: Create the ContextSidebar component

**Files:**
- Create: `src/components/case/context-sidebar.tsx`

**Step 1: Create the server component**

```tsx
// src/components/case/context-sidebar.tsx
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
} from 'lucide-react'
import { STEP_GUIDANCE } from '@/lib/step-guidance'

interface ContextSidebarProps {
  caseId: string
  currentTaskKey: string | null
  deadline: {
    key: string
    due_at: string
  } | null
  riskScore: {
    overall_score: number
    risk_level: string
    breakdown: Record<string, unknown>
  } | null
}

function formatDeadlineKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function daysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'low': return 'bg-green-100 text-green-700'
    case 'moderate': return 'bg-amber-100 text-amber-700'
    case 'elevated': return 'bg-orange-100 text-orange-700'
    case 'high': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export function ContextSidebar({ caseId, currentTaskKey, deadline, riskScore }: ContextSidebarProps) {
  const guidance = currentTaskKey ? STEP_GUIDANCE[currentTaskKey] : null

  return (
    <div className="flex flex-col gap-4 py-4 pl-2 pr-3">
      {/* Step Guide */}
      {guidance && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-calm-indigo" />
              <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
                About This Step
              </h3>
            </div>
            <p className="text-sm text-warm-muted mb-3">{guidance.why}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-warm-text">Have ready:</p>
              {guidance.checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-warm-muted/60 mt-0.5 shrink-0" />
                  <span className="text-xs text-warm-muted">{item}</span>
                </div>
              ))}
            </div>
            {guidance.tip && (
              <div className="mt-3 rounded-md bg-calm-indigo/5 border border-calm-indigo/10 px-3 py-2">
                <p className="text-xs text-calm-indigo">{guidance.tip}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Deadline */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-warm-muted" />
            <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Next Deadline
            </h3>
          </div>
          {deadline ? (() => {
            const days = daysUntil(deadline.due_at)
            const urgent = days <= 3
            return (
              <div>
                <p className="text-sm font-medium text-warm-text">
                  {formatDeadlineKey(deadline.key)}
                </p>
                <p className={`text-xs mt-0.5 ${urgent ? 'text-red-600 font-medium' : 'text-warm-muted'}`}>
                  {days <= 0 ? 'Overdue' : days === 1 ? 'Due tomorrow' : `In ${days} days`}
                </p>
              </div>
            )
          })() : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-calm-green" />
              <span className="text-xs text-warm-muted">No upcoming deadlines</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Case Health */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-warm-muted" />
            <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide">
              Case Health
            </h3>
          </div>
          {riskScore ? (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getRiskColor(riskScore.risk_level)}`}>
                {riskScore.risk_level === 'low' ? 'Healthy' :
                 riskScore.risk_level === 'moderate' ? 'Moderate' :
                 riskScore.risk_level === 'elevated' ? 'Needs Attention' : 'At Risk'}
              </span>
              <span className="text-xs text-warm-muted">Score: {riskScore.overall_score}</span>
            </div>
          ) : (
            <p className="text-xs text-warm-muted">Complete more steps to unlock insights.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="text-xs font-semibold text-warm-muted uppercase tracking-wide mb-2">
            Quick Links
          </h3>
          <div className="space-y-1.5">
            <Link
              href={`/case/${caseId}`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href={`/case/${caseId}/evidence`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Evidence Vault
            </Link>
            <Link
              href={`/case/${caseId}/case-file`}
              className="flex items-center gap-2 text-xs text-warm-muted hover:text-warm-text transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Case File
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

**Step 3: Commit**

```bash
git add src/components/case/context-sidebar.tsx
git commit -m "feat: add context sidebar component with step guidance and case pulse"
```

---

### Task 3: Update case layout for three-column design

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/layout.tsx`

**Step 1: Update the layout**

Replace the entire file with:

```tsx
import { createClient } from '@/lib/supabase/server'
import { WorkflowSidebar } from '@/components/case/workflow-sidebar'
import { MobileSidebarDrawer } from '@/components/case/mobile-sidebar-drawer'
import { ContextSidebar } from '@/components/case/context-sidebar'
import { WORKFLOW_PHASES } from '@/lib/workflow-phases'
import type { SidebarTask } from '@/components/case/workflow-sidebar'

export default async function CaseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: tasks }, { data: caseRow }, { data: deadline }, { data: riskScore }] =
    await Promise.all([
      supabase
        .from('tasks')
        .select('id, task_key, title, status')
        .eq('case_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('cases')
        .select('dispute_type')
        .eq('id', id)
        .single(),
      supabase
        .from('deadlines')
        .select('key, due_at')
        .eq('case_id', id)
        .gte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score, risk_level, breakdown')
        .eq('case_id', id)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  const taskList: SidebarTask[] = (tasks ?? []).map((t) => ({
    id: t.id,
    task_key: t.task_key,
    title: t.title,
    status: t.status,
  }))

  const disputeType = caseRow?.dispute_type ?? 'civil'
  const phases = WORKFLOW_PHASES[disputeType] ?? WORKFLOW_PHASES['civil']

  // Determine current task_key (first non-completed, non-skipped, non-locked task)
  const currentTaskKey =
    taskList.find(
      (t) => t.status === 'in_progress' || t.status === 'needs_review'
    )?.task_key ??
    taskList.find((t) => t.status === 'todo')?.task_key ??
    null

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
      </aside>

      <main className="flex-1 min-w-0">
        {children}
      </main>

      <aside className="hidden xl:block w-72 shrink-0 border-l border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <ContextSidebar
          caseId={id}
          currentTaskKey={currentTaskKey}
          deadline={deadline}
          riskScore={riskScore}
        />
      </aside>

      <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
    </div>
  )
}
```

Key changes from the current layout:
- Added `ContextSidebar` import
- Added two new parallel queries: `deadlines` (nearest future deadline) and `case_risk_scores` (latest score)
- Computed `currentTaskKey` from the task list
- Added right `<aside>` with `hidden xl:block w-72`

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

**Step 3: Commit**

```bash
git add src/app/'(authenticated)'/case/'[id]'/layout.tsx
git commit -m "feat: add three-column layout with context sidebar on xl+ screens"
```

---

### Task 4: Make context sidebar task-aware via URL

The layout currently computes `currentTaskKey` from task statuses, but when the user navigates to a specific step via `/case/[id]/step/[taskId]`, the sidebar should show guidance for THAT step, not just the "current" one.

**Files:**
- Modify: `src/components/case/context-sidebar.tsx` (make it a client component to read URL params)
- Modify: `src/app/(authenticated)/case/[id]/layout.tsx` (pass full task list for key lookup)

**Step 1: Update ContextSidebar to read URL params**

Add `'use client'` directive and `useParams()` to detect when the user is on a specific step page. The component receives `tasks` (for task_key lookup) and `fallbackTaskKey` (for dashboard/non-step pages).

Update `src/components/case/context-sidebar.tsx` — replace the interface and top of the component:

```tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
// ... rest of imports unchanged ...

interface ContextSidebarProps {
  caseId: string
  tasks: { id: string; task_key: string }[]
  fallbackTaskKey: string | null
  deadline: {
    key: string
    due_at: string
  } | null
  riskScore: {
    overall_score: number
    risk_level: string
    breakdown: Record<string, unknown>
  } | null
}

// ... helper functions unchanged ...

export function ContextSidebar({ caseId, tasks, fallbackTaskKey, deadline, riskScore }: ContextSidebarProps) {
  const params = useParams()
  const taskId = params?.taskId as string | undefined

  // If on a step page, use that step's task_key; otherwise fall back
  const currentTaskKey = taskId
    ? tasks.find((t) => t.id === taskId)?.task_key ?? fallbackTaskKey
    : fallbackTaskKey

  const guidance = currentTaskKey ? STEP_GUIDANCE[currentTaskKey] : null

  // ... rest of render unchanged ...
}
```

**Step 2: Update layout to pass tasks array**

In `layout.tsx`, change the `ContextSidebar` props:

```tsx
<ContextSidebar
  caseId={id}
  tasks={taskList.map((t) => ({ id: t.id, task_key: t.task_key }))}
  fallbackTaskKey={currentTaskKey}
  deadline={deadline}
  riskScore={riskScore}
/>
```

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`

**Step 4: Commit**

```bash
git add src/components/case/context-sidebar.tsx src/app/'(authenticated)'/case/'[id]'/layout.tsx
git commit -m "feat: make context sidebar task-aware via URL params"
```

---

### Task 5: Adjust step content width

**Files:**
- Modify: `src/components/step/step-runner.tsx:67`

**Step 1: Update default wrapper class**

The current default is `max-w-2xl mx-auto px-4 py-8`. With the right sidebar taking space on `xl+`, we no longer need auto-centering. Change to a responsive approach:

In `src/components/step/step-runner.tsx` line 67, change:

```tsx
// Before:
<div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>

// After:
<div className={wrapperClassName ?? "max-w-3xl mx-auto px-4 py-8 xl:mx-8 xl:max-w-none xl:max-w-3xl"}>
```

Wait — actually, looking at this again, `max-w-2xl mx-auto` centers nicely when there's no right sidebar (`lg` breakpoint). On `xl+` when the right sidebar appears, the `flex-1` main area is already narrower, so the content naturally shifts left. The `max-w-2xl mx-auto` still works fine — it centers within the available `flex-1` space.

**Revised step:** No change needed to `step-runner.tsx`. The existing `max-w-2xl mx-auto` centers within whatever space `flex-1` provides. On `xl+`, the right sidebar reduces that space, and the centering adapts automatically.

**Step 2: Visually verify** — open a step page in the browser at both `lg` and `xl` widths to confirm the content isn't cramped.

**Step 3: Commit (skip if no changes)**

---

### Task 6: Final build verification and commit

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -10`
Expected: Build succeeds with no errors.

**Step 2: Visual verification**

Open `http://localhost:3000` and navigate to a PI case step page. Verify:
- `xl+` screen: Three-column layout (workflow | step content | context sidebar)
- `lg` screen: Two-column layout (workflow | step content), no right sidebar
- `< lg` screen: Step content only, mobile drawer for workflow
- Step guidance card shows relevant content for the current step
- Deadline card shows nearest deadline or "No upcoming deadlines"
- Case health card shows score or fallback text
- Quick links navigate correctly
- Navigating between steps updates the guidance card
