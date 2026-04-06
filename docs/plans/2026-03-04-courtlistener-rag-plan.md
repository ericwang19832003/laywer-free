# CourtListener Case Discovery + RAG Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Enable case-contextual legal research via CourtListener Search API + pgvector RAG, so users can discover precedent, save authorities, and ask AI-backed legal questions with real case citations.

**Architecture:** Thin Proxy + Lazy RAG. Search results are cached and proxied through the backend. Full opinions are fetched only when a user saves a case as authority. Text is chunked and embedded into pgvector. RAG answers use cosine similarity to retrieve relevant chunks, then Claude generates cited responses.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase pgvector, OpenAI text-embedding-3-large (3072 dims), Anthropic Claude, Zod, vitest

---

## Task 1: Migration — pgvector Extension + CourtListener Tables

**Files:**
- Create: `supabase/migrations/20260304100001_courtlistener_tables.sql`

**SQL:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Cached CourtListener cluster metadata (shared, no RLS)
CREATE TABLE public.cl_case_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id integer NOT NULL UNIQUE,
  case_name text NOT NULL,
  court_id text,
  court_name text,
  date_filed date,
  citations jsonb DEFAULT '[]'::jsonb,
  snippet text,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cl_clusters_last_used ON public.cl_case_clusters (last_used_at DESC);

-- Cached full opinion text (shared, no RLS)
CREATE TABLE public.cl_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id integer NOT NULL REFERENCES public.cl_case_clusters(cluster_id) ON DELETE CASCADE,
  opinion_id integer NOT NULL UNIQUE,
  opinion_type text NOT NULL DEFAULT 'majority',
  plain_text text NOT NULL,
  retrieved_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cl_opinions_cluster ON public.cl_opinions (cluster_id);

-- RAG chunks with embeddings (shared, no RLS)
CREATE TABLE public.cl_opinion_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id uuid NOT NULL REFERENCES public.cl_opinions(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  char_start integer NOT NULL,
  char_end integer NOT NULL,
  embedding extensions.vector(3072),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, chunk_index)
);

CREATE INDEX idx_cl_chunks_opinion ON public.cl_opinion_chunks (opinion_id);

-- Links user cases to CL clusters (RLS: user's cases only)
CREATE TABLE public.case_authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  cluster_id integer NOT NULL REFERENCES public.cl_case_clusters(cluster_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(case_id, cluster_id)
);

CREATE INDEX idx_case_authorities_case ON public.case_authorities (case_id);

ALTER TABLE public.case_authorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own case authorities"
  ON public.case_authorities FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_authorities.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Users can insert own case authorities"
  ON public.case_authorities FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_authorities.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Users can update own case authorities"
  ON public.case_authorities FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_authorities.case_id AND cases.user_id = auth.uid()));

CREATE POLICY "Users can delete own case authorities"
  ON public.case_authorities FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.cases WHERE cases.id = case_authorities.case_id AND cases.user_id = auth.uid()));

-- TTL-based search result cache (shared, no RLS)
CREATE TABLE public.cl_search_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash text NOT NULL UNIQUE,
  query_text text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cl_search_cache_expiry ON public.cl_search_cache (expires_at);

-- pgvector similarity search function
CREATE OR REPLACE FUNCTION match_opinion_chunks(
  query_embedding extensions.vector(3072),
  match_count integer DEFAULT 8,
  filter_case_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  opinion_id uuid,
  chunk_index integer,
  content text,
  char_start integer,
  char_end integer,
  similarity float,
  cl_opinion_id integer,
  cluster_id integer,
  case_name text,
  court_name text,
  date_filed date,
  opinion_type text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.opinion_id,
    c.chunk_index,
    c.content,
    c.char_start,
    c.char_end,
    1 - (c.embedding <=> query_embedding) AS similarity,
    o.opinion_id AS cl_opinion_id,
    cl.cluster_id,
    cl.case_name,
    cl.court_name,
    cl.date_filed,
    o.opinion_type
  FROM public.cl_opinion_chunks c
  JOIN public.cl_opinions o ON o.id = c.opinion_id
  JOIN public.cl_case_clusters cl ON cl.cluster_id = o.cluster_id
  WHERE c.embedding IS NOT NULL
    AND (filter_case_id IS NULL OR EXISTS (
      SELECT 1 FROM public.case_authorities ca
      WHERE ca.cluster_id = cl.cluster_id AND ca.case_id = filter_case_id
    ))
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Note:** The IVFFlat index on `cl_opinion_chunks.embedding` should be created after there are at least 1000 rows. For now, pgvector will use sequential scan which is fine for small datasets. Add the index later:
```sql
CREATE INDEX idx_cl_chunks_embedding ON public.cl_opinion_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## Task 2: CourtListener API Client (TDD)

**Pattern:** Follows the external API call pattern from `evidence/categorize/route.ts`.

**Files:**
- Create: `src/lib/courtlistener/client.ts`
- Create: `src/lib/courtlistener/types.ts`
- Create: `tests/unit/courtlistener/client.test.ts`

### Types

```typescript
// src/lib/courtlistener/types.ts

export interface CLSearchFilters {
  jurisdiction?: string
  court?: string
  filed_after?: string   // YYYY-MM-DD
  filed_before?: string  // YYYY-MM-DD
}

export interface CLSearchResult {
  cluster_id: number
  case_name: string
  court_id: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

export interface CLClusterDetail {
  id: number
  case_name: string
  court_id: string
  court: string          // full court name
  date_filed: string
  citations: string[]
  sub_opinions: { id: number; type: string }[]
}

export interface CLOpinionDetail {
  id: number
  cluster_id: number
  type: string           // "010combined" = majority, "030concurrence", "040dissent"
  plain_text: string
  html_with_citations: string
}

export const OPINION_TYPE_MAP: Record<string, string> = {
  '010combined': 'majority',
  '020lead': 'majority',
  '025plurality': 'plurality',
  '030concurrence': 'concurring',
  '040dissent': 'dissenting',
  '050addendum': 'addendum',
  '060remittitur': 'remittitur',
  '070rehearing': 'rehearing',
  '080on-motion': 'on-motion',
  '090per-curiam': 'per-curiam',
}
```

### Client

```typescript
// src/lib/courtlistener/client.ts

import type { CLSearchFilters, CLSearchResult, CLClusterDetail, CLOpinionDetail, OPINION_TYPE_MAP } from './types'

const BASE_URL = 'https://www.courtlistener.com/api/rest/v4'
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 1000

export class CourtListenerClient {
  private token: string | null

  constructor(token?: string) {
    this.token = token ?? process.env.COURTLISTENER_API_TOKEN ?? null
  }

  private async fetch(path: string, params?: Record<string, string>): Promise<unknown> {
    const url = new URL(`${BASE_URL}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v)
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`
    }

    let lastError: Error | null = null
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await globalThis.fetch(url.toString(), { headers })

        if (res.status === 429) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
          await new Promise((r) => setTimeout(r, backoff))
          continue
        }

        if (!res.ok) {
          throw new Error(`CourtListener API error: ${res.status} ${res.statusText}`)
        }

        return await res.json()
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        if (attempt < MAX_RETRIES - 1) {
          const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
          await new Promise((r) => setTimeout(r, backoff))
        }
      }
    }

    throw lastError ?? new Error('CourtListener API request failed')
  }

  async search(query: string, filters?: CLSearchFilters): Promise<CLSearchResult[]> {
    const params: Record<string, string> = {
      q: query,
      type: 'o',              // opinions
      order_by: 'score desc',
      format: 'json',
    }

    if (filters?.court) params.court = filters.court
    if (filters?.filed_after) params.filed_after = filters.filed_after
    if (filters?.filed_before) params.filed_before = filters.filed_before

    const data = await this.fetch('/search/', params) as {
      results: Array<{
        cluster_id: number
        caseName: string
        court_id: string
        court: string
        dateFiled: string
        citation: string[]
        snippet: string
      }>
    }

    return (data.results ?? []).slice(0, 10).map((r) => ({
      cluster_id: r.cluster_id,
      case_name: r.caseName ?? 'Unknown Case',
      court_id: r.court_id ?? '',
      court_name: r.court ?? '',
      date_filed: r.dateFiled ?? '',
      citations: r.citation ?? [],
      snippet: r.snippet ?? '',
    }))
  }

  async getCluster(clusterId: number): Promise<CLClusterDetail> {
    const data = await this.fetch(`/clusters/${clusterId}/`, { format: 'json' }) as {
      id: number
      case_name: string
      court_id: string
      court: string
      date_filed: string
      citations: Array<{ reporter: string; volume: number; page: string }>
      sub_opinions: Array<{ id: number; type: string }>
    }

    return {
      id: data.id,
      case_name: data.case_name ?? 'Unknown',
      court_id: data.court_id ?? '',
      court: data.court ?? '',
      date_filed: data.date_filed ?? '',
      citations: (data.citations ?? []).map((c) => `${c.volume} ${c.reporter} ${c.page}`),
      sub_opinions: (data.sub_opinions ?? []).map((o) => ({
        id: typeof o === 'object' ? o.id : Number(o),
        type: typeof o === 'object' ? (o.type ?? 'majority') : 'majority',
      })),
    }
  }

  async getOpinion(opinionId: number): Promise<CLOpinionDetail> {
    const data = await this.fetch(`/opinions/${opinionId}/`, { format: 'json' }) as {
      id: number
      cluster_id: number
      type: string
      plain_text: string
      html_with_citations: string
    }

    return {
      id: data.id,
      cluster_id: data.cluster_id,
      type: data.type ?? '010combined',
      plain_text: data.plain_text ?? '',
      html_with_citations: data.html_with_citations ?? '',
    }
  }
}

