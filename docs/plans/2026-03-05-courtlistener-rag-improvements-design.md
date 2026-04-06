# CourtListener RAG Improvements Design

**Date:** 2026-03-05
**Status:** Draft

## Goal

Improve CourtListener RAG quality, coverage, latency (under 8 seconds), and safety, while accepting higher storage cost for better retrieval performance.

## Summary of Changes

- Upgrade chunking to semantic/section-aware splits.
- Add hybrid retrieval (vector + keyword/FTS) with lightweight reranking.
- Strengthen safety gates and enforce claim-to-citation mapping.
- Add query + answer caching keyed to case context and authorities.
- Store richer chunk metadata and optional opinion summaries/issue tags.

## Architecture (Combined Plan)

### Ask Flow (high level)

1. Embed question (with case-context expansion).
2. Hybrid retrieve scoped to case authorities:
   - Top vector hits
   - Top FTS hits
3. Merge + dedupe + rerank (cap 30-40 chunks).
4. Draft answer with strict citations.
5. Validate each sentence against chunk support; rewrite or refuse if unsupported.
6. Cache response keyed by question + authorities + case context.

### Latency Strategy

- Cache embeddings and top-k retrieval results per case.
- Cache final answers for 12-24 hours.
- Cap rerank candidates and token budgets for the answer prompt.

## Retrieval and Chunking

### Chunking Upgrades

- Prefer section/heading boundaries ("I.", "II.", "FACTS", "ANALYSIS", "HOLDING").
- Preserve paragraph boundaries with 1-2 paragraph overlap.
- Target 300-600 tokens per chunk.
- Add chunk metadata: section title, paragraph range, citation density, and holding flags.

### Hybrid Retrieval

- Vector search over `cl_opinion_chunks.embedding`.
- Keyword/FTS search over `cl_opinion_chunks.tsv`.
- Merge and dedupe by opinion + chunk range, then rerank.

### Reranking

- Small cross-encoder or lightweight LLM reranker.
- Keep top 8-10 for final prompt to stay under 8 seconds.

### Query Expansion

- Auto-expand user question with case context: dispute type, role, jurisdiction.
- Legal keyword expansion: e.g., "summary judgment" ↔ "no genuine issue of material fact".

### Authority Weighting

- Boost majority/lead opinions, higher courts, and more recent cases.
- Optional "include dissents" toggle.

## Safety and Validation

- Enforce claim-to-citation mapping per sentence.
- Block or rewrite directive language into informational phrasing.
- Return "insufficient support" response when fewer than 3 relevant chunks or low confidence.
- Persist prompt + chunk set + citation mapping in `ai_cache`.

## Data Model Updates

### `cl_opinion_chunks`

Add columns:
- `section_title` (text)
- `paragraph_start` (int)
- `paragraph_end` (int)
- `citation_count` (int)
- `contains_holding` (boolean)
- `tsv` (tsvector)

### `cl_opinions`

Add columns:
- `summary_text` (text, optional)
- `issue_tags` (text[], optional)

### `cl_query_cache`

New table:
- `query_hash` (text)
- `question` (text)
- `case_id` (uuid)
- `authorities_hash` (text)
- `response` (jsonb)
- `chunks_used` (jsonb)
- `expires_at` (timestamptz)
- `created_at` (timestamptz)

## Pipeline Updates

### Opinion Ingest

1. Fetch opinion text.
2. Detect sections and paragraphs.
3. Chunk + compute metadata.
4. Generate embeddings.
5. Build FTS vector (`tsv`).
6. Optionally generate summary + issue tags async.

### Ask

1. Check response cache.
2. Hybrid retrieval + rerank.
3. Draft answer with citations.
4. Validate and rewrite if needed.
5. Store response + mapping in cache.

## Open Questions

- Which reranker model best fits the latency budget?
- Do we want summaries/issue tags on all opinions or only top-used clusters?
- Should the cache key include a time window to prevent stale case law emphasis?
