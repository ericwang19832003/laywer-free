# TurboTax-Style Workflow Sidebar

## Problem

Users have no overview of where they are in their case workflow. The dashboard only shows the single next task. There's no way to see completed steps, upcoming steps, or overall progress at a glance.

## Solution

A persistent left sidebar (like TurboTax's navigation) that shows the full workflow with phase groupings and step statuses. Visible on both the dashboard and step pages.

## Architecture

### Approach: Case Layout with Server-Side Sidebar

Create `src/app/(authenticated)/case/[id]/layout.tsx` that:
1. Fetches all tasks for the case from Supabase (server-side)
2. Fetches the case's `dispute_type` to determine phase groupings
3. Renders a two-column layout: sidebar + children
4. On mobile, sidebar becomes a collapsible drawer

### Phase Groupings

**Personal Injury:**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, pi_intake |
| Building Your Case | pi_medical_records, evidence_vault, pi_insurance_communication |
| Pre-Litigation | prepare_pi_demand_letter, pi_settlement_negotiation |
| Filing & Service | prepare_pi_petition, pi_file_with_court, pi_serve_defendant |
| Litigation | pi_wait_for_answer, pi_review_answer, pi_discovery_prep, pi_discovery_responses, pi_scheduling_conference, pi_pretrial_motions, pi_mediation, pi_trial_prep |
| Resolution | pi_post_resolution |

**Small Claims:**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, small_claims_intake |
| Building Your Case | evidence_vault, prepare_demand_letter |
| Filing & Service | prepare_small_claims_filing, file_with_court, serve_defendant |
| Hearing | prepare_for_hearing, hearing_day |

**Landlord-Tenant:**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, landlord_tenant_intake |
| Building Your Case | evidence_vault, prepare_lt_demand_letter |
| Filing & Service | prepare_landlord_tenant_filing, file_with_court, serve_other_party |
| Hearing | prepare_for_hearing, hearing_day |
| Resolution | post_judgment |

**Debt Defense:**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, debt_defense_intake |
| Building Your Case | evidence_vault, prepare_debt_validation_letter |
| Filing & Service | prepare_debt_defense_answer, debt_file_with_court, serve_plaintiff |
| Hearing | debt_hearing_prep, debt_hearing_day |
| Resolution | debt_post_judgment |

**Family:**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, family_intake, safety_screening |
| Building Your Case | evidence_vault |
| Filing & Service | prepare_family_filing, file_with_court, upload_return_of_service, confirm_service_facts |
| Process | waiting_period, temporary_orders, mediation |
| Resolution | final_orders |

**Civil (default):**
| Phase | Task Keys |
|-------|-----------|
| Getting Started | welcome, intake |
| Building Your Case | evidence_vault, preservation_letter |
| Filing & Service | prepare_filing, file_with_court, upload_return_of_service, confirm_service_facts |
| Post-Filing | wait_for_answer, check_docket_for_answer, upload_answer, default_packet_prep |
| Discovery | discovery_starter_pack, rule_26f_prep, mandatory_disclosures |

## Visual Design

### Desktop (lg+)
- Sidebar: `w-64` fixed left, full height below TopNav
- Content area: flex-1, scrollable
- Sidebar scrolls independently if content overflows

### Sidebar Content
- **Progress bar** at top: overall % complete
- **Phase sections**: collapsible, show phase name + step count (e.g., "2/3")
- **Steps within phase**:
  - Completed: green checkmark icon, muted text
  - Current (todo/in_progress/needs_review): indigo circle-dot, bold text, indigo left border highlight
  - Skipped: skip-forward icon, muted text, strikethrough
  - Locked: lock icon, gray text, not clickable
- Completed/active steps link to `/case/{id}/step/{taskId}`
- Current step auto-scrolled into view

### Mobile (< lg)
- Sidebar hidden by default
- Floating button (bottom-left) opens a slide-out drawer from the left
- Drawer overlays content with backdrop
- Same content as desktop sidebar

## Files

### New Files
1. `src/lib/workflow-phases.ts` - Phase definitions per dispute_type
2. `src/components/case/workflow-sidebar.tsx` - Sidebar UI component (client)
3. `src/components/case/mobile-sidebar-drawer.tsx` - Mobile drawer wrapper (client)
4. `src/app/(authenticated)/case/[id]/layout.tsx` - Case layout with data fetching

### Modified Files
5. `src/app/(authenticated)/case/[id]/page.tsx` - Remove max-w-2xl wrapper (layout handles width)
6. `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` - Remove wrapper padding

## Data Fetching

In the case layout (server component):
```sql
SELECT id, task_key, title, status
FROM tasks
WHERE case_id = $caseId
ORDER BY created_at ASC
```

Plus:
```sql
SELECT dispute_type FROM cases WHERE id = $caseId
```

Both queries run in the layout, results passed as props to sidebar.

## Edge Cases

- **Skipped tasks**: Show with skip icon, don't count toward progress denominator
- **Tasks not in any phase**: Some dynamically-added tasks (motions) may not be in the phase config — hide them from sidebar
- **Branching paths**: Some tasks may never appear (e.g., litigation tasks skipped if settled). Only show tasks that exist in the DB for this case.
