# Case Naming Design

**Date:** 2026-05-24  
**Status:** Approved

## Problem

Cases are created with no `description`, so the dashboard shows "Untitled Case" as a fallback everywhere. Users with multiple cases have no way to distinguish them at a glance.

## Solution

Add a "Name your case" step as the final step of `new-case-dialog.tsx`. Pre-fill the input with a smart auto-generated name derived from the dispute sub-type and current month/year. Users can edit or accept the default before creating the case.

## Design Decisions

### Where naming happens
Inside the creation dialog as a final step — not a post-creation prompt, not a silent auto-generate. The user sees and owns the name before the case exists.

### Auto-name format
`{SubTypeLabel} — {Mon YYYY}`  
Example: `Auto Accident — May 2026`

Fallback (no sub-type): `{DisputeTypeLabel} — {Mon YYYY}`  
Example: `Personal Injury — May 2026`

### Sub-type label lookup (client-side, no API)
All sub-type → human label mappings are encoded as a static lookup table in the dialog component.

### UI behavior
- Input is pre-filled and text is selected on mount (type to replace instantly)
- `✕` button clears to empty
- "Create Case" disabled when field is empty
- Max 80 characters
- No AI call — pure string construction

### Data storage
The name is sent as the `description` field on `POST /api/cases`. No schema changes needed — the column already exists.

### Existing "Untitled Case" rows
Not touched. The fallback display logic (`description || 'Untitled Case'`) remains unchanged. Renaming old cases is out of scope.

## Files in Scope

| File | Change |
|------|--------|
| `apps/web/src/components/cases/new-case-dialog.tsx` | Add naming step, auto-name generator, send `description` to API |
| `apps/web/src/app/api/cases/route.ts` | Verify `description` is accepted in `createCaseSchema` and passed to DB |

## Out of Scope
- Inline rename on the cases table dashboard
- Renaming existing "Untitled Case" entries
- AI-generated names