// Singleton for route handlers
let _client: CourtListenerClient | null = null
export function getCourtListenerClient(): CourtListenerClient {
  if (!_client) {
    _client = new CourtListenerClient()
  }
  return _client
}
```

### Tests (8 tests)

```typescript
// tests/unit/courtlistener/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourtListenerClient } from '@/lib/courtlistener/client'

describe('CourtListenerClient', () => {
  let client: CourtListenerClient

  beforeEach(() => {
    client = new CourtListenerClient('test-token')
    vi.restoreAllMocks()
  })

  describe('search', () => {
    it('returns mapped results from CL API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{
            cluster_id: 123,
            caseName: 'Smith v. Jones',
            court_id: 'ca5',
            court: '5th Circuit',
            dateFiled: '2021-03-15',
            citation: ['500 F.3d 100'],
            snippet: 'landlord failure...',
          }],
        }),
      } as Response)

      const results = await client.search('landlord security deposit')
      expect(results).toHaveLength(1)
      expect(results[0].cluster_id).toBe(123)
      expect(results[0].case_name).toBe('Smith v. Jones')
      expect(results[0].court_name).toBe('5th Circuit')
    })

    it('limits results to 10', async () => {
      const many = Array.from({ length: 20 }, (_, i) => ({
        cluster_id: i, caseName: `Case ${i}`, court_id: '', court: '', dateFiled: '', citation: [], snippet: '',
      }))
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true, status: 200, json: async () => ({ results: many }),
      } as Response)

      const results = await client.search('test')
      expect(results).toHaveLength(10)
    })

    it('passes filters as query params', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true, status: 200, json: async () => ({ results: [] }),
      } as Response)

      await client.search('test', { court: 'scotus', filed_after: '2020-01-01' })
      const url = new URL(fetchSpy.mock.calls[0][0] as string)
      expect(url.searchParams.get('court')).toBe('scotus')
      expect(url.searchParams.get('filed_after')).toBe('2020-01-01')
    })

    it('includes auth header when token provided', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true, status: 200, json: async () => ({ results: [] }),
      } as Response)

      await client.search('test')
      const headers = (vi.mocked(globalThis.fetch).mock.calls[0][1] as RequestInit).headers as Record<string, string>
      expect(headers['Authorization']).toBe('Token test-token')
    })
  })

  describe('retry logic', () => {
    it('retries on 429 with backoff', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' } as Response)
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ results: [] }) } as Response)

      const results = await client.search('test')
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(results).toEqual([])
    })

    it('throws after max retries', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false, status: 500, statusText: 'Server Error',
      } as Response)

      await expect(client.search('test')).rejects.toThrow('CourtListener API error: 500')
    })
  })

  describe('getCluster', () => {
    it('returns cluster detail with sub_opinions', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => ({
          id: 123, case_name: 'Smith v. Jones', court_id: 'ca5', court: '5th Cir',
          date_filed: '2021-03-15', citations: [{ reporter: 'F.3d', volume: 500, page: '100' }],
          sub_opinions: [{ id: 456, type: '010combined' }],
        }),
      } as Response)

      const cluster = await client.getCluster(123)
      expect(cluster.case_name).toBe('Smith v. Jones')
      expect(cluster.citations).toEqual(['500 F.3d 100'])
      expect(cluster.sub_opinions).toHaveLength(1)
    })
  })

  describe('getOpinion', () => {
    it('returns opinion with plain_text', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => ({
          id: 456, cluster_id: 123, type: '010combined',
          plain_text: 'The court holds that...', html_with_citations: '<p>The court holds that...</p>',
        }),
      } as Response)

      const opinion = await client.getOpinion(456)
      expect(opinion.plain_text).toContain('The court holds')
      expect(opinion.cluster_id).toBe(123)
    })
  })
})
```

---

## Task 3: Text Chunking Utility (TDD)

**Files:**
- Create: `src/lib/courtlistener/chunker.ts`
- Create: `tests/unit/courtlistener/chunker.test.ts`

### Implementation

```typescript
// src/lib/courtlistener/chunker.ts

export interface TextChunk {
  content: string
  char_start: number
  char_end: number
  chunk_index: number
}

const TARGET_CHUNK_TOKENS = 500
const OVERLAP_TOKENS = 50
// Rough heuristic: 1 token ≈ 4 characters for English text
const CHARS_PER_TOKEN = 4
const TARGET_CHUNK_CHARS = TARGET_CHUNK_TOKENS * CHARS_PER_TOKEN  // 2000
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN             // 200

