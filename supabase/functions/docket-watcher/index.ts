// Supabase Edge Function: runs daily via Supabase cron
// Polls CourtListener for new docket entries and pushes deadlines to the DB

import { createClient } from 'jsr:@supabase/supabase-js@2'

const COURTLISTENER_BASE = 'https://www.courtlistener.com/api/rest/v4'

interface DocketEntry {
  id: number
  date_filed: string
  description: string | null
  recap_documents: { id: number }[]
}

interface ClPage {
  next: string | null
  results: DocketEntry[]
}

async function classifyDocketEntry(
  entry: DocketEntry,
  anthropicKey: string
): Promise<{ summary: string; responseDeadline: string | null; type: string }> {
  const description = entry.description ?? ''
  const fallback = { summary: description.slice(0, 200) || '(no description)', responseDeadline: null, type: 'other' }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: 'You classify court docket entries for self-represented litigants. Respond with JSON only: {"summary": "one sentence plain English", "type": "motion|order|notice|other", "responseDeadline": "YYYY-MM-DD or null"}. If no response deadline is implied, set responseDeadline to null. Be conservative — only set a deadline when clearly implied.',
        messages: [{ role: 'user', content: `Classify this docket entry: ${description} (filed: ${entry.date_filed})` }],
      }),
    })
    if (!res.ok) return fallback
    const data = await res.json()
    const text = data?.content?.[0]?.text
    if (!text) return fallback
    const parsed = JSON.parse(text)
    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
      type: typeof parsed.type === 'string' ? parsed.type : 'other',
      responseDeadline: typeof parsed.responseDeadline === 'string' ? parsed.responseDeadline : null,
    }
  } catch {
    return fallback
  }
}

async function fetchAllDocketEntries(
  docketId: number,
  sinceDate: string,
  clApiToken: string
): Promise<DocketEntry[]> {
  const entries: DocketEntry[] = []
  let nextUrl: string | null =
    `${COURTLISTENER_BASE}/docket-entries/?docket=${docketId}&date_filed__gte=${sinceDate}&format=json`

  while (nextUrl) {
    const res = await fetch(nextUrl, {
      headers: clApiToken ? { Authorization: `Token ${clApiToken}` } : {},
    })
    if (!res.ok) break
    const page = await res.json() as ClPage
    entries.push(...(page.results ?? []))
    nextUrl = page.next ?? null
  }
  return entries
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
  const clApiToken = Deno.env.get('COURTLISTENER_API_TOKEN') ?? ''

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: cases } = await supabase
    .from('cases')
    .select('id, court_case_number, courtlistener_docket_id, docket_last_checked')
    .not('courtlistener_docket_id', 'is', null)

  if (!cases?.length) return new Response('No cases to watch', { status: 200 })

  let processed = 0
  for (const c of cases) {
    const since = new Date(
      c.docket_last_checked ?? Date.now() - 7 * 86400000
    ).toISOString().slice(0, 10)

    const entries = await fetchAllDocketEntries(c.courtlistener_docket_id, since, clApiToken)

    for (const entry of entries) {
      const classified = await classifyDocketEntry(entry, anthropicKey)

      await supabase.from('task_events').insert({
        case_id: c.id,
        description: `[Court docket] ${classified.summary}`,
        source: 'docket_watcher',
      })

      if (classified.responseDeadline) {
        await supabase.from('deadlines').upsert({
          case_id: c.id,
          title: `Response to court filing (${classified.type})`,
          due_date: classified.responseDeadline,
          source: 'docket_watcher',
          is_confirmed: true,
          notes: classified.summary,
        }, { onConflict: 'case_id,title,due_date' })
      }
    }

    await supabase.from('cases').update({ docket_last_checked: new Date().toISOString() }).eq('id', c.id)
    processed++
  }

  return new Response(JSON.stringify({ processed }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
})
