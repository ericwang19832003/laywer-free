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
    let text = ''

    if (contentText) {
      text = contentText
    } else {
      const { data: blob, error: downloadError } = await supabase.storage
        .from('case-documents')
        .download(storagePath)

      if (downloadError || !blob) {
        return {
          status: 'failed',
          chunksInserted: 0,
          error: downloadError?.message ?? 'Download failed',
        }
      }

      const arrayBuffer = await blob.arrayBuffer()

      if (mimeType === 'application/pdf') {
        text = await extractTextFromPdf(arrayBuffer)
      } else if (mimeType.startsWith('image/')) {
        // extractTextFromImage expects a Node.js Buffer
        text = await extractTextFromImage(Buffer.from(arrayBuffer), mimeType)
      }
    }

    if (!text.trim()) {
      return { status: 'failed', chunksInserted: 0, error: 'No text extracted' }
    }

    const chunks = chunkText(text)
    if (chunks.length === 0) {
      return { status: 'failed', chunksInserted: 0, error: 'No chunks produced' }
    }

    const texts = chunks.map((c) => c.content)
    const embeddings = await generateDocumentEmbeddings(texts)

    // Delete old chunks for this source before inserting new ones
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