export function chunkText(text: string): TextChunk[] {
  if (!text || text.trim().length === 0) return []

  const chunks: TextChunk[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    let end = Math.min(start + TARGET_CHUNK_CHARS, text.length)

    // Try to break at sentence boundary (. ! ? followed by space or newline)
    if (end < text.length) {
      const searchStart = Math.max(end - 200, start)
      const window = text.slice(searchStart, end)
      const sentenceBreak = window.search(/[.!?]\s(?=[A-Z])/g)
      if (sentenceBreak !== -1) {
        // Find the LAST sentence boundary in the window
        let lastBreak = -1
        const regex = /[.!?]\s/g
        let match
        while ((match = regex.exec(window)) !== null) {
          lastBreak = match.index
        }
        if (lastBreak !== -1) {
          end = searchStart + lastBreak + 2 // include the period and space
        }
      }
    }

    const content = text.slice(start, end).trim()
    if (content.length > 0) {
      chunks.push({
        content,
        char_start: start,
        char_end: end,
        chunk_index: index,
      })
      index++
    }

    // Advance with overlap
    start = end - OVERLAP_CHARS
    if (start <= chunks[chunks.length - 1]?.char_start) {
      start = end // prevent infinite loop
    }
  }

  return chunks
}
```

### Tests (6 tests)

```typescript
// tests/unit/courtlistener/chunker.test.ts
import { describe, it, expect } from 'vitest'
import { chunkText, type TextChunk } from '@/lib/courtlistener/chunker'

describe('chunkText', () => {
  it('returns empty array for empty text', () => {
    expect(chunkText('')).toEqual([])
    expect(chunkText('   ')).toEqual([])
  })

  it('returns single chunk for short text', () => {
    const text = 'The court finds in favor of the plaintiff.'
    const chunks = chunkText(text)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].content).toBe(text)
    expect(chunks[0].chunk_index).toBe(0)
    expect(chunks[0].char_start).toBe(0)
  })

  it('splits long text into multiple chunks', () => {
    // Create text > 2000 chars
    const sentence = 'The court holds that this principle applies broadly. '
    const text = sentence.repeat(50) // ~2600 chars
    const chunks = chunkText(text)
    expect(chunks.length).toBeGreaterThan(1)
  })

  it('chunks have sequential indices', () => {
    const text = 'A'.repeat(5000)
    const chunks = chunkText(text)
    chunks.forEach((chunk, i) => {
      expect(chunk.chunk_index).toBe(i)
    })
  })

  it('chunks have valid char_start and char_end', () => {
    const sentence = 'This is a test sentence for chunking purposes. '
    const text = sentence.repeat(100)
    const chunks = chunkText(text)
    for (const chunk of chunks) {
      expect(chunk.char_start).toBeGreaterThanOrEqual(0)
      expect(chunk.char_end).toBeGreaterThan(chunk.char_start)
      expect(chunk.char_end).toBeLessThanOrEqual(text.length)
    }
  })

  it('chunks have overlap (subsequent chunk starts before previous ends)', () => {
    const sentence = 'The defendant failed to comply with the court order. '
    const text = sentence.repeat(100) // ~5300 chars
    const chunks = chunkText(text)
    if (chunks.length >= 2) {
      expect(chunks[1].char_start).toBeLessThan(chunks[0].char_end)
    }
  })
})
```

---

## Task 4: Embedding Service (TDD)

**Pattern:** Uses OpenAI SDK already in the project.

**Files:**
- Create: `src/lib/courtlistener/embeddings.ts`
- Create: `tests/unit/courtlistener/embeddings.test.ts`

### Implementation

```typescript
// src/lib/courtlistener/embeddings.ts

import OpenAI from 'openai'

const EMBEDDING_MODEL = 'text-embedding-3-large'
const EMBEDDING_DIMENSIONS = 3072
const MAX_BATCH_SIZE = 20  // OpenAI allows up to 2048, but keep batches small

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  const openai = new OpenAI({ apiKey })
  const embeddings: number[][] = []

  // Process in batches
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS,
    })

    for (const item of response.data) {
      embeddings.push(item.embedding)
    }
  }

  return embeddings
}

export async function generateSingleEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text])
  return embedding
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS }
```

### Tests (4 tests)

```typescript
// tests/unit/courtlistener/embeddings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateEmbeddings, generateSingleEmbedding, EMBEDDING_DIMENSIONS } from '@/lib/courtlistener/embeddings'

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      embeddings: {
        create: vi.fn().mockResolvedValue({
          data: [
            { embedding: new Array(3072).fill(0.1), index: 0 },
          ],
        }),
      },
    })),
  }
})

describe('generateEmbeddings', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
  })

  it('returns embeddings for input texts', async () => {
    const result = await generateEmbeddings(['test text'])
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(EMBEDDING_DIMENSIONS)
  })

  it('returns empty array for empty input', async () => {
    const result = await generateEmbeddings([])
    expect(result).toEqual([])
  })

  it('throws when OPENAI_API_KEY is not set', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    await expect(generateEmbeddings(['test'])).rejects.toThrow('OPENAI_API_KEY is not set')
  })
})

describe('generateSingleEmbedding', () => {
  beforeEach(() => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
  })

  it('returns a single embedding vector', async () => {
    const result = await generateSingleEmbedding('test text')
    expect(result).toHaveLength(EMBEDDING_DIMENSIONS)
  })
})
```

---

## Task 5: Opinion Processing Pipeline

Fetches an opinion from CourtListener, chunks it, generates embeddings, and stores everything in Supabase.

**Files:**
- Create: `src/lib/courtlistener/pipeline.ts`
- Create: `tests/unit/courtlistener/pipeline.test.ts`

### Implementation

```typescript
// src/lib/courtlistener/pipeline.ts

import { getCourtListenerClient } from './client'
import { OPINION_TYPE_MAP } from './types'
import { chunkText } from './chunker'
import { generateEmbeddings } from './embeddings'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Process a cluster: fetch primary opinion, chunk, embed, store.
 * Uses service role client passed in (not user-scoped).
 */
