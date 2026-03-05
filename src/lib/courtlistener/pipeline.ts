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
