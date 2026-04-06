# CourtListener Case Discovery + RAG System Design

**Date:** 2026-03-04
**Status:** Approved

## Goal

Enable users to search for relevant legal precedent from within their active case, save cases as authorities, and ask AI-powered legal questions backed by real case citations — using CourtListener's Search API and a local pgvector RAG knowledge base.

## Architecture: Thin Proxy + Lazy RAG

CourtListener search results are proxied through the backend with a 24h search cache. Full opinions are only fetched when a user explicitly saves a case as an authority. Embeddings are generated lazily on retrieval and stored in Supabase pgvector. This approach respects the free tier (5,000 req/day), minimizes API costs, and builds a focused knowledge base organically as users interact with the platform.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UX location | Case-integrated (`/case/[id]/research`) | Search context from case (jurisdiction, dispute type) |
| Vector DB | Supabase pgvector | No new infrastructure; alongside existing data |
| Embedding model | OpenAI text-embedding-3-large (3072 dims) | Higher quality for legal text |
| API tier | Free (5,000 req/day) | Aggressive caching makes this sufficient |
| Opinion retrieval | On-demand (lazy) | Only fetch what users actually need |

---

## Section 1: Database Schema

### New Tables

**`cl_case_clusters`** — Cached CourtListener cluster metadata (shared, no RLS)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| cluster_id | int UNIQUE | CourtListener cluster ID |
| case_name | text | |
| court_id | text | e.g. "scotus", "ca9" |
| court_name | text | e.g. "Supreme Court of the United States" |
| date_filed | date | |
| citations | jsonb | Array of citation strings |
| snippet | text | Search snippet, nullable |
| last_used_at | timestamptz | |
| created_at | timestamptz | |

**`cl_opinions`** — Cached full opinion text (shared, no RLS)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| cluster_id | int FK | → cl_case_clusters.cluster_id |
| opinion_id | int UNIQUE | CourtListener opinion ID |
| opinion_type | text | majority/concurring/dissenting |
| plain_text | text | Full opinion content |
| retrieved_at | timestamptz | |

**`cl_opinion_chunks`** — RAG chunks with embeddings (shared, no RLS)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| opinion_id | uuid FK | → cl_opinions.id |
| chunk_index | int | Order within opinion |
| content | text | ~500 tokens per chunk |
| char_start | int | Position in original text |
| char_end | int | |
| embedding | vector(3072) | text-embedding-3-large |
| created_at | timestamptz | |

**`case_authorities`** — Links user cases to CL clusters (RLS: user's cases only)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| case_id | uuid FK | → cases.id |
| cluster_id | int FK | → cl_case_clusters.cluster_id |
| added_at | timestamptz | |
| UNIQUE(case_id, cluster_id) | | |

**`cl_search_cache`** — TTL-based search result cache (shared, no RLS)

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| query_hash | text UNIQUE | SHA-256 of normalized query |
| query_text | text | |
| results | jsonb | Array of search results |
| expires_at | timestamptz | 24h TTL |
| created_at | timestamptz | |

### pgvector Extension

Enable `vector` extension in Supabase. Create IVFFlat index on `cl_opinion_chunks.embedding` for cosine distance search.

---

## Section 2: API Layer

### New Routes

**`POST /api/cases/[id]/research/search`**
- Proxy search to CourtListener Search API
- Check `cl_search_cache` first (24h TTL)
- Body: `{ query, filters?: { jurisdiction, court, date_after, date_before } }`
- Auto-appends case context (dispute_type, jurisdiction) to query
- Returns top 10 results with snippets
- Stores results in cache + upserts `cl_case_clusters`

**`POST /api/cases/[id]/research/authority`**
- User clicks "Use as authority"
- Body: `{ cluster_id }`
- Creates `case_authorities` link
- Triggers async opinion fetch + embedding pipeline
- Returns 202 Accepted

**`GET /api/cases/[id]/research/authority`**
- Lists saved authorities for this case
- Includes embedding status (pending/ready)

**`POST /api/cases/[id]/research/ask`**
- RAG question answering
- Body: `{ question }`
- Embeds question → pgvector similarity search (top 8 chunks)
- Scoped to case's authorities
- Sends to Claude with case context + retrieved chunks
- Returns: `{ answer, citations: [{ case_name, court, year, excerpt }] }`

### CourtListener Client

```typescript
// src/lib/courtlistener/client.ts
class CourtListenerClient {
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>
  getCluster(clusterId: number): Promise<ClusterDetail>
  getOpinion(opinionId: number): Promise<OpinionDetail>
}
```

- Rate limiting: token bucket (5,000/day)
- Retry: exponential backoff (1s, 2s, 4s, max 3)
- All credentials in env vars

### Opinion Processing Pipeline

1. Fetch opinion text from CourtListener
2. Clean/normalize (strip HTML)
3. Split into ~500-token chunks with 50-token overlap
4. Generate embeddings via OpenAI text-embedding-3-large
5. Store in `cl_opinions` + `cl_opinion_chunks`

---

## Section 3: RAG Pipeline

### Flow

```
Search → cached proxy → display snippets
  → user saves authority → fetch opinion → chunk → embed → store
  → user asks question → embed question → vector search → Claude → cited answer
```

### Prompt Structure

```
System: Legal research assistant for pro se litigant.
Answer based ONLY on provided case law excerpts.
Cite every conclusion: [Case Name, Court (Year)] — "excerpt"
If no excerpt supports a point, say so.

User:
## My Case Context
Dispute: {dispute_type}, Jurisdiction: {jurisdiction}, Role: {role}

## Retrieved Case Law
[1] Smith v. Jones, 5th Cir. (2019)
"Excerpt..."
...

## Question
{user's question}
```

### Chunk Strategy

- ~500 tokens per chunk, 50-token overlap
- `char_start`/`char_end` for excerpt highlighting
- Cosine distance (`<=>`) with IVFFlat index
- Top 8 chunks per query

---

## Section 4: Frontend

### New Page: `/case/[id]/research`

**Components:**
- `ResearchPage` — server component, fetches case data + authorities
- `CaseSearchBar` — search input + filter dropdowns (jurisdiction, court, date)
- `SearchResultCard` — case name, court, date, snippet, "Use as Authority" button
- `AuthorityList` — saved authorities with status badges (pending/ready)
- `ResearchQuestion` — textarea for RAG questions
- `ResearchAnswer` — AI answer with expandable citation cards
- `CitationCard` — case name, court, year, excerpt with expand toggle

**Integration:** Add "Research" tab to case tab navigation.

---

## Section 5: Caching & Error Handling

### Caching Layers

| Layer | TTL | Storage |
|-------|-----|---------|
| Search results | 24 hours | `cl_search_cache` |
| Case clusters | Permanent | `cl_case_clusters` |
| Opinion text | Permanent | `cl_opinions` |
| Embeddings | Permanent | `cl_opinion_chunks` |

### Error Handling

| Scenario | Behavior |
|----------|----------|
| CL API down | Return cached results; show "Search temporarily unavailable" |
| Rate limit hit | "Daily search limit reached. Try again tomorrow." |
| Embedding API fails | Mark authority as "pending" — retry on next load |
| Opinion fetch fails | Mark as "failed" with retry button |
| No relevant chunks | "No relevant case law found. Try adding more cases." |

### Security

- `COURTLISTENER_API_TOKEN` in env vars
- All CL API calls server-side only
- RLS on `case_authorities` (user's cases only)
- Public `cl_*` tables have no RLS (shared public case law)