export async function processClusterOpinions(
  supabase: SupabaseClient,
  clusterId: number
): Promise<{ opinion_count: number; chunk_count: number }> {
  const client = getCourtListenerClient()

  // 1. Get cluster detail to find opinions
  const cluster = await client.getCluster(clusterId)

  // 2. Pick primary opinion (prefer majority/combined, limit to 2)
  const sorted = [...cluster.sub_opinions].sort((a, b) => {
    const priority = ['010combined', '020lead', '090per-curiam', '025plurality']
    const aIdx = priority.indexOf(a.type)
    const bIdx = priority.indexOf(b.type)
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
  })
  const toFetch = sorted.slice(0, 2)

  let totalChunks = 0

  for (const opRef of toFetch) {
    // Check if already cached
    const { data: existing } = await supabase
      .from('cl_opinions')
      .select('id')
      .eq('opinion_id', opRef.id)
      .maybeSingle()

    if (existing) continue

    // 3. Fetch opinion text
    const opinion = await client.getOpinion(opRef.id)
    const text = opinion.plain_text || ''
    if (text.length < 50) continue // skip empty opinions

    const opinionType = OPINION_TYPE_MAP[opinion.type] ?? 'majority'

    // 4. Insert opinion
    const { data: inserted, error: insertErr } = await supabase
      .from('cl_opinions')
      .insert({
        cluster_id: clusterId,
        opinion_id: opRef.id,
        opinion_type: opinionType,
        plain_text: text,
      })
      .select('id')
      .single()

    if (insertErr || !inserted) {
      console.error('[pipeline] Failed to insert opinion:', insertErr)
      continue
    }

    // 5. Chunk text
    const chunks = chunkText(text)
    if (chunks.length === 0) continue

    // 6. Generate embeddings
    const embeddings = await generateEmbeddings(chunks.map((c) => c.content))

    // 7. Insert chunks with embeddings
    const rows = chunks.map((chunk, i) => ({
      opinion_id: inserted.id,
      chunk_index: chunk.chunk_index,
      content: chunk.content,
      char_start: chunk.char_start,
      char_end: chunk.char_end,
      embedding: JSON.stringify(embeddings[i]),
    }))

    const { error: chunkErr } = await supabase
      .from('cl_opinion_chunks')
      .insert(rows)

    if (chunkErr) {
      console.error('[pipeline] Failed to insert chunks:', chunkErr)
    } else {
      totalChunks += chunks.length
    }
  }

  return { opinion_count: toFetch.length, chunk_count: totalChunks }
}
```

### Tests (5 tests)

```typescript
// tests/unit/courtlistener/pipeline.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies before imports
vi.mock('@/lib/courtlistener/client', () => ({
  getCourtListenerClient: vi.fn().mockReturnValue({
    getCluster: vi.fn(),
    getOpinion: vi.fn(),
  }),
}))

vi.mock('@/lib/courtlistener/embeddings', () => ({
  generateEmbeddings: vi.fn().mockResolvedValue([new Array(3072).fill(0.1)]),
}))

import { processClusterOpinions } from '@/lib/courtlistener/pipeline'
import { getCourtListenerClient } from '@/lib/courtlistener/client'

function mockSupabase() {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null }),
    single: vi.fn().mockResolvedValue({ data: { id: 'opinion-uuid' }, error: null }),
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'opinion-uuid' }, error: null }),
      }),
      error: null,
    }),
  }
  return {
    from: vi.fn().mockReturnValue(chainable),
    _chainable: chainable,
  } as unknown as Parameters<typeof processClusterOpinions>[0]
}

describe('processClusterOpinions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches cluster and processes primary opinion', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      case_name: 'Test v. Case',
      sub_opinions: [{ id: 456, type: '010combined' }],
    })
    client.getOpinion.mockResolvedValue({
      id: 456, cluster_id: 123, type: '010combined',
      plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.opinion_count).toBe(1)
    expect(client.getOpinion).toHaveBeenCalledWith(456)
  })

  it('limits to 2 opinions per cluster', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [
        { id: 1, type: '010combined' },
        { id: 2, type: '030concurrence' },
        { id: 3, type: '040dissent' },
      ],
    })
    client.getOpinion.mockResolvedValue({
      id: 1, cluster_id: 123, type: '010combined', plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.opinion_count).toBe(2)
  })

  it('skips opinions with < 50 chars of text', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [{ id: 456, type: '010combined' }],
    })
    client.getOpinion.mockResolvedValue({
      id: 456, cluster_id: 123, type: '010combined', plain_text: 'Short.',
    })

    const supabase = mockSupabase()
    const result = await processClusterOpinions(supabase, 123)
    expect(result.chunk_count).toBe(0)
  })

  it('skips already-cached opinions', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [{ id: 456, type: '010combined' }],
    })

    const supabase = mockSupabase()
    // Override maybeSingle to return existing
    ;(supabase as unknown as { _chainable: { maybeSingle: ReturnType<typeof vi.fn> } })._chainable.maybeSingle.mockResolvedValue({ data: { id: 'exists' } })

    const result = await processClusterOpinions(supabase, 123)
    expect(client.getOpinion).not.toHaveBeenCalled()
  })

  it('prioritizes majority/combined opinions', async () => {
    const client = getCourtListenerClient() as { getCluster: ReturnType<typeof vi.fn>; getOpinion: ReturnType<typeof vi.fn> }
    client.getCluster.mockResolvedValue({
      id: 123,
      sub_opinions: [
        { id: 3, type: '040dissent' },
        { id: 1, type: '010combined' },
        { id: 2, type: '030concurrence' },
      ],
    })
    client.getOpinion.mockResolvedValue({
      id: 1, cluster_id: 123, type: '010combined', plain_text: 'A'.repeat(500),
    })

    const supabase = mockSupabase()
    await processClusterOpinions(supabase, 123)
    // First call should be for majority opinion (id=1)
    expect(client.getOpinion).toHaveBeenNthCalledWith(1, 1)
  })
})
```

---

## Task 6: RAG Prompt Builder (TDD)

**Pattern:** Follows `src/lib/ai/strategy-recommendations.ts` — Zod schema + system/user prompt builder.

**Files:**
- Create: `src/lib/courtlistener/rag-prompts.ts`
- Create: `tests/unit/courtlistener/rag-prompts.test.ts`

### Implementation

```typescript
// src/lib/courtlistener/rag-prompts.ts

import { z } from 'zod'

export const ragQuestionSchema = z.object({
  question: z.string().min(10).max(2000),
})

export interface RAGChunkContext {
  case_name: string
  court_name: string
  date_filed: string
  opinion_type: string
  content: string
  similarity: number
}

export interface RAGCaseContext {
  dispute_type: string | null
  jurisdiction: string | null
  role: string
  county: string | null
}

export const RAG_SYSTEM_PROMPT = `You are a legal research assistant helping a pro se litigant (someone representing themselves in court).

Your job is to answer legal questions based ONLY on the provided case law excerpts. Follow these rules strictly:

1. ONLY cite cases from the provided excerpts. Never invent or hallucinate case citations.
2. For every legal conclusion, include a citation in this format: [Case Name, Court (Year)]
3. Quote relevant text from the excerpts to support each point.
4. If no excerpt supports a point, explicitly say "No supporting case law found in the provided excerpts."
5. You are NOT a lawyer. Frame answers as educational information, not legal advice.
6. Never use directive language like "you must" or "you should file."
7. Focus on explaining what the case law says, not recommending actions.
8. If the excerpts are insufficient to answer the question, say so clearly.

Respond in clear, plain English that a non-lawyer can understand.`

const BLOCKED_PHRASES = Object.freeze([
  'as your attorney', 'legal advice', 'i recommend that you',
  'you must file', 'guaranteed', 'you will win', 'you will lose',
  'hire a lawyer', 'in my legal opinion',
])

