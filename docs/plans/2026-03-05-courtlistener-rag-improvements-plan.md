# CourtListener RAG Improvements Implementation Plan

**Date:** 2026-03-05
**Status:** Draft

## Scope

Full-stack, multi-phase redesign and implementation of the CourtListener RAG pipeline and research experience, targeting improved quality, coverage, latency (< 8s), and safety.

## Phase 1 — Backend Foundations

### 1.1 Data model + migrations
- Add `cl_opinion_chunks` metadata fields: `section_title`, `paragraph_start`, `paragraph_end`, `citation_count`, `contains_holding`, `tsv`.
- Add `cl_opinions` fields: `summary_text`, `issue_tags`.
- Add `cl_query_cache` for question/answer caching.
- Update seed data if needed.

**Files:**
- `supabase/migrations/*`
- `supabase/seed.sql`

### 1.2 Chunking + metadata extraction
- Update chunker to detect headings/sections and paragraph boundaries.
- Compute metadata and citation density per chunk.

**Files:**
- `src/lib/courtlistener/chunker.ts`

### 1.3 Hybrid retrieval + reranking
- Implement FTS query (tsvector) for chunk keyword matching.
- Merge vector + FTS results and rerank.
- Cap rerank candidates for latency.

**Files:**
- `src/lib/courtlistener/pipeline.ts`
- `src/lib/courtlistener/search.ts` (new)
- `src/lib/courtlistener/rerank.ts` (new)

### 1.4 Query expansion + authority weighting
- Expand question with case context and legal keyword map.
- Boost majority/lead opinions and higher courts.

**Files:**
- `src/lib/courtlistener/rag-prompts.ts`
- `src/lib/courtlistener/search.ts`

### 1.5 Safety validators
- Enforce claim-to-citation mapping.
- Detect and rewrite directive language.
- Refuse if support is insufficient.

**Files:**
- `src/lib/courtlistener/validators.ts` (new)
- `src/lib/courtlistener/rag-prompts.ts`

### 1.6 API updates
- Update search and ask endpoints for hybrid retrieval and caching.
- Add endpoints for authority detail and ask history.

**Files:**
- `src/app/api/cases/[id]/research/*`

## Phase 2 — Research UX Redesign

### 2.1 Research shell + navigation
- New left-nav or tabbed structure: Overview, Search, Authorities, Ask, History.

**Files:**
- `src/app/(authenticated)/case/[id]/research/*`
- `src/components/research/*`

### 2.2 Search UX
- Advanced filters (jurisdiction/court/date).
- Case-context query suggestions.
- Result cards with relevance cues.

**Files:**
- `src/components/research/search/*`

### 2.3 Authority review
- Save authority flow with quick review card.
- Show key holdings/snippets + issue tags.

**Files:**
- `src/components/research/authorities/*`

### 2.4 Ask UX
- Inline citation viewer.
- Coverage summary (courts, number of cases, age of cases).

**Files:**
- `src/components/research/ask/*`

## Phase 3 — Authority Workspace

- Tags/folders/pinning.
- Primary authorities weighting per case.
- Bulk remove and cleanup UX.

**Files:**
- `src/components/research/authorities/*`
- `supabase/migrations/*`

## Phase 4 — Performance + Reliability

- Precompute embeddings/summaries for top-used authorities.
- Aggressive caching for search + ask results.
- Metrics: latency, rerank hit rates, low-support refusals.

**Files:**
- `src/lib/courtlistener/*`
- `src/app/api/*`

## Phase 5 — Safety + Compliance Polish

- Expanded refusal reasons and UI messaging.
- Audit logs for answer + citation mapping.

**Files:**
- `src/lib/courtlistener/validators.ts`
- `src/components/research/ask/*`

## Testing Plan

- Unit tests for chunking, retrieval merge, and validators.
- RLS tests for authority scoping.
- E2E tests for Search → Save authority → Ask flow.

**Files:**
- `tests/unit/*`
- `tests/rls/*`
- `tests/e2e/*`

## Rollout

- Phase 1 merged behind feature flag for Ask pipeline.
- Phase 2 UI gating by route (new research shell).
- Phases 3–5 incremental, no breaking changes.
