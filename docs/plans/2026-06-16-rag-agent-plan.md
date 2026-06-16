# RAG Agent Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable the AI advisor to semantically search the user's own uploaded documents and receive rich structured case context, so it can answer case-specific questions like "how strong is my breach of contract claim given my evidence?"

**Architecture:** Two new tracks are added to the existing LangGraph agent: (1) a `case_document_chunks` pgvector table stores embedded text from user uploads, searched via a new `search_case_documents` tool; (2) the agent system prompt is extended to inject structured case metadata (tasks, deadlines, evidence list) on every invocation so the agent always knows what documents exist before calling the search tool.

**Tech Stack:** Anthropic SDK (Claude Sonnet 4.6 for agent, Haiku for extraction), OpenAI `text-embedding-3-small` (1536-dim), pgvector in Supabase, Next.js API routes, Vitest for unit tests.

**Design doc:** `docs/plans/2026-06-16-rag-agent-design.md`

---

### Task 1: Database migration — `case_document_chunks` table + RPC + `embedding_status` columns

**Files:**
- Create: `supabase/migrations/20260616000001_case_document_chunks.sql`

**Step 1: Write the migration**

```sql
-- supabase/migrations/20260616000001_case_document_chunks.sql

-- 1. New table for user document chunks
CREATE TABLE public.case_document_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id     uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
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

CREATE INDEX ON public.case_document_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

CREATE INDEX ON public.case_document_chunks (source_type, source_id);
CREATE INDEX ON public.case_document_chunks (case_id);

ALTER TABLE public.case_document_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "case_document_chunks_owner" ON public.case_document_chunks
  FOR ALL USING (
    case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
  );

-- 2. embedding_status tracking on upload tables
ALTER TABLE public.court_documents
  ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));

ALTER TABLE public.evidence_items
  ADD COLUMN embedding_status text NOT NULL DEFAULT 'pending'
  CHECK (embedding_status IN ('pending', 'processing', 'done', 'failed'));

-- 3. RPC for vector similarity search scoped to a single case
CREATE OR REPLACE FUNCTION public.match_case_documents(
  p_case_id       uuid,
  query_embedding vector(1536),
  match_count     int DEFAULT 5,
  source_types    text[] DEFAULT NULL
)
RETURNS TABLE (
  id          uuid,
  source_type text,
  source_id   uuid,
  chunk_index int,
  content     text,
  similarity  float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cdc.id,
    cdc.source_type,
    cdc.source_id,
    cdc.chunk_index,
    cdc.content,
    1 - (cdc.embedding <=> query_embedding) AS similarity
  FROM public.case_document_chunks cdc
  WHERE
    cdc.case_id = p_case_id
    AND (source_types IS NULL OR cdc.source_type = ANY(source_types))
  ORDER BY cdc.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_case_documents TO authenticated;
```

**Step 2: Apply migration to local Supabase**

```bash
cd "/Users/minwang/lawyer free"
npx supabase db reset
```

Expected: migrations apply without error, `case_document_chunks` table visible in Studio.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/20260616000001_case_document_chunks.sql
git commit -m "feat: add case_document_chunks table and match_case_documents RPC"
```

---

### Task 2: Embedding utility for user documents

**Files:**
- Create: `apps/web/src/lib/ai/embeddings.ts`
- Create: `apps/web/src/lib/ai/__tests__/embeddings.test.ts`

The CourtListener pipeline uses `text-embedding-3-large` (3072-dim). User documents use `text-embedding-3-small` (1536-dim) — cheaper and matches the new table's `vector(1536)`.

**Step 1: Write the failing test**

```typescript
// apps/web/src/lib/ai/__tests__/embeddings.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function (this: { embeddings: unknown }) {
    this.embeddings = {
      create: vi.fn().mockResolvedValue({
        data: [
          { embedding: new Array(1536).fill(0.1) },
          { embedding: new Array(1536).fill(0.2) },
        ],
      }),
    }
  }),
}))

import { generateDocumentEmbeddings, generateDocumentEmbedding } from '../embeddings'