export function isRAGAnswerSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildRAGPrompt(
  question: string,
  chunks: RAGChunkContext[],
  caseContext: RAGCaseContext
): { system: string; user: string } {
  const contextLines = [
    '## Your Case Context',
    `Dispute type: ${caseContext.dispute_type ?? 'general'}`,
    `Jurisdiction: ${caseContext.jurisdiction ?? 'not specified'}`,
    `Role: ${caseContext.role}`,
    caseContext.county ? `County: ${caseContext.county}` : null,
    '',
    '## Retrieved Case Law Excerpts',
    '',
  ].filter((l) => l !== null)

  chunks.forEach((chunk, i) => {
    const year = chunk.date_filed ? new Date(chunk.date_filed).getFullYear() : 'n.d.'
    contextLines.push(`[${i + 1}] ${chunk.case_name}, ${chunk.court_name} (${year})`)
    contextLines.push(`Opinion type: ${chunk.opinion_type}`)
    contextLines.push(`"${chunk.content}"`)
    contextLines.push('')
  })

  contextLines.push('## Question')
  contextLines.push(question)

  return {
    system: RAG_SYSTEM_PROMPT,
    user: contextLines.join('\n'),
  }
}
```

### Tests (8 tests)

```typescript
// tests/unit/courtlistener/rag-prompts.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildRAGPrompt,
  isRAGAnswerSafe,
  ragQuestionSchema,
  RAG_SYSTEM_PROMPT,
  type RAGChunkContext,
  type RAGCaseContext,
} from '@/lib/courtlistener/rag-prompts'

const mockChunks: RAGChunkContext[] = [
  {
    case_name: 'Smith v. Jones',
    court_name: '5th Circuit',
    date_filed: '2021-03-15',
    opinion_type: 'majority',
    content: 'The landlord must return the deposit within 30 days.',
    similarity: 0.92,
  },
]

const mockContext: RAGCaseContext = {
  dispute_type: 'landlord_tenant',
  jurisdiction: 'TX',
  role: 'plaintiff',
  county: 'Harris',
}

describe('buildRAGPrompt', () => {
  it('returns system and user prompts', () => {
    const result = buildRAGPrompt('Can I sue?', mockChunks, mockContext)
    expect(result.system).toBe(RAG_SYSTEM_PROMPT)
    expect(result.user).toContain('Can I sue?')
  })

  it('includes case context in user prompt', () => {
    const result = buildRAGPrompt('test', mockChunks, mockContext)
    expect(result.user).toContain('landlord_tenant')
    expect(result.user).toContain('TX')
    expect(result.user).toContain('plaintiff')
    expect(result.user).toContain('Harris')
  })

  it('includes chunk citations with year', () => {
    const result = buildRAGPrompt('test', mockChunks, mockContext)
    expect(result.user).toContain('Smith v. Jones, 5th Circuit (2021)')
    expect(result.user).toContain('landlord must return the deposit')
  })

  it('numbers chunks sequentially', () => {
    const twoChunks = [...mockChunks, {
      ...mockChunks[0],
      case_name: 'Doe v. Roe',
      court_name: 'TX Supreme Court',
      date_filed: '2019-11-02',
    }]
    const result = buildRAGPrompt('test', twoChunks, mockContext)
    expect(result.user).toContain('[1] Smith v. Jones')
    expect(result.user).toContain('[2] Doe v. Roe')
  })

  it('handles missing county gracefully', () => {
    const ctx = { ...mockContext, county: null }
    const result = buildRAGPrompt('test', mockChunks, ctx)
    expect(result.user).not.toContain('County:')
  })
})

describe('isRAGAnswerSafe', () => {
  it('returns true for safe text', () => {
    expect(isRAGAnswerSafe('Based on the case law, tenants may have certain protections.')).toBe(true)
  })

  it('returns false for unsafe text', () => {
    expect(isRAGAnswerSafe('As your attorney, I recommend filing immediately.')).toBe(false)
    expect(isRAGAnswerSafe('You will win this case, guaranteed.')).toBe(false)
  })
})

describe('ragQuestionSchema', () => {
  it('accepts valid question', () => {
    expect(ragQuestionSchema.safeParse({ question: 'What does case law say about security deposits?' }).success).toBe(true)
  })

  it('rejects too-short question', () => {
    expect(ragQuestionSchema.safeParse({ question: 'hi' }).success).toBe(false)
  })
})
```

---

## Task 7: Search API Route

**Pattern:** Follows `src/app/api/search/route.ts` + evidence categorize route.

**Files:**
- Create: `src/app/api/cases/[id]/research/search/route.ts`

### Implementation

```typescript
// src/app/api/cases/[id]/research/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getCourtListenerClient } from '@/lib/courtlistener/client'
import type { CLSearchFilters } from '@/lib/courtlistener/types'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists and user owns it
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, dispute_type, court_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const { query, filters } = body as { query?: string; filters?: CLSearchFilters }

    if (!query || query.trim().length < 3) {
      return NextResponse.json({ error: 'Query must be at least 3 characters' }, { status: 400 })
    }

    // Build enriched query with case context
    const enrichedQuery = query.trim()

    // Check search cache
    const queryHash = createHash('sha256')
      .update(JSON.stringify({ query: enrichedQuery, filters: filters ?? {} }))
      .digest('hex')

    const { data: cached } = await supabase
      .from('cl_search_cache')
      .select('results, expires_at')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (cached) {
      return NextResponse.json({ results: cached.results, _meta: { source: 'cache' } })
    }

    // Call CourtListener Search API
    const client = getCourtListenerClient()
    const results = await client.search(enrichedQuery, filters)

    // Cache results (24h TTL)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('cl_search_cache')
      .upsert({
        query_hash: queryHash,
        query_text: enrichedQuery,
        results: JSON.stringify(results),
        expires_at: expiresAt,
      }, { onConflict: 'query_hash' })

    // Upsert cluster metadata for each result
    for (const r of results) {
      await supabase
        .from('cl_case_clusters')
        .upsert({
          cluster_id: r.cluster_id,
          case_name: r.case_name,
          court_id: r.court_id,
          court_name: r.court_name,
          date_filed: r.date_filed || null,
          citations: JSON.stringify(r.citations),
          snippet: r.snippet,
          last_used_at: new Date().toISOString(),
        }, { onConflict: 'cluster_id' })
    }

    return NextResponse.json({ results, _meta: { source: 'courtlistener' } })
  } catch (err) {
    console.error('[research/search] Error:', err)
    return NextResponse.json({ error: 'Search failed. Please try again.' }, { status: 500 })
  }
}
```

---

## Task 8: Authority Management Routes

**Files:**
- Create: `src/app/api/cases/[id]/research/authority/route.ts`

### Implementation

```typescript
// src/app/api/cases/[id]/research/authority/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { processClusterOpinions } from '@/lib/courtlistener/pipeline'

export const runtime = 'nodejs'
export const maxDuration = 60  // opinion processing can take time

