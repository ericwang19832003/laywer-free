# RAG Agent Enhancement Design

**Date:** 2026-06-16
**Status:** Approved

## Problem

The existing LangGraph-based agent advisor (`src/lib/ai/agent/`) can answer general legal questions and search CourtListener case law, but has no access to the user's actual uploaded documents. Extracted text from PDFs and images is discarded after structured field extraction. This limits the agent to generic legal advice rather than situated analysis of the user's specific evidence and filings.

## Goal

Enable the agent to read and reason over the user's own case documents — uploaded court filings, evidence items, and AI-generated documents — fused with applicable case law. The agent should be able to answer: "Based on my specific evidence and filings, how strong is my claim/motion?"

## Approach: Hybrid RAG (Option C)

Two retrieval tracks plus structured context injection:

1. **Case Document RAG** — vectorize user's uploaded documents into `case_document_chunks` (new pgvector table); agent searches via new `search_case_documents` tool
2. **Structured Case Context** — inject tasks, deadlines, evidence list, health score as JSON into agent system prompt on every invocation
3. **Case Law RAG** — existing CourtListener pipeline (`cl_opinion_chunks`) unchanged

## Model Strategy

| Task | Model | Reason |
|---|---|---|
| Agent reasoning | Claude Sonnet 4.6 | Handles sensitive user documents; strongest legal reasoning |
| PDF/image extraction | Claude Haiku 4.5 | Already in use; cheap and fast |
| Embeddings | OpenAI `text-embedding-3-small` | Already used for CourtListener; consistent 1536-dim |
| Court data refresh script | DeepSeek V3 | Dev-only; non-sensitive; cheap |

## Data Model

### New table: `case_document_chunks`

```sql
CREATE TABLE case_document_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
                 'court_document',
                 'evidence_item',
                 'generated_document'
               )),
  source_id   uuid NOT NULL,
  chunk_index int NOT NULL,
  content     text NOT NULL,
  embedding   vector(1536) NOT NULL,
  token_count int NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX ON case_document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX ON case_document_chunks (source_type, source_id);

ALTER TABLE case_document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_document_chunks_owner" ON case_document_chunks
  FOR ALL USING (
    case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
  );
```

### New field: `embedding_status`

Added to `court_documents` and `evidence_items` tables:

```sql
ALTER TABLE court_documents ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));

ALTER TABLE evidence_items ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));
```

`documents` table (generated docs) uses `content_text` directly — no file fetch needed, so status tracking is less critical but can be added for consistency.

## Ingestion Pipeline

```
Upload route (court_documents / evidence_items)
  └─► return upload response to user immediately
  └─► fire-and-forget: POST /api/cases/[id]/documents/embed
        └─► fetch file from Supabase storage
        └─► extract text (Claude Haiku — existing extractors)
        └─► chunk: 500 tokens, 50-token overlap, sentence boundaries
        └─► embed: OpenAI text-embedding-3-small (batch up to 100 chunks)
        └─► upsert: delete old chunks for source_id, insert new
        └─► update embedding_status → 'done' (or 'failed')

Generated document save (documents table)
  └─► content_text already available
  └─► fire-and-forget: POST /api/cases/[id]/documents/embed
        └─► chunk + embed content_text directly (no extraction needed)
        └─► upsert into case_document_chunks
```

Hook points in existing routes:
- `POST /api/cases/[id]/court-documents` — after upload success
- `POST /api/cases/[id]/evidence` — after upload success
- `POST /api/ai/demand-draft` and similar — after document saved to `documents`

## Agent Enhancements

### New tool: `search_case_documents`

Added to `src/lib/ai/agent/tools.ts`:

```typescript
search_case_documents({
  query: string,
  source_types?: Array<'court_document' | 'evidence_item' | 'generated_document'>,
  top_k?: number  // default 5
}) → {
  chunks: Array<{
    content: string,
    source_type: string,
    file_name: string,
    similarity: number
  }>
}
```

Runs pgvector cosine similarity search scoped to `case_id`. RLS enforces cross-case isolation at the DB level.

### Enhanced system prompt (`src/lib/ai/agent/graph.ts`)

Structured case context injected at invocation time:

```
CASE CONTEXT
Type: {dispute_type} | State: {jurisdiction} | Stage: {stage}
Health Score: {score}/100

TASKS ({total} total — {completed} complete, {remaining} remaining)
{task list with status and due dates}

DEADLINES
{deadline list with dates and days remaining}

EVIDENCE ({count} items)
{evidence list with file names and types}

Use search_case_documents to read the actual content of any file
before giving advice about it.
```

The agent knows what documents exist from the injected context and calls `search_case_documents` only when it needs to read content — avoiding unnecessary retrieval on every turn.

## Error Handling

| Failure | Behavior |
|---|---|
| Embedding fails on upload | `embedding_status = 'failed'`; upload still succeeds |
| No chunks found | Tool returns empty + "Document not yet indexed" note; agent informs user |
| OpenAI embedding API down | Retry 3× with exponential backoff; mark `failed` |
| Agent tool error | LangGraph continues; agent responds with partial information |

## Subscription Gating

No new gating infrastructure needed. `search_case_documents` is an internal agent tool — it inherits the existing `AgentAdvisorCard` gate (Pro/Essentials only).

Usage tracked in existing `ai_usage` table:
```
{ user_id, case_id, feature: 'document_embedding', tokens_used, model: 'text-embedding-3-small' }
```

## Cost Estimate

- **Embedding:** ~$0.0001–$0.00065 per document (negligible)
- **Storage:** ~$0.05/month per 1,000 active cases
- **Agent inference (dominant cost):** ~$0.05–$0.20 per session (Claude Sonnet 4.6)
- At 1,000 Pro users ($39K/mo revenue): AI costs ≈ 2.5% of revenue at high end

## What Is Not Changing

- CourtListener RAG pipeline (`cl_opinion_chunks`, `src/lib/courtlistener/`)
- Existing agent tools: `search_case_law`, `analyze_deadlines`, `review_evidence`, `draft_document`
- Subscription system and limits
- Auth / RLS patterns
- Extraction extractors (reused as-is)