describe('generateDocumentEmbeddings', () => {
  it('returns empty array for empty input', async () => {
    expect(await generateDocumentEmbeddings([])).toEqual([])
  })

  it('returns 1536-dim embeddings', async () => {
    const result = await generateDocumentEmbeddings(['hello', 'world'])
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveLength(1536)
  })
})

describe('generateDocumentEmbedding', () => {
  it('returns a single 1536-dim embedding', async () => {
    const result = await generateDocumentEmbedding('test text')
    expect(result).toHaveLength(1536)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/__tests__/embeddings.test.ts
```

Expected: FAIL with "Cannot find module '../embeddings'"

**Step 3: Write the implementation**

```typescript
// apps/web/src/lib/ai/embeddings.ts
import OpenAI from 'openai'

const DOCUMENT_EMBEDDING_MODEL = 'text-embedding-3-small'
const DOCUMENT_EMBEDDING_DIMENSIONS = 1536
const MAX_BATCH_SIZE = 100

export async function generateDocumentEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set')

  const openai = new OpenAI({ apiKey })
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)
    const response = await openai.embeddings.create({
      model: DOCUMENT_EMBEDDING_MODEL,
      dimensions: DOCUMENT_EMBEDDING_DIMENSIONS,
      input: batch,
    })
    for (const item of response.data) {
      embeddings.push(item.embedding)
    }
  }

  return embeddings
}

export async function generateDocumentEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateDocumentEmbeddings([text])
  return embedding
}

export { DOCUMENT_EMBEDDING_MODEL, DOCUMENT_EMBEDDING_DIMENSIONS }
```

**Step 4: Run tests to verify they pass**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/__tests__/embeddings.test.ts
```

Expected: all 3 tests PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/lib/ai/embeddings.ts apps/web/src/lib/ai/__tests__/embeddings.test.ts
git commit -m "feat: add text-embedding-3-small utility for user document embedding"
```

---

### Task 3: Case document embedder service

**Files:**
- Create: `apps/web/src/lib/ai/case-document-embedder.ts`
- Create: `apps/web/src/lib/ai/__tests__/case-document-embedder.test.ts`

This service: fetches file from Supabase storage → extracts text → chunks → embeds → upserts chunks → updates `embedding_status`.

**Step 1: Write the failing tests**

```typescript
// apps/web/src/lib/ai/__tests__/case-document-embedder.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')

vi.mock('../embeddings', () => ({
  generateDocumentEmbeddings: vi.fn().mockResolvedValue([new Array(1536).fill(0.1)]),
}))

vi.mock('@/lib/extraction/pdf-text', () => ({
  extractTextFromPdf: vi.fn().mockResolvedValue('extracted pdf text'),
}))

vi.mock('@/lib/extraction/ocr', () => ({
  extractTextFromImage: vi.fn().mockResolvedValue('extracted image text'),
}))

import { embedCaseDocument, type EmbedCaseDocumentParams } from '../case-document-embedder'

function makeSupabase(downloadData = new Uint8Array([1, 2, 3])) {
  const storage = {
    from: vi.fn().mockReturnValue({
      download: vi.fn().mockResolvedValue({
        data: new Blob([downloadData]),
        error: null,
      }),
    }),
  }
  const from = vi.fn().mockReturnValue({
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { file_name: 'contract.pdf' },
          error: null,
        }),
      }),
    }),
  })
  return { storage, from } as any
}