// GET: List saved authorities for this case
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const { data: authorities, error } = await supabase
      .from('case_authorities')
      .select(`
        id,
        cluster_id,
        status,
        added_at,
        cl_case_clusters (
          case_name,
          court_id,
          court_name,
          date_filed,
          citations,
          snippet
        )
      `)
      .eq('case_id', caseId)
      .order('added_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch authorities' }, { status: 500 })
    }

    return NextResponse.json({ authorities: authorities ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Save a cluster as authority + trigger opinion processing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case
    const { error: caseError } = await supabase
      .from('cases').select('id').eq('id', caseId).single()
    if (caseError) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    const body = await request.json()
    const { cluster_id } = body as { cluster_id?: number }

    if (!cluster_id || typeof cluster_id !== 'number') {
      return NextResponse.json({ error: 'cluster_id is required' }, { status: 400 })
    }

    // Check cluster exists in our cache
    const { data: cluster } = await supabase
      .from('cl_case_clusters')
      .select('cluster_id')
      .eq('cluster_id', cluster_id)
      .maybeSingle()

    if (!cluster) {
      return NextResponse.json({ error: 'Cluster not found. Search for it first.' }, { status: 404 })
    }

    // Upsert authority link
    const { data: authority, error: upsertError } = await supabase
      .from('case_authorities')
      .upsert({
        case_id: caseId,
        cluster_id,
        status: 'pending',
      }, { onConflict: 'case_id,cluster_id' })
      .select('id, status')
      .single()

    if (upsertError) {
      return NextResponse.json({ error: 'Failed to save authority' }, { status: 500 })
    }

    // Process opinions (fetch, chunk, embed) — inline for now
    // In production, this could be a background job
    try {
      await processClusterOpinions(supabase, cluster_id)

      // Mark as ready
      await supabase
        .from('case_authorities')
        .update({ status: 'ready' })
        .eq('case_id', caseId)
        .eq('cluster_id', cluster_id)
    } catch (err) {
      console.error('[research/authority] Pipeline error:', err)
      await supabase
        .from('case_authorities')
        .update({ status: 'failed' })
        .eq('case_id', caseId)
        .eq('cluster_id', cluster_id)
    }

    return NextResponse.json({ authority }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove authority
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const { cluster_id } = body as { cluster_id?: number }

    if (!cluster_id) {
      return NextResponse.json({ error: 'cluster_id is required' }, { status: 400 })
    }

    await supabase
      .from('case_authorities')
      .delete()
      .eq('case_id', caseId)
      .eq('cluster_id', cluster_id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 9: RAG Ask Route

**Files:**
- Create: `src/app/api/cases/[id]/research/ask/route.ts`

### Implementation

```typescript
// src/app/api/cases/[id]/research/ask/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateSingleEmbedding } from '@/lib/courtlistener/embeddings'
import { buildRAGPrompt, isRAGAnswerSafe, ragQuestionSchema, type RAGChunkContext } from '@/lib/courtlistener/rag-prompts'

export const runtime = 'nodejs'
export const maxDuration = 60

const AI_MODEL = 'claude-sonnet-4-20250514'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case + get context
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, jurisdiction, dispute_type, role, county')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = ragQuestionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid question', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { question } = parsed.data

    // Check if user has any authorities
    const { count } = await supabase
      .from('case_authorities')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)
      .eq('status', 'ready')

    if (!count || count === 0) {
      return NextResponse.json({
        answer: 'You haven\'t saved any case law authorities yet. Search for relevant cases and click "Use as Authority" to build your research library, then ask your question again.',
        citations: [],
        _meta: { source: 'no_authorities' },
      })
    }

    // 1. Embed the question
    const questionEmbedding = await generateSingleEmbedding(question)

    // 2. Vector similarity search using the DB function
    const { data: matchedChunks, error: matchError } = await supabase
      .rpc('match_opinion_chunks', {
        query_embedding: JSON.stringify(questionEmbedding),
        match_count: 8,
        filter_case_id: caseId,
      })

    if (matchError || !matchedChunks || matchedChunks.length === 0) {
      return NextResponse.json({
        answer: 'No relevant case law excerpts found in your saved authorities. Try adding more cases that relate to your question.',
        citations: [],
        _meta: { source: 'no_matches' },
      })
    }

    // 3. Build RAG prompt
    const chunks: RAGChunkContext[] = matchedChunks.map((c: {
      case_name: string
      court_name: string
      date_filed: string
      opinion_type: string
      content: string
      similarity: number
    }) => ({
      case_name: c.case_name,
      court_name: c.court_name,
      date_filed: c.date_filed,
      opinion_type: c.opinion_type,
      content: c.content,
      similarity: c.similarity,
    }))

    const prompt = buildRAGPrompt(question, chunks, {
      dispute_type: caseData.dispute_type,
      jurisdiction: caseData.jurisdiction,
      role: caseData.role,
      county: caseData.county,
    })

    // 4. Call Claude
    const anthropic = new Anthropic()
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      messages: [
        { role: 'user', content: prompt.user },
      ],
      system: prompt.system,
    })

    const answer = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Safety check
    if (!isRAGAnswerSafe(answer)) {
      return NextResponse.json({
        answer: 'The AI response could not be displayed because it contained language that may constitute legal advice. Please rephrase your question to focus on what the case law says rather than what actions to take.',
        citations: [],
        _meta: { source: 'safety_filtered' },
      })
    }

    // 5. Build citations from chunks used
    const citations = chunks.map((c) => ({
      case_name: c.case_name,
      court: c.court_name,
      year: c.date_filed ? new Date(c.date_filed).getFullYear() : null,
      excerpt: c.content.slice(0, 300) + (c.content.length > 300 ? '...' : ''),
      opinion_type: c.opinion_type,
    }))

    // Dedupe citations by case_name
    const seen = new Set<string>()
    const uniqueCitations = citations.filter((c) => {
      if (seen.has(c.case_name)) return false
      seen.add(c.case_name)
      return true
    })

    return NextResponse.json({
      answer,
      citations: uniqueCitations,
      _meta: { source: 'rag', model: AI_MODEL, chunks_used: chunks.length },
    })
  } catch (err) {
    console.error('[research/ask] Error:', err)
    return NextResponse.json({ error: 'Failed to generate answer. Please try again.' }, { status: 500 })
  }
}
```

---

## Task 10: Frontend — Research Page + Components

**Files:**
- Create: `src/app/(authenticated)/case/[id]/research/page.tsx`
- Create: `src/components/research/case-search-bar.tsx`
- Create: `src/components/research/search-result-card.tsx`
- Create: `src/components/research/authority-list.tsx`
- Create: `src/components/research/research-question.tsx`
- Create: `src/components/research/research-answer.tsx`
- Create: `src/components/research/citation-card.tsx`
- Modify: `src/components/layout/breadcrumbs.tsx` — add `research: 'Research'` to `SECTION_LABELS`

### Breadcrumbs update

In `src/components/layout/breadcrumbs.tsx`, add to `SECTION_LABELS`:
```typescript
const SECTION_LABELS: Record<string, string> = {
  motions: 'Motions',
  evidence: 'Evidence',
  discovery: 'Discovery',
  deadlines: 'Deadlines',
  exhibits: 'Exhibits',
  binders: 'Binders',
  health: 'Health',
  step: 'Step',
  research: 'Research',  // ADD THIS
}
```

### Research Page (server component)

```typescript
// src/app/(authenticated)/case/[id]/research/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseSearchBar } from '@/components/research/case-search-bar'
import { AuthorityList } from '@/components/research/authority-list'
import { ResearchQuestion } from '@/components/research/research-question'

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, jurisdiction, dispute_type, court_type, county')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  // Fetch existing authorities
  const { data: authorities } = await supabase
    .from('case_authorities')
    .select(`
      id,
      cluster_id,
      status,
      added_at,
      cl_case_clusters (
        case_name,
        court_id,
        court_name,
        date_filed,
        citations,
        snippet
      )
    `)
    .eq('case_id', id)
    .order('added_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <SupportiveHeader
        title="Legal Research"
        subtitle="Search for case law that supports your position."
      />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <CaseSearchBar
          caseId={id}
          caseContext={{
            jurisdiction: caseData.jurisdiction,
            dispute_type: caseData.dispute_type,
            court_type: caseData.court_type,
          }}
        />

        <AuthorityList
          caseId={id}
          initialAuthorities={authorities ?? []}
        />

        <ResearchQuestion caseId={id} />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
```

### CaseSearchBar

```typescript
// src/components/research/case-search-bar.tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search, Loader2 } from 'lucide-react'
import { SearchResultCard } from './search-result-card'

interface CaseSearchBarProps {
  caseId: string
  caseContext: {
    jurisdiction: string | null
    dispute_type: string | null
    court_type: string | null
  }
}

interface SearchResult {
  cluster_id: number
  case_name: string
  court_id: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

export function CaseSearchBar({ caseId, caseContext }: CaseSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim().length < 3) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/research/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          filters: caseContext.jurisdiction
            ? { jurisdiction: caseContext.jurisdiction }
            : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Search failed')
      }

      const data = await res.json()
      setResults(data.results ?? [])
      setSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="case-search" className="text-sm font-medium" style={{ color: '#1C1917' }}>
            Search Case Law
          </Label>
          <div className="flex gap-2">
            <Input
              id="case-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., landlord failure to return security deposit within 30 days"
              className="flex-1"
              minLength={3}
            />
            <Button type="submit" disabled={loading || query.trim().length < 3}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-1.5">Search</span>
            </Button>
          </div>
        </div>
        {caseContext.jurisdiction && (
          <p className="text-xs" style={{ color: '#78716C' }}>
            Searching within {caseContext.jurisdiction} jurisdiction. Results may include federal cases.
          </p>
        )}
      </form>

      {error && (
        <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
      )}

      {searched && results.length === 0 && !loading && (
        <p className="text-sm" style={{ color: '#78716C' }}>No results found. Try different keywords.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Search Results ({results.length})
          </h3>
          {results.map((result) => (
            <SearchResultCard
              key={result.cluster_id}
              result={result}
              caseId={caseId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### SearchResultCard

```typescript
// src/components/research/search-result-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkPlus, Loader2, Check } from 'lucide-react'

interface SearchResult {
  cluster_id: number
  case_name: string
  court_name: string
  date_filed: string
  citations: string[]
  snippet: string
}

interface SearchResultCardProps {
  result: SearchResult
  caseId: string
}

export function SearchResultCard({ result, caseId }: SearchResultCardProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSaveAuthority() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: result.cluster_id }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // Strip HTML tags from snippet
  const cleanSnippet = result.snippet.replace(/<[^>]*>/g, '')

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold truncate" style={{ color: '#1C1917' }}>
              {result.case_name}
            </h4>
            <p className="text-xs" style={{ color: '#78716C' }}>
              {result.court_name} {result.date_filed ? `\u00b7 ${result.date_filed}` : ''}
            </p>
            {result.citations.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: '#A8A29E' }}>
                {result.citations.join(', ')}
              </p>
            )}
          </div>
          <Button
            variant={saved ? 'outline' : 'default'}
            size="sm"
            onClick={handleSaveAuthority}
            disabled={saving || saved}
            className="flex-shrink-0"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5" />
            )}
            <span className="ml-1">{saved ? 'Saved' : 'Use as Authority'}</span>
          </Button>
        </div>
        {cleanSnippet && (
          <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
            &ldquo;{cleanSnippet}&rdquo;
          </p>
        )}
        {error && <p className="text-xs" style={{ color: '#D97706' }}>{error}</p>}
      </CardContent>
    </Card>
  )
}
```

### AuthorityList

```typescript
// src/components/research/authority-list.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, RefreshCw } from 'lucide-react'

