# Trial Binder Build Pipeline v1 — Design

**Date:** 2026-02-24
**Status:** Approved

## Context

Self-represented litigants need a single downloadable ZIP that bundles their exhibits, timeline, deadlines, and a cover summary into a trial-ready binder. This pipeline takes an exhibit set and optional case data, assembles them into a structured ZIP, uploads it to Supabase Storage, and tracks status in the `trial_binders` table.

## Endpoints

### POST `/api/cases/[id]/binders`

Creates a `trial_binders` row with `status='queued'`.

**Body:**
```json
{
  "exhibit_set_id": "uuid",
  "title": "string (optional, default 'Trial Binder')",
  "options": {
    "include_timeline": false,
    "include_deadlines": false,
    "include_all_evidence": false,
    "include_discovery": false
  }
}
```

**Returns:** `{ binder }` with 201.

### POST `/api/binders/[binderId]/build`

Runs the build synchronously. Guard: only builds if `status='queued'`.

**Steps:**
1. Set `status='building'`
2. Load exhibit_set + exhibits (by sort_order) + evidence_items
3. Load optional data based on options (timeline, deadlines, discovery)
4. Generate files in memory:
   - `01_Binder_Summary.pdf` — cover page, TOC, exhibit index (pdf-lib)
   - `02_Exhibit_List.csv` — Exhibit No, Title, File Name, Category, Notes
   - `03_Timeline.json` — task_events array (optional)
   - `04_Deadlines.csv` — Key, Due Date, Source, Rationale (optional)
5. Download exhibit files from storage into `05_Exhibits/Exhibit_XXX_<safe_title>.<ext>`
6. ZIP with archiver (zlib level 5)
7. Upload to `cases/{case_id}/binders/{binder_id}/trial_binder.zip`
8. Compute SHA256, update row: `status='ready'`, `storage_path`, `sha256`
9. Insert `task_event` kind `trial_binder_generated`

**On failure:** `status='failed'`, `error` message, `task_event` kind `trial_binder_failed`.

## ZIP Structure

```
trial_binder.zip
├── 01_Binder_Summary.pdf
├── 02_Exhibit_List.csv
├── 03_Timeline.json          (if include_timeline)
├── 04_Deadlines.csv          (if include_deadlines)
└── 05_Exhibits/
    ├── Exhibit_001_Contract.pdf
    ├── Exhibit_002_Photo.jpg
    └── ...
```

## Files to Create/Modify

1. `supabase/migrations/20260224000002_trial_binders_update_policy.sql`
2. `src/lib/schemas/trial-binders.ts`
3. `src/app/api/cases/[id]/binders/route.ts`
4. `src/app/api/binders/[binderId]/build/route.ts`
5. `package.json` — move pdf-lib to dependencies

## Key Decisions

- **Synchronous build** — no background jobs for v1
- **pdf-lib** moved to runtime dependencies for PDF generation
- **RLS UPDATE policy** added so owner can transition status
- **Safe filenames** — strip non-alphanumeric, truncate 50 chars, pad exhibit_no to 3 digits
