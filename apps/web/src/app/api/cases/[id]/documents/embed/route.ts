import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { embedCaseDocument } from '@/lib/ai/case-document-embedder'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params

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

    if (statusTable) {
      await supabase.from(statusTable).update({ embedding_status: result.status }).eq('id', sourceId)
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