interface Authority {
  id: string
  cluster_id: number
  status: string
  added_at: string
  cl_case_clusters: {
    case_name: string
    court_name: string | null
    date_filed: string | null
    citations: unknown
    snippet: string | null
  } | null
}

interface AuthorityListProps {
  caseId: string
  initialAuthorities: Authority[]
}

export function AuthorityList({ caseId, initialAuthorities }: AuthorityListProps) {
  const [authorities, setAuthorities] = useState(initialAuthorities)

  async function handleRemove(clusterId: number) {
    try {
      await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: clusterId }),
      })
      setAuthorities((prev) => prev.filter((a) => a.cluster_id !== clusterId))
    } catch {
      // silent fail
    }
  }

  async function handleRetry(clusterId: number) {
    try {
      await fetch(`/api/cases/${caseId}/research/authority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cluster_id: clusterId }),
      })
      // Refresh the list
      const res = await fetch(`/api/cases/${caseId}/research/authority`)
      if (res.ok) {
        const data = await res.json()
        setAuthorities(data.authorities ?? [])
      }
    } catch {
      // silent fail
    }
  }

  if (authorities.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
        My Authorities ({authorities.length})
      </h3>
      {authorities.map((auth) => {
        const cluster = auth.cl_case_clusters
        return (
          <Card key={auth.id}>
            <CardContent className="pt-3 pb-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: '#1C1917' }}>
                    {cluster?.case_name ?? 'Unknown Case'}
                  </p>
                  <Badge
                    variant={auth.status === 'ready' ? 'default' : auth.status === 'failed' ? 'destructive' : 'secondary'}
                    className="text-[10px] flex-shrink-0"
                  >
                    {auth.status === 'ready' ? 'Ready' : auth.status === 'failed' ? 'Failed' : 'Processing'}
                  </Badge>
                </div>
                <p className="text-xs" style={{ color: '#78716C' }}>
                  {cluster?.court_name} {cluster?.date_filed ? `\u00b7 ${cluster.date_filed}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                {auth.status === 'failed' && (
                  <Button variant="ghost" size="sm" onClick={() => handleRetry(auth.cluster_id)}>
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleRemove(auth.cluster_id)}>
                  <Trash2 className="h-3.5 w-3.5" style={{ color: '#D97706' }} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

### ResearchQuestion

```typescript
// src/components/research/research-question.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, MessageSquare } from 'lucide-react'
import { ResearchAnswer } from './research-answer'

interface ResearchQuestionProps {
  caseId: string
}

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

export function ResearchQuestion({ caseId }: ResearchQuestionProps) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    if (question.trim().length < 10) return

    setLoading(true)
    setError(null)
    setAnswer(null)
    setCitations([])

    try {
      const res = await fetch(`/api/cases/${caseId}/research/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer')
      }

      setAnswer(data.answer)
      setCitations(data.citations ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAsk} className="space-y-2">
        <Label htmlFor="research-question" className="text-sm font-semibold" style={{ color: '#1C1917' }}>
          Ask a Legal Question
        </Label>
        <p className="text-xs" style={{ color: '#78716C' }}>
          Ask about your legal situation. The AI will answer based on your saved case law authorities.
        </p>
        <textarea
          id="research-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., What legal basis supports my claim that the landlord violated habitability standards?"
          className="w-full rounded-md border px-3 py-2 text-sm min-h-[80px] resize-y"
          style={{ borderColor: '#D6D3D1' }}
        />
        <Button type="submit" disabled={loading || question.trim().length < 10}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          <span className="ml-1.5">{loading ? 'Analyzing...' : 'Ask'}</span>
        </Button>
      </form>

      {error && <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>}

      {answer && <ResearchAnswer answer={answer} citations={citations} />}
    </div>
  )
}
```

### ResearchAnswer

```typescript
// src/components/research/research-answer.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CitationCard } from './citation-card'

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

interface ResearchAnswerProps {
  answer: string
  citations: Citation[]
}

export function ResearchAnswer({ answer, citations }: ResearchAnswerProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#292524' }}
          >
            {answer}
          </div>
        </CardContent>
      </Card>

      {citations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold" style={{ color: '#1C1917' }}>
            Supporting Cases ({citations.length})
          </h4>
          {citations.map((citation, i) => (
            <CitationCard key={i} citation={citation} />
          ))}
        </div>
      )}

      <p className="text-xs" style={{ color: '#A8A29E' }}>
        This analysis is based on case law excerpts and is for educational purposes only. It is not legal advice.
      </p>
    </div>
  )
}
```

### CitationCard

```typescript
// src/components/research/citation-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Citation {
  case_name: string
  court: string
  year: number | null
  excerpt: string
  opinion_type: string
}

