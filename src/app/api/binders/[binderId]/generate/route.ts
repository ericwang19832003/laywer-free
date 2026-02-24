import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { PassThrough } from 'stream'
import archiver from 'archiver'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateSummaryPdf } from '@/lib/binder/generate-summary-pdf'
import { exhibitFileName } from '@/lib/binder/safe-filename'
import type { BinderOptions } from '@/lib/schemas/trial-binders'

export const runtime = 'nodejs'

// Maximum time for the build (5 minutes)
export const maxDuration = 300

// ── Helpers ─────────────────────────────────

/** Escape a value for CSV (RFC 4180) */
function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Build a CSV string from headers + rows */
function buildCsv(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(csvEscape).join(',')
  const dataLines = rows.map((row) => row.map(csvEscape).join(','))
  return [headerLine, ...dataLines].join('\r\n')
}

// ── Main Build Handler ──────────────────────

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ binderId: string }> }
) {
  const { binderId } = await params
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  // ① Fetch binder + case info (RLS ensures ownership)
  const { data: binder, error: binderError } = await supabase!
    .from('trial_binders')
    .select('*, cases(id, county, role, jurisdiction, dispute_type)')
    .eq('id', binderId)
    .single()

  if (binderError || !binder) {
    return NextResponse.json({ error: 'Binder not found' }, { status: 404 })
  }

  if (binder.status !== 'queued') {
    return NextResponse.json(
      { error: `Binder status is '${binder.status}', expected 'queued'` },
      { status: 409 }
    )
  }

  const caseId = binder.case_id
  const caseInfo = binder.cases as { id: string; county: string | null; role: string; jurisdiction: string | null; dispute_type: string | null }
  const options = (binder.options ?? {}) as BinderOptions

  // ② Set status = building
  await supabase!
    .from('trial_binders')
    .update({ status: 'building' })
    .eq('id', binderId)

  try {
    // ③ Load exhibits with evidence metadata
    const { data: exhibits, error: exError } = await supabase!
      .from('exhibits')
      .select('exhibit_no, sort_order, title, description, evidence_item_id, evidence_items(file_name, storage_path, mime_type, label, notes, created_at)')
      .eq('exhibit_set_id', binder.exhibit_set_id)
      .order('sort_order', { ascending: true })

    if (exError) throw new Error(`Failed to load exhibits: ${exError.message}`)

    // Flatten evidence join
    type ExhibitRow = {
      exhibit_no: string
      sort_order: number
      title: string | null
      description: string | null
      evidence_item_id: string
      evidence: {
        file_name: string
        storage_path: string
        mime_type: string | null
        label: string | null
        notes: string | null
        created_at: string
      } | null
    }

    const exhibitRows: ExhibitRow[] = (exhibits ?? []).map((ex) => {
      const raw = ex.evidence_items as unknown
      const ev = Array.isArray(raw) ? raw[0] : raw as ExhibitRow['evidence']
      return { ...ex, evidence: ev ?? null }
    })

    // ④ Load optional data in parallel
    const [timelineRes, deadlinesRes, discoveryRes] = await Promise.all([
      options.include_timeline
        ? supabase!.from('task_events').select('*').eq('case_id', caseId).order('created_at', { ascending: true })
        : Promise.resolve({ data: null, error: null }),
      options.include_deadlines
        ? supabase!.from('deadlines').select('*').eq('case_id', caseId).order('due_at', { ascending: true })
        : Promise.resolve({ data: null, error: null }),
      options.include_discovery
        ? supabase!.from('discovery_packs').select('*, discovery_items(*)').eq('case_id', caseId).order('created_at', { ascending: false })
        : Promise.resolve({ data: null, error: null }),
    ])

    // ⑤ Generate files

    // -- Sections list for TOC --
    const sections: string[] = [
      '01 — Binder Summary (this document)',
      '02 — Exhibit List',
    ]
    if (options.include_timeline && timelineRes.data?.length) sections.push('03 — Timeline')
    if (options.include_deadlines && deadlinesRes.data?.length) sections.push('04 — Deadlines')
    sections.push(`05 — Exhibits (${exhibitRows.length} files)`)

    // -- 01_Binder_Summary.pdf --
    const summaryPdf = await generateSummaryPdf({
      title: binder.title ?? 'Trial Binder',
      caseCounty: caseInfo.county,
      caseRole: caseInfo.role,
      generatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      exhibits: exhibitRows.map((ex) => ({
        exhibit_no: ex.exhibit_no,
        title: ex.title || ex.description || '',
        file_name: ex.evidence?.file_name || 'unknown',
        category: ex.evidence?.label || '',
        notes: ex.evidence?.notes || ex.description || '',
      })),
      sections,
    })

    // -- 02_Exhibit_List.csv --
    const exhibitCsv = buildCsv(
      ['Exhibit No', 'Title', 'File Name', 'Category', 'Notes'],
      exhibitRows.map((ex) => [
        ex.exhibit_no,
        ex.title || ex.description || '',
        ex.evidence?.file_name || '',
        ex.evidence?.label || '',
        ex.evidence?.notes || '',
      ])
    )

    // -- 03_Timeline.json (optional) --
    const timelineJson = options.include_timeline && timelineRes.data?.length
      ? JSON.stringify(timelineRes.data, null, 2)
      : null

    // -- 04_Deadlines.csv (optional) --
    const deadlinesCsv = options.include_deadlines && deadlinesRes.data?.length
      ? buildCsv(
          ['Key', 'Due Date', 'Source', 'Rationale'],
          deadlinesRes.data.map((d: { key: string; due_at: string; source: string; rationale: string | null }) => [
            d.key,
            new Date(d.due_at).toLocaleDateString('en-US'),
            d.source,
            d.rationale || '',
          ])
        )
      : null

    // ⑥ Download exhibit files from storage
    const exhibitFiles: { name: string; buffer: Buffer }[] = []
    const skippedFiles: { exhibit_no: string; file_name: string; reason: string }[] = []

    for (const ex of exhibitRows) {
      if (!ex.evidence?.storage_path) {
        skippedFiles.push({
          exhibit_no: ex.exhibit_no,
          file_name: ex.evidence?.file_name || 'unknown',
          reason: 'No storage path — file may not have been uploaded',
        })
        continue
      }

      try {
        const { data: fileData, error: dlError } = await supabase!.storage
          .from('case-documents')
          .download(ex.evidence.storage_path)

        if (dlError || !fileData) {
          skippedFiles.push({
            exhibit_no: ex.exhibit_no,
            file_name: ex.evidence.file_name,
            reason: dlError?.message || 'Download returned empty data',
          })
          continue
        }

        const safeName = exhibitFileName(ex.exhibit_no, ex.title, ex.evidence.file_name)

        exhibitFiles.push({
          name: safeName,
          buffer: Buffer.from(await fileData.arrayBuffer()),
        })
      } catch (dlErr) {
        skippedFiles.push({
          exhibit_no: ex.exhibit_no,
          file_name: ex.evidence.file_name,
          reason: dlErr instanceof Error ? dlErr.message : 'Unexpected download error',
        })
      }
    }

    // ⑦ Build ZIP
    const passthrough = new PassThrough()
    const archive = archiver('zip', { zlib: { level: 5 } })
    archive.pipe(passthrough)

    // Root-level generated files
    archive.append(Buffer.from(summaryPdf), { name: '01_Binder_Summary.pdf' })
    archive.append(exhibitCsv, { name: '02_Exhibit_List.csv' })

    if (timelineJson) {
      archive.append(timelineJson, { name: '03_Timeline.json' })
    }
    if (deadlinesCsv) {
      archive.append(deadlinesCsv, { name: '04_Deadlines.csv' })
    }

    // Exhibits folder
    for (const file of exhibitFiles) {
      archive.append(file.buffer, { name: `05_Exhibits/${file.name}` })
    }

    // Skipped files manifest (if any downloads failed)
    if (skippedFiles.length > 0) {
      const lines = [
        'SKIPPED FILES',
        '='.repeat(60),
        `${skippedFiles.length} exhibit(s) could not be included in this binder.`,
        '',
        ...skippedFiles.map(
          (f) => `Exhibit ${f.exhibit_no} — ${f.file_name}\n  Reason: ${f.reason}`
        ),
        '',
        'These exhibits are listed in 02_Exhibit_List.csv but their files are missing from 05_Exhibits/.',
      ]
      archive.append(lines.join('\n'), { name: 'Skipped_Files.txt' })
    }

    const archiveFinalized = archive.finalize()

    // Collect ZIP into buffer
    const chunks: Buffer[] = []
    for await (const chunk of passthrough) {
      chunks.push(chunk as Buffer)
    }
    await archiveFinalized

    const zipBuffer = Buffer.concat(chunks)

    // ⑧ Compute SHA256
    const sha256 = createHash('sha256').update(zipBuffer).digest('hex')

    // ⑨ Upload ZIP to Supabase Storage
    const storagePath = `cases/${caseId}/binders/${binderId}/trial_binder.zip`

    const { error: uploadError } = await supabase!.storage
      .from('case-documents')
      .upload(storagePath, zipBuffer, {
        contentType: 'application/zip',
        upsert: true,
      })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // ⑩ Update binder row → ready
    const { data: updated, error: updateError } = await supabase!
      .from('trial_binders')
      .update({
        status: 'ready',
        storage_path: storagePath,
        sha256,
      })
      .eq('id', binderId)
      .select()
      .single()

    if (updateError) throw new Error(`Failed to update binder: ${updateError.message}`)

    // ⑪ Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'trial_binder_generated',
      payload: {
        binder_id: binderId,
        title: binder.title,
        exhibit_count: exhibitRows.length,
        skipped_count: skippedFiles.length,
        zip_size: zipBuffer.length,
        sha256,
      },
    })

    return NextResponse.json({ binder: updated })
  } catch (err) {
    // ── Failure path ──
    const message = err instanceof Error ? err.message : 'Unknown build error'
    console.error('Trial binder build failed:', message)

    await supabase!
      .from('trial_binders')
      .update({ status: 'failed', error: message })
      .eq('id', binderId)

    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'trial_binder_failed',
      payload: { binder_id: binderId, error: message },
    })

    return NextResponse.json(
      { error: 'Build failed', details: message },
      { status: 500 }
    )
  }
}
