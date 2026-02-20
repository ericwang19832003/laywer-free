import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { PassThrough } from 'stream'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch pack (RLS ensures ownership via cases join)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, title, status, case_id')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Discovery pack not found' },
        { status: 404 }
      )
    }

    // Fetch all related data in parallel
    const [itemsResult, logsResult, responsesResult, evidenceResult, eventsResult] =
      await Promise.all([
        supabase!
          .from('discovery_items')
          .select('id, item_type, item_no, prompt_text, generated_text')
          .eq('pack_id', packId)
          .order('item_type')
          .order('item_no'),
        supabase!
          .from('discovery_service_logs')
          .select('id, served_at, service_method, served_to_name, served_to_email, served_to_address, notes')
          .eq('pack_id', packId)
          .order('served_at', { ascending: false }),
        supabase!
          .from('discovery_responses')
          .select('id, file_name, storage_path, received_at, notes')
          .eq('pack_id', packId)
          .order('received_at', { ascending: false }),
        supabase!
          .from('evidence_items')
          .select('id, file_name, storage_path')
          .eq('case_id', pack.case_id)
          .order('created_at', { ascending: true }),
        supabase!
          .from('task_events')
          .select('id, kind, payload, created_at')
          .eq('case_id', pack.case_id)
          .order('created_at', { ascending: true }),
      ])

    const items = itemsResult.data ?? []
    const logs = logsResult.data ?? []
    const responses = responsesResult.data ?? []
    const evidenceItems = evidenceResult.data ?? []
    const events = eventsResult.data ?? []

    // --- Generate text content ---

    // requests.txt
    let requestsTxt = `Discovery Requests — ${pack.title}\n`
    requestsTxt += `${'='.repeat(60)}\n\n`
    if (items.length === 0) {
      requestsTxt += 'No discovery items in this pack.\n'
    } else {
      const grouped: Record<string, typeof items> = {}
      for (const item of items) {
        const type = item.item_type ?? 'OTHER'
        if (!grouped[type]) grouped[type] = []
        grouped[type].push(item)
      }
      for (const [type, typeItems] of Object.entries(grouped)) {
        requestsTxt += `--- ${type} ---\n\n`
        for (const item of typeItems) {
          requestsTxt += `#${item.item_no ?? '?'}  ${item.prompt_text ?? ''}\n`
          if (item.generated_text) {
            requestsTxt += `\n${item.generated_text}\n`
          }
          requestsTxt += '\n'
        }
      }
    }

    // service_log.txt
    let serviceTxt = `Service Log — ${pack.title}\n`
    serviceTxt += `${'='.repeat(60)}\n\n`
    if (logs.length === 0) {
      serviceTxt += 'No service records.\n'
    } else {
      for (const log of logs) {
        const date = log.served_at
          ? new Date(log.served_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'Date unknown'
        const recipient = [log.served_to_name, log.served_to_email, log.served_to_address]
          .filter(Boolean)
          .join(', ') || 'N/A'
        serviceTxt += `${date}\n`
        serviceTxt += `  Method:    ${log.service_method ?? 'N/A'}\n`
        serviceTxt += `  Recipient: ${recipient}\n`
        if (log.notes) serviceTxt += `  Notes:     ${log.notes}\n`
        serviceTxt += '\n'
      }
    }

    // timeline.txt
    let timelineTxt = `Timeline — ${pack.title}\n`
    timelineTxt += `${'='.repeat(60)}\n\n`
    if (events.length === 0) {
      timelineTxt += 'No timeline events.\n'
    } else {
      for (const ev of events) {
        const ts = ev.created_at
          ? new Date(ev.created_at).toISOString().replace('T', ' ').slice(0, 19)
          : '?'
        timelineTxt += `[${ts}]  ${ev.kind ?? 'unknown'}\n`
        if (ev.payload && typeof ev.payload === 'object') {
          const summary = JSON.stringify(ev.payload)
          if (summary.length > 2) {
            timelineTxt += `  ${summary}\n`
          }
        }
        timelineTxt += '\n'
      }
    }

    // --- Download binary files ---
    const usedNames = new Set<string>()

    function deduplicateName(original: string): string {
      let fileName = original
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
      return fileName
    }

    const responseFiles: { name: string; buffer: Buffer }[] = []
    for (const resp of responses) {
      if (!resp.storage_path || !resp.file_name) continue
      const { data: fileData, error: dlError } = await supabase!.storage
        .from('case-documents')
        .download(resp.storage_path)
      if (dlError || !fileData) {
        console.warn(`Failed to download response ${resp.storage_path}:`, dlError?.message)
        continue
      }
      const fileName = deduplicateName(resp.file_name)
      responseFiles.push({ name: fileName, buffer: Buffer.from(await fileData.arrayBuffer()) })
    }

    const evidenceFiles: { name: string; buffer: Buffer }[] = []
    for (const ev of evidenceItems) {
      if (!ev.storage_path || !ev.file_name) continue
      const { data: fileData, error: dlError } = await supabase!.storage
        .from('case-documents')
        .download(ev.storage_path)
      if (dlError || !fileData) {
        console.warn(`Failed to download evidence ${ev.storage_path}:`, dlError?.message)
        continue
      }
      const fileName = deduplicateName(ev.file_name)
      evidenceFiles.push({ name: fileName, buffer: Buffer.from(await fileData.arrayBuffer()) })
    }

    // --- Build ZIP ---
    const passthrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 5 } })
    archive.pipe(passthrough)

    archive.append(requestsTxt, { name: 'requests.txt' })
    archive.append(serviceTxt, { name: 'service_log.txt' })
    archive.append(timelineTxt, { name: 'timeline.txt' })

    for (const file of responseFiles) {
      archive.append(file.buffer, { name: `responses/${file.name}` })
    }
    for (const file of evidenceFiles) {
      archive.append(file.buffer, { name: `evidence/${file.name}` })
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
    const titleSlug = (pack.title ?? 'pack')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 50)
    const zipName = `Discovery_Pack_${titleSlug}_${dateStr}.zip`

    // Log export event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_packet_exported',
      payload: {
        pack_id: packId,
        pack_title: pack.title,
        item_count: items.length,
        response_file_count: responseFiles.length,
        evidence_file_count: evidenceFiles.length,
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
    console.error('Discovery pack export error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