export function CitationCard({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card>
      <CardContent className="pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium" style={{ color: '#1C1917' }}>
              {citation.case_name}
            </p>
            <p className="text-xs" style={{ color: '#78716C' }}>
              {citation.court} {citation.year ? `(${citation.year})` : ''} &middot; {citation.opinion_type}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex-shrink-0"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
        {expanded && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: '#E7E5E4' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
              &ldquo;{citation.excerpt}&rdquo;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Task 11: Dashboard Integration — Research Card + Link

Add a "Legal Research" card to the case dashboard that links to the research page.

**Files:**
- Create: `src/components/dashboard/research-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx` — add ResearchCard to dashboard grid

### ResearchCard

```typescript
// src/components/dashboard/research-card.tsx
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Scale } from 'lucide-react'
import Link from 'next/link'

interface ResearchCardProps {
  caseId: string
  authorityCount: number
}

export function ResearchCard({ caseId, authorityCount }: ResearchCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-4 w-4" style={{ color: '#78716C' }} />
          <h3 className="text-sm font-semibold" style={{ color: '#1C1917' }}>Legal Research</h3>
        </div>
        <p className="text-xs mb-3" style={{ color: '#78716C' }}>
          Search for case law that supports your position. Ask AI-powered questions backed by real court decisions.
        </p>
        {authorityCount > 0 && (
          <p className="text-xs mb-2" style={{ color: '#57534E' }}>
            {authorityCount} saved authorit{authorityCount === 1 ? 'y' : 'ies'}
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/case/${caseId}/research`}>Open Research &rarr;</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Dashboard page modification

In `src/app/(authenticated)/case/[id]/page.tsx`:

1. Add import: `import { ResearchCard } from '@/components/dashboard/research-card'`
2. Add query after existing queries:
```typescript
const { count: authorityCount } = await supabase
  .from('case_authorities')
  .select('id', { count: 'exact', head: true })
  .eq('case_id', id)
```
3. Add `<ResearchCard caseId={id} authorityCount={authorityCount ?? 0} />` in the dashboard grid after the DiscoveryCard.

---

## Task 12: Build & Test Verification

1. Run `npx supabase db reset` — verify migration applies cleanly
2. Run all unit tests: `npx vitest run` — expect all passing including new tests (31 new tests)
3. Run `npx next build` — no type errors
4. Manual verification:
   - Navigate to `/case/{id}/research`
   - Search bar renders with jurisdiction context
   - Dashboard shows Research card
   - Breadcrumbs show "Research" section

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `supabase/migrations/20260304100001_courtlistener_tables.sql` | Create | T1 |
| `src/lib/courtlistener/types.ts` | Create | T2 |
| `src/lib/courtlistener/client.ts` | Create | T2 |
| `tests/unit/courtlistener/client.test.ts` | Create | T2 |
| `src/lib/courtlistener/chunker.ts` | Create | T3 |
| `tests/unit/courtlistener/chunker.test.ts` | Create | T3 |
| `src/lib/courtlistener/embeddings.ts` | Create | T4 |
| `tests/unit/courtlistener/embeddings.test.ts` | Create | T4 |
| `src/lib/courtlistener/pipeline.ts` | Create | T5 |
| `tests/unit/courtlistener/pipeline.test.ts` | Create | T5 |
| `src/lib/courtlistener/rag-prompts.ts` | Create | T6 |
| `tests/unit/courtlistener/rag-prompts.test.ts` | Create | T6 |
| `src/app/api/cases/[id]/research/search/route.ts` | Create | T7 |
| `src/app/api/cases/[id]/research/authority/route.ts` | Create | T8 |
| `src/app/api/cases/[id]/research/ask/route.ts` | Create | T9 |
| `src/app/(authenticated)/case/[id]/research/page.tsx` | Create | T10 |
| `src/components/research/case-search-bar.tsx` | Create | T10 |
| `src/components/research/search-result-card.tsx` | Create | T10 |
| `src/components/research/authority-list.tsx` | Create | T10 |
| `src/components/research/research-question.tsx` | Create | T10 |
| `src/components/research/research-answer.tsx` | Create | T10 |
| `src/components/research/citation-card.tsx` | Create | T10 |
| `src/components/layout/breadcrumbs.tsx` | Modify | T10 |
| `src/components/dashboard/research-card.tsx` | Create | T11 |
| `src/app/(authenticated)/case/[id]/page.tsx` | Modify | T11 |

## Task Dependencies

```
T1 (migration) ─────────────────────────────┐
T2 (CL client) ──┐                          │
T3 (chunker) ────┤                          │
T4 (embeddings) ─┤                          │
                  ├── T5 (pipeline) ─┐       │
T6 (RAG prompts) ┘                  │       │
                                     ├── T7 (search route) ──┐
                                     ├── T8 (authority route)─┤
                                     └── T9 (ask route) ──────┤
                                                               ├── T10 (frontend)
                                                               ├── T11 (dashboard)
                                                               └── T12 (verify)
```

**Parallelizable batches:**
- Batch 1: T1, T2, T3, T4, T6 (all independent foundations)
- Batch 2: T5 (depends on T2, T3, T4)
- Batch 3: T7, T8, T9 (depend on T1, T5, T6)
- Batch 4: T10, T11 (depend on routes)
- Batch 5: T12 (final verification)
