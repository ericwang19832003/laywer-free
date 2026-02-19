import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS ensures ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Fetch all evidence items for this case
    const { data: items, error: fetchError } = await supabase!
      .from('evidence_items')
      .select('id, file_name, storage_path, mime_type')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch evidence items', details: fetchError.message },
        { status: 500 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No evidence items to export' },
        { status: 404 }
      )
    }

    // Download all files from Supabase Storage
    const files: { name: string; buffer: Buffer }[] = []
    const usedNames = new Set<string>()

    for (const item of items) {
      const { data: fileData, error: downloadError } = await supabase!.storage
        .from('case-documents')
        .download(item.storage_path)

      if (downloadError || !fileData) {
        console.error(`Failed to download ${item.storage_path}:`, downloadError?.message)
        continue
      }

      // Deduplicate file names
      let fileName = item.file_name
      if (usedNames.has(fileName)) {
        const ext = fileName.lastIndexOf('.')
        const base = ext > 0 ? fileName.slice(0, ext) : fileName
        const suffix = ext > 0 ? fileName.slice(ext) : ''
        let counter = 1
        while (usedNames.has(`${base}_${counter}${suffix}`)) {
          counter++
        }
        fileName = `${base}_${counter}${suffix}`
      }
      usedNames.add(fileName)

      const buffer = Buffer.from(await fileData.arrayBuffer())
      files.push({ name: fileName, buffer })
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'Failed to download any evidence files' },
        { status: 500 }
      )
    }

    // Create ZIP archive
    const passthrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 5 } })

    archive.pipe(passthrough)

    for (const file of files) {
      archive.append(file.buffer, { name: file.name })
    }

    const archiveFinalized = archive.finalize()

    // Collect ZIP into buffer
    const chunks: Buffer[] = []
    for await (const chunk of passthrough) {
      chunks.push(chunk as Buffer)
    }
    await archiveFinalized

    const zipBuffer = Buffer.concat(chunks)

    // Generate ZIP file name
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const shortId = caseId.slice(0, 8)
    const zipName = `Case_${shortId}_Evidence_${dateStr}.zip`

    // Log export event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'evidence_exported',
      payload: {
        file_count: files.length,
        zip_name: zipName,
      },
    })

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Content-Length': String(zipBuffer.length),
      },
    })
  } catch (err) {
    console.error('Evidence export error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
