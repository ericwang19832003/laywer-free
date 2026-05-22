# LangGraph Case Strategy Agent — Design Doc

**Date:** 2026-05-22  
**Status:** Approved  
**Scope:** Add a stateful LangGraph.js ReAct agent to the Lawyer Free case dashboard

---

## Problem

The existing AI features (document generation, health scoring, legal research) are isolated single-shot LLM calls. Users have no way to ask open-ended strategy questions that require reasoning across multiple data sources — deadlines, evidence, case law, and task status — in a single coherent response.

---

## Solution

A LangGraph.js stateful agent embedded in the case dashboard Tools tab. Users ask strategy questions; the agent autonomously calls tools, reasons across case data, and streams grounded advice or generated documents in real time.

---

## Architecture

**Runtime:** LangChain.js + LangGraph.js inside Next.js API routes. No new infrastructure.

**New packages:**
- `@langchain/langgraph` — agent orchestration
- `@langchain/openai` — LLM + embeddings
- `@langchain/community` — SupabaseVectorStore

**New files:**
```
apps/web/src/
  app/api/cases/[id]/agent/
    route.ts                  ← streaming SSE endpoint
  lib/ai/agent/
    graph.ts                  ← LangGraph state machine
    state.ts                  ← AgentState type
    checkpointer.ts           ← Supabase-backed persistence
    tools/
      search-case-law.ts      ← CourtListener RAG retriever
      analyze-deadlines.ts
      review-evidence.ts
      draft-document.ts
```

**New DB table:**
```sql
agent_threads (
  id uuid primary key,
  case_id uuid references cases(id),
  user_id uuid references auth.users(id),
  thread_id text,
  checkpoint jsonb,
  updated_at timestamptz
)
```

---

## Agent Design

### State

```typescript
interface AgentState {
  messages: BaseMessage[]
  caseId: string
  disputeType: string
  caseContext: {
    tasks: Task[]
    deadlines: Deadline[]
    evidenceCount: number
    healthScore: number
    role: "plaintiff" | "defendant"
    county: string
  }
  toolCallCount: number  // circuit breaker, max 10
}
```

### LangGraph Nodes

```
[load_context] → [agent] ⟷ [tools]
                    ↓
              [format_response]
                    ↓
              [persist_thread]
```

### Tools

| Tool | Description |
|------|-------------|
| `search_case_law` | Semantic search over CourtListener embeddings via `SupabaseVectorStore`, filtered by `dispute_type`, returns top 3 cited cases |
| `analyze_deadlines` | Reads case deadlines from DB, returns prioritized urgency list |
| `review_evidence` | Scans evidence vault, categorizes strength, flags gaps |
| `draft_document` | LCEL chain: research → outline → draft → self-critique. Uses GPT-4o. Saves to `draft_versions`. |

### Models

- **Agent routing:** GPT-4o-mini (fast, cheap)
- **Document drafting:** GPT-4o (quality matters for legal docs)

---

## RAG Pipeline Upgrade

Replace ~200 lines of custom `src/lib/courtlistener/` code with:

```typescript
const vectorStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
  client: supabase,
  tableName: "case_law_embeddings",
  queryName: "match_case_law",
})

const retriever = vectorStore.asRetriever({
  k: 3,
  filter: { dispute_type: disputeType },
})
```

---

## Streaming

`/api/cases/[id]/agent` streams SSE events to the client:

| Event | Payload |
|-------|---------|
| `tool_start` | tool name + description (e.g. "Searching case law...") |
| `tool_end` | brief result summary |
| `token` | streamed response token |
| `done` | signals completion |

---

## UI

**Location:** New card in the Tools tab of the case dashboard, labeled "AI Strategy Advisor."

**Layout:**
- Suggested question chips at top (contextual, generated from case state)
- Chat history with inline tool progress chips
- Token-by-token streaming of final answer
- Generated documents appear as save-to-drafts cards
- Disclaimer pinned above input: "This is general legal information, not legal advice."
- Pro-gated with upgrade prompt for free users

---

## Safety & Error Handling

| Concern | Mitigation |
|---------|-----------|
| Runaway loops | Circuit breaker: max 10 tool calls per turn |
| Rate abuse | Reuses `RateLimitingService`: 20 queries/day free, unlimited Pro |
| Timeout | 60s max; streams partial response if hit |
| Legal liability | System prompt scopes to Texas civil procedure; instructs agent to recommend consulting a lawyer for high-stakes decisions |
| LangGraph failure | Falls back to existing single-shot `AIClient` |

---

## Success Criteria

- Agent correctly routes to ≥1 tool on 90% of strategy questions
- `draft_document` tool produces legally coherent demand letters passing existing review checklist
- RAG retriever returns relevant citations on Texas civil procedure queries
- Streaming latency: first token within 2s, full response within 30s
- No regression in existing AI features (document generation, health scoring)