describe('embedCaseDocument', () => {
  it('returns done status on success for a PDF court document', async () => {
    const supabase = makeSupabase()
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'court_document',
      sourceId: 'doc-1',
      storagePath: 'cases/case-1/court-docs/doc-1',
      mimeType: 'application/pdf',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('done')
    expect(result.chunksInserted).toBeGreaterThan(0)
  })

  it('returns done status for an image evidence item', async () => {
    const supabase = makeSupabase()
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'evidence_item',
      sourceId: 'ev-1',
      storagePath: 'cases/case-1/evidence/ev-1',
      mimeType: 'image/jpeg',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('done')
  })

  it('returns failed status when storage download fails', async () => {
    const supabase = makeSupabase()
    supabase.storage.from = vi.fn().mockReturnValue({
      download: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
    })
    const params: EmbedCaseDocumentParams = {
      caseId: 'case-1',
      sourceType: 'court_document',
      sourceId: 'doc-1',
      storagePath: 'cases/case-1/court-docs/doc-1',
      mimeType: 'application/pdf',
      supabase,
    }
    const result = await embedCaseDocument(params)
    expect(result.status).toBe('failed')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/__tests__/case-document-embedder.test.ts
```

Expected: FAIL with "Cannot find module '../case-document-embedder'"

**Step 3: Write the implementation**

```typescript
// apps/web/src/lib/ai/case-document-embedder.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { chunkText } from '@/lib/courtlistener/chunker'
import { generateDocumentEmbeddings } from './embeddings'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'

export interface EmbedCaseDocumentParams {
  caseId: string
  sourceType: 'court_document' | 'evidence_item' | 'generated_document'
  sourceId: string
  storagePath: string
  mimeType: string
  supabase: SupabaseClient
  /** For generated_document: pass content directly to skip storage fetch */
  contentText?: string
}

export interface EmbedResult {
  status: 'done' | 'failed'
  chunksInserted: number
  error?: string
}

export async function embedCaseDocument(params: EmbedCaseDocumentParams): Promise<EmbedResult> {
  const { caseId, sourceType, sourceId, storagePath, mimeType, supabase, contentText } = params

  try {
    // 1. Get text content
    let text = ''
    if (contentText) {
      text = contentText
    } else {
      const { data: blob, error: downloadError } = await supabase.storage
        .from('case-documents')
        .download(storagePath)

      if (downloadError || !blob) {
        return { status: 'failed', chunksInserted: 0, error: downloadError?.message ?? 'Download failed' }
      }

      const buffer = await blob.arrayBuffer()

      if (mimeType === 'application/pdf') {
        text = await extractTextFromPdf(buffer)
      } else if (mimeType.startsWith('image/')) {
        text = await extractTextFromImage(buffer, mimeType)
      }
    }

    if (!text.trim()) {
      return { status: 'failed', chunksInserted: 0, error: 'No text extracted' }
    }

    // 2. Chunk
    const chunks = chunkText(text)
    if (chunks.length === 0) {
      return { status: 'failed', chunksInserted: 0, error: 'No chunks produced' }
    }

    // 3. Embed
    const texts = chunks.map((c) => c.content)
    const embeddings = await generateDocumentEmbeddings(texts)

    // 4. Upsert — delete old chunks for this source first
    await supabase
      .from('case_document_chunks')
      .delete()
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)

    const rows = chunks.map((chunk, i) => ({
      case_id: caseId,
      source_type: sourceType,
      source_id: sourceId,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      embedding: embeddings[i],
      token_count: Math.ceil(chunk.content.length / 4),
    }))

    const { error: insertError } = await supabase
      .from('case_document_chunks')
      .insert(rows)

    if (insertError) {
      return { status: 'failed', chunksInserted: 0, error: insertError.message }
    }

    return { status: 'done', chunksInserted: rows.length }
  } catch (err) {
    return {
      status: 'failed',
      chunksInserted: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
```

**Step 4: Check OCR export name** — verify `extractTextFromImage` is exported from `src/lib/extraction/ocr.ts`:

```bash
grep "export" "/Users/minwang/lawyer free/apps/web/src/lib/extraction/ocr.ts" | head -5
```

If the function name differs, update the import in `case-document-embedder.ts` to match.

**Step 5: Run tests to verify they pass**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/__tests__/case-document-embedder.test.ts
```

Expected: all 3 tests PASS

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/lib/ai/case-document-embedder.ts apps/web/src/lib/ai/__tests__/case-document-embedder.test.ts
git commit -m "feat: add case document embedder service (extract → chunk → embed → upsert)"
```

---

### Task 4: Embed API route

**Files:**
- Create: `apps/web/src/app/api/cases/[id]/documents/embed/route.ts`

This is the internal background endpoint called fire-and-forget from upload routes.

**Step 1: Write the route**

```typescript
// apps/web/src/app/api/cases/[id]/documents/embed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { embedCaseDocument } from '@/lib/ai/case-document-embedder'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params

    // Use service role client — this route is internal, called server-to-server
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json() as {
      sourceType: 'court_document' | 'evidence_item' | 'generated_document'
      sourceId: string
      storagePath?: string
      mimeType?: string
      contentText?: string
    }

    const { sourceType, sourceId, storagePath, mimeType, contentText } = body

    if (!sourceType || !sourceId) {
      return NextResponse.json({ error: 'sourceType and sourceId are required' }, { status: 422 })
    }

    // Update status to processing
    const statusTable = sourceType === 'court_document' ? 'court_documents'
      : sourceType === 'evidence_item' ? 'evidence_items'
      : null

    if (statusTable) {
      await supabase.from(statusTable).update({ embedding_status: 'processing' }).eq('id', sourceId)
    }

    const result = await embedCaseDocument({
      caseId,
      sourceType,
      sourceId,
      storagePath: storagePath ?? '',
      mimeType: mimeType ?? 'application/pdf',
      supabase,
      contentText,
    })

    // Update final status
    if (statusTable) {
      await supabase.from(statusTable).update({ embedding_status: result.status }).eq('id', sourceId)
    }

    // Track usage
    await supabase.from('ai_usage').insert({
      case_id: caseId,
      feature: 'document_embedding',
      model: 'text-embedding-3-small',
      tokens_used: result.chunksInserted * 500,
    }).throwOnError().catch(() => { /* non-critical */ })

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 2: Verify the route file exists**

```bash
ls "/Users/minwang/lawyer free/apps/web/src/app/api/cases/[id]/documents/"
```

**Step 3: Check `ai_usage` table columns**

```bash
grep -r "ai_usage" "/Users/minwang/lawyer free/supabase/migrations/" | grep "CREATE TABLE" | head -3
```

If `ai_usage` has a `user_id` NOT NULL column, add it to the insert using the service role — or omit if it's nullable. Adjust accordingly.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add "apps/web/src/app/api/cases/[id]/documents/embed/route.ts"
git commit -m "feat: add internal document embed API route"
```

---

### Task 5: Hook embed trigger into court-document upload route

**Files:**
- Modify: `apps/web/src/app/api/cases/[id]/court-documents/route.ts`

Add fire-and-forget embed call after successful insert. The response to the user is NOT delayed.

**Step 1: Add the trigger after the successful insert (after line 113, before `return NextResponse.json`)**

In `court-documents/route.ts`, locate the `// Write timeline event` block. After the `task_events` insert and before the `return NextResponse.json({ document }, { status: 201 })`, add:

```typescript
    // Fire-and-forget embedding (response not delayed)
    const embedUrl = new URL(`/api/cases/${caseId}/documents/embed`, request.url)
    fetch(embedUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType: 'court_document',
        sourceId: document.id,
        storagePath,
        mimeType: parsed.data.mime_type,
      }),
    }).catch(() => { /* non-critical background job */ })
```

**Step 2: Verify the file still typechecks**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add "apps/web/src/app/api/cases/[id]/court-documents/route.ts"
git commit -m "feat: trigger background document embedding on court document upload"
```

---

### Task 6: Hook embed trigger into evidence upload route

**Files:**
- Modify: `apps/web/src/app/api/cases/[id]/evidence/route.ts`

**Step 1: Read the evidence route to understand its structure**

```bash
cat "/Users/minwang/lawyer free/apps/web/src/app/api/cases/[id]/evidence/route.ts"
```

**Step 2: Add fire-and-forget embed call after the successful evidence insert**

Find the successful insert response (similar pattern to court-documents). Before `return NextResponse.json(...)`, add:

```typescript
    // Fire-and-forget embedding
    const embedUrl = new URL(`/api/cases/${caseId}/documents/embed`, request.url)
    fetch(embedUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType: 'evidence_item',
        sourceId: evidence.id,           // adjust variable name to match route
        storagePath: evidence.storage_path,
        mimeType: evidence.mime_type,
      }),
    }).catch(() => { /* non-critical */ })
```

**Step 3: Typecheck**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add "apps/web/src/app/api/cases/[id]/evidence/route.ts"
git commit -m "feat: trigger background document embedding on evidence upload"
```

---

### Task 7: New agent tool — `search_case_documents`

**Files:**
- Create: `apps/web/src/lib/ai/agent/tools/search-case-documents.ts`
- Create: `apps/web/src/lib/ai/agent/tools/__tests__/search-case-documents.test.ts`

**Step 1: Write the failing tests**

```typescript
// apps/web/src/lib/ai/agent/tools/__tests__/search-case-documents.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.stubEnv('OPENAI_API_KEY', 'test-key')

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function (this: { embeddings: unknown }) {
    this.embeddings = {
      create: vi.fn().mockResolvedValue({ data: [{ embedding: new Array(1536).fill(0.1) }] }),
    }
  }),
}))

function makeSupabase(rows: unknown[] = [], error: unknown = null) {
  return {
    rpc: vi.fn().mockResolvedValue({ data: rows, error }),
  } as any
}

import { createSearchCaseDocumentsTool } from '../search-case-documents'

describe('createSearchCaseDocumentsTool', () => {
  it('returns a tool named search_case_documents', () => {
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: makeSupabase() })
    expect(tool.name).toBe('search_case_documents')
  })

  it('passes caseId to the RPC', async () => {
    const supabase = makeSupabase([])
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    await tool.invoke({ query: 'breach of contract' })
    expect(supabase.rpc).toHaveBeenCalledWith('match_case_documents', expect.objectContaining({
      p_case_id: 'case-1',
    }))
  })

  it('returns formatted chunks when results are found', async () => {
    const rows = [
      { source_type: 'court_document', source_id: 'doc-1', content: 'The contract was signed on January 1.', similarity: 0.92 },
    ]
    const supabase = makeSupabase(rows)
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    const result = await tool.invoke({ query: 'contract date' })
    expect(result).toContain('court_document')
    expect(result).toContain('The contract was signed on January 1.')
  })

  it('returns not-indexed message when no chunks found', async () => {
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: makeSupabase([]) })
    const result = await tool.invoke({ query: 'anything' })
    expect(result).toContain('not yet indexed')
  })

  it('passes source_types filter when provided', async () => {
    const supabase = makeSupabase([])
    const tool = createSearchCaseDocumentsTool({ caseId: 'case-1', supabaseClient: supabase })
    await tool.invoke({ query: 'evidence', source_types: ['evidence_item'] })
    expect(supabase.rpc).toHaveBeenCalledWith('match_case_documents', expect.objectContaining({
      source_types: ['evidence_item'],
    }))
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/agent/tools/__tests__/search-case-documents.test.ts
```

Expected: FAIL with "Cannot find module '../search-case-documents'"

**Step 3: Write the implementation**

```typescript
// apps/web/src/lib/ai/agent/tools/search-case-documents.ts
import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentTool } from '../state'

interface SearchCaseDocumentsConfig {
  caseId: string
  supabaseClient: SupabaseClient
}

export function createSearchCaseDocumentsTool({ caseId, supabaseClient }: SearchCaseDocumentsConfig): AgentTool {
  return {
    name: 'search_case_documents',
    definition: {
      type: 'function',
      function: {
        name: 'search_case_documents',
        description:
          "Search the user's own uploaded case documents and evidence. Use when the user asks about their specific files, contracts, photos, letters, or any document they have uploaded. Always call this before giving advice about document contents.",
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What to search for in the case documents',
            },
            source_types: {
              type: 'array',
              items: { type: 'string', enum: ['court_document', 'evidence_item', 'generated_document'] },
              description: 'Optional: filter to specific document types',
            },
            top_k: {
              type: 'number',
              description: 'Number of results to return (default 5)',
            },
          },
          required: ['query'],
        },
      },
    },
    async invoke(args) {
      const query = String(args.query ?? '')
      const sourceTypes = Array.isArray(args.source_types) ? (args.source_types as string[]) : null
      const topK = typeof args.top_k === 'number' ? args.top_k : 5

      const embClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const embResponse = await embClient.embeddings.create({
        model: 'text-embedding-3-small',
        dimensions: 1536,
        input: query,
      })
      const embedding = embResponse.data[0].embedding

      const { data: chunks, error } = await supabaseClient.rpc('match_case_documents', {
        p_case_id: caseId,
        query_embedding: embedding,
        match_count: topK,
        source_types: sourceTypes,
      })

      if (error || !chunks?.length) {
        return 'No relevant content found in case documents. Documents may not yet be indexed — try again in a moment or ask the user to re-upload.'
      }

      type Chunk = { source_type: string; content: string; similarity: number }
      return (chunks as Chunk[])
        .map((chunk, i) => `[${i + 1}] (${chunk.source_type}, relevance: ${(chunk.similarity * 100).toFixed(0)}%)\n${chunk.content}`)
        .join('\n\n')
    },
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run src/lib/ai/agent/tools/__tests__/search-case-documents.test.ts
```

Expected: all 5 tests PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/lib/ai/agent/tools/search-case-documents.ts
git add "apps/web/src/lib/ai/agent/tools/__tests__/search-case-documents.test.ts"
git commit -m "feat: add search_case_documents agent tool with pgvector similarity search"
```

---

### Task 8: Extend CaseContext and system prompt

**Files:**
- Modify: `apps/web/src/lib/ai/agent/state.ts`
- Modify: `apps/web/src/lib/ai/agent/graph.ts`

**Step 1: Extend `CaseContext` in `state.ts`**

Add `evidenceItems` to the interface so the agent's system prompt can list file names:

```typescript
// In CaseContext interface, add:
evidenceItems: Array<{ id: string; file_name: string; source_type: 'court_document' | 'evidence_item' | 'generated_document' }>
```

Also add to `InitialStateInput`:

```typescript
evidenceItems: CaseContext['evidenceItems']
```

And in `createInitialState`:

```typescript
evidenceItems: input.evidenceItems,
```

**Step 2: Update `graph.ts` — system prompt and tool registration**

At the top of `graph.ts`, add import:

```typescript
import { createSearchCaseDocumentsTool } from './tools/search-case-documents'
```

In `buildTools()`, add the new tool:

```typescript
createSearchCaseDocumentsTool({
  caseId: caseContext.caseId ?? '',  // caseId is on AgentState — pass through config
  supabaseClient: config.supabaseClient,
}),
```

Since `caseId` is on `AgentState` not `CaseContext`, pass it through `BuildGraphConfig` or patch it similarly to how `draft_document` is patched. Simplest: add `caseId` field to `CaseContext`.

In `contextSummary`, replace the existing string with a richer version:

```typescript
const taskSummary = state.caseContext.tasks
  .map((t) => `  ${t.status === 'completed' ? '✓' : '→'} ${t.title} (${t.status})`)
  .join('\n')

const evidenceSummary = state.caseContext.evidenceItems.length > 0
  ? state.caseContext.evidenceItems
      .map((e) => `  • ${e.file_name} [${e.source_type}]`)
      .join('\n')
  : '  None uploaded yet'

const contextSummary =
  `CASE CONTEXT\n` +
  `Type: ${state.caseContext.disputeType} | Role: ${state.caseContext.role} | County: ${state.caseContext.county}\n` +
  `Health Score: ${state.caseContext.healthScore}/100\n\n` +
  `TASKS (${state.caseContext.tasks.length} total)\n${taskSummary}\n\n` +
  `UPLOADED DOCUMENTS AND EVIDENCE (${state.caseContext.evidenceItems.length} items)\n${evidenceSummary}\n\n` +
  `Use search_case_documents to read the actual content of any uploaded file before giving advice about it.`
```

Also add `search_case_documents` to the `SYSTEM_PROMPT` tool grounding rules:

```
- For any question about the user's specific documents, contracts, photos, letters, or evidence content: call search_case_documents with a relevant query before answering. Never assume file contents — always retrieve.
```

**Step 3: Typecheck**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit 2>&1 | head -30
```

Fix any type errors before proceeding (likely callers of `createInitialState` need `evidenceItems` added).

**Step 4: Find and update all callers of `createInitialState`**

```bash
grep -r "createInitialState" "/Users/minwang/lawyer free/apps/web/src" --include="*.ts" --include="*.tsx" -l
```

For each caller, add `evidenceItems: []` initially (they'll be wired to real data in the next step).

**Step 5: Typecheck again**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit 2>&1 | head -20
```

Expected: clean

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/lib/ai/agent/state.ts apps/web/src/lib/ai/agent/graph.ts
git commit -m "feat: extend CaseContext with evidenceItems and enrich agent system prompt"
```

---

### Task 9: Wire real evidence data into agent invocation

**Files:**
- Modify: the API route that invokes the agent (find via grep)

**Step 1: Find the agent invocation route**

```bash
grep -r "createInitialState\|buildAgentGraph" "/Users/minwang/lawyer free/apps/web/src/app" --include="*.ts" -l
```

**Step 2: In that route, fetch evidence items and pass them to `createInitialState`**

Add a Supabase query alongside existing case data fetching:

```typescript
const { data: evidenceItems } = await supabase
  .from('evidence_items')
  .select('id, file_name')
  .eq('case_id', caseId)
  .order('created_at', { ascending: false })

const { data: courtDocs } = await supabase
  .from('court_documents')
  .select('id, file_name')
  .eq('case_id', caseId)

const allEvidence = [
  ...(courtDocs ?? []).map((d) => ({ id: d.id, file_name: d.file_name, source_type: 'court_document' as const })),
  ...(evidenceItems ?? []).map((e) => ({ id: e.id, file_name: e.file_name, source_type: 'evidence_item' as const })),
]
```

Then pass `evidenceItems: allEvidence` to `createInitialState`.

**Step 3: Typecheck**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add -p  # stage only the agent invocation route changes
git commit -m "feat: wire real evidence and court document list into agent context"
```

---

### Task 10: Run full test suite and typecheck

**Step 1: Run all unit tests**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx vitest run
```

Expected: all existing tests still pass + new tests pass

**Step 2: Run typecheck**

```bash
cd "/Users/minwang/lawyer free/apps/web"
npx tsc --noEmit
```

Expected: clean

**Step 3: Build to verify no compile errors**

```bash
cd "/Users/minwang/lawyer free"
xcodebuild -project SpendSavvy.xcodeproj -scheme SpendSavvy -destination 'generic/platform=iOS Simulator' build 2>&1 | tail -5
# (this project is Next.js not Xcode — use Next.js build instead)
cd apps/web && npx next build 2>&1 | tail -20
```

**Step 4: Final commit if any fixes were needed**

```bash
cd "/Users/minwang/lawyer free"
git add -A
git commit -m "fix: resolve any typecheck or build issues after RAG agent integration"
```

---

## Summary of New Files

| File | Purpose |
|---|---|
| `supabase/migrations/20260616000001_case_document_chunks.sql` | DB table + RPC + status columns |
| `apps/web/src/lib/ai/embeddings.ts` | text-embedding-3-small utility |
| `apps/web/src/lib/ai/case-document-embedder.ts` | Extract → chunk → embed → upsert service |
| `apps/web/src/app/api/cases/[id]/documents/embed/route.ts` | Internal background embed endpoint |
| `apps/web/src/lib/ai/agent/tools/search-case-documents.ts` | New agent tool |

## Modified Files

| File | Change |
|---|---|
| `apps/web/src/app/api/cases/[id]/court-documents/route.ts` | Fire-and-forget embed trigger |
| `apps/web/src/app/api/cases/[id]/evidence/route.ts` | Fire-and-forget embed trigger |
| `apps/web/src/lib/ai/agent/state.ts` | Add `evidenceItems` to CaseContext |
| `apps/web/src/lib/ai/agent/graph.ts` | Register new tool + enrich system prompt |
| Agent invocation route | Pass real evidence list to createInitialState |
