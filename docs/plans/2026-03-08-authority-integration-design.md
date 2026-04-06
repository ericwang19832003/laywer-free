# Design: Authority Integration Into Guided Steps

**Date:** 2026-03-08
**Problem:** Saved authorities are isolated in the Research tab. Users can't see or cite them while working through guided steps (demand letter, petition, settlement negotiation).
**Approach:** Shared sidebar component + generate-filing API enhancement

## Component: `<StepAuthoritySidebar>`

Reusable collapsible panel that sits alongside any step form.

- Fetches saved authorities for the case (`case_authorities` joined with `cl_case_clusters`)
- Shows each authority as a compact card: case name, court, date, citation
- Two modes:
  - **Select mode** (demand letter, petition): checkboxes to include/exclude from generated draft. Pinned authorities pre-checked.
  - **Read-only mode** (settlement negotiation): displays authorities as reference material, no checkboxes.
- Empty state: "No saved cases yet. Use the Research tab to find relevant case law." with link.
- Collapsed by default on mobile, visible on desktop.

## Integration Points

### 1. Demand Letter (`pi-demand-letter-step.tsx`)
- Two-column layout: form left, sidebar right
- On "Generate Draft", selected `cluster_ids` sent to `generate-filing` API
- API weaves citations into draft text (e.g., "See *Rogers v. Penske Truck Leasing Co.*, 68 So. 3d 773.")

### 2. Petition (`personal-injury-wizard.tsx`)
- Same two-column layout pattern
- Selected authorities passed to `generate-filing` for petition generation

### 3. Settlement Negotiation (`pi-settlement-negotiation-step.tsx`)
- Sidebar in read-only mode
- Shows "Your saved cases" as reference while answering questions
- Helps users negotiate from a position of knowledge

## API Change: `generate-filing` endpoint

Add optional `authority_cluster_ids: number[]` parameter. When provided:
1. Fetch authority cluster metadata from `cl_case_clusters`
2. Fetch opinion text snippets from `cl_opinion_chunks` (if available) or `cl_case_clusters.snippet`
3. Include in LLM prompt as citation material with instruction to weave into draft

## Files

1. Create: `src/components/step/step-authority-sidebar.tsx` (shared sidebar component)
2. Modify: `src/components/step/personal-injury/pi-demand-letter-step.tsx` (add sidebar + pass authorities)
3. Modify: `src/components/step/personal-injury-wizard.tsx` (add sidebar + pass authorities)
4. Modify: `src/components/step/personal-injury/pi-settlement-negotiation-step.tsx` (add read-only sidebar)
5. Modify: `src/app/api/cases/[id]/generate-filing/route.ts` (accept + use authority_cluster_ids)
6. Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` (pass authorities data to steps)
