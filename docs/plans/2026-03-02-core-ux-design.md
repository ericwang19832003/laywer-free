# Core UX Polish: Top Nav, Search, Breadcrumbs, PDF Export, Settings & Help

**Date:** 2026-03-02
**Status:** Approved

## Goal

Add the Core UX features that make the app feel complete and professional: persistent top navigation bar with breadcrumbs, command palette search (Cmd+K), PDF/print export for generated documents, and settings/help pages.

## Architecture

The app currently has no global navigation — users navigate via inline links. We add a persistent TopNav component rendered by an authenticated route group layout. The nav houses breadcrumbs (auto-derived from URL), a command palette search (Cmd+K overlay), and a user menu dropdown (Settings, Help, Sign Out). PDF export is added to DraftViewer using pdf-lib (already a dependency). Settings uses Supabase auth metadata (no new tables). Help is a static FAQ page.

## Approach: Integrated Top Bar

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  Lawyer Free          Cases > Case Name > Step      🔍  👤      │
│  (home link)          (breadcrumbs)               search  menu  │
└──────────────────────────────────────────────────────────────────┘
│                                                                  │
│              [existing page content, max-w-4xl centered]         │
│                                                                  │
```

- Fixed at top, full-width warm-bg with subtle bottom border
- Inner content constrained to max-w-4xl
- Height: h-14 (56px)
- Only shown on authenticated pages

### Route Group

Create `src/app/(authenticated)/layout.tsx` that wraps all auth-required routes with TopNav. Move:
- `/cases` → `/(authenticated)/cases`
- `/case/[id]/**` → `/(authenticated)/case/[id]/**`
- `/settings` → `/(authenticated)/settings`
- `/help` → `/(authenticated)/help`

Login/signup pages stay outside the group (no TopNav).

### Breadcrumbs

- Client component using `usePathname()` + `useParams()`
- Static mapping for route patterns
- Case name fetched via lightweight API or context
- Styled: text-sm, warm-muted for links, warm-text for current
- Separator: chevron icon

### Command Palette Search

- Triggered by search icon click or Cmd+K / Ctrl+K
- Modal overlay with input, grouped results (Cases, Tasks, Documents, Deadlines)
- Keyboard navigation (arrows + Enter)
- API: `/api/search` using Supabase `ilike` queries across tables
- Shows recent items when empty

### PDF Export

- "Download PDF" + "Print" buttons added to DraftViewer
- PDF generated client-side using pdf-lib
- US Letter, Times New Roman, 1" margins
- "DRAFT — NOT LEGAL ADVICE" footer watermark
- Page numbers
- Reuses text-wrapping from existing generate-summary-pdf.ts
- Print styles in globals.css (@media print)

### Settings Page (/settings)

3 tabs:
1. **Profile** — email (read-only), display name (stored in Supabase auth metadata)
2. **Preferences** — placeholder for theme, notification toggles
3. **Account** — change password, sign out, delete account

No new database table — uses `auth.users.raw_user_meta_data`.

### Help Page (/help)

- Static FAQ accordion
- Sections: Getting Started, Tasks, Filing, Evidence, Discovery, Motions, Common Questions
- 3-5 Q&A per section
- Link to external resources (Texas courts self-help)

## Components

| Component | Path | Type |
|-----------|------|------|
| TopNav | `src/components/layout/top-nav.tsx` | Client |
| Breadcrumbs | `src/components/layout/breadcrumbs.tsx` | Client |
| CommandPalette | `src/components/search/command-palette.tsx` | Client |
| UserMenu | `src/components/layout/user-menu.tsx` | Client |
| DraftViewer (modified) | `src/components/step/filing/draft-viewer.tsx` | Client |
| PDF generator | `src/lib/pdf/generate-document-pdf.ts` | Util |
| Settings page | `src/app/(authenticated)/settings/page.tsx` | Server |
| Help page | `src/app/(authenticated)/help/page.tsx` | Server |
| Search API | `src/app/api/search/route.ts` | API |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Deep nested pages | Breadcrumbs truncate middle segments on mobile |
| No search results | Show "No results found" message |
| Empty search | Show 5 most recently accessed items |
| PDF with very long documents | Multi-page with proper page breaks |
| Unauthenticated user hits /settings | Middleware redirects to /login |
| User has no display name set | Show email in user menu |
