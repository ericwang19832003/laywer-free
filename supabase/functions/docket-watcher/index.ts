// Supabase Edge Function: runs daily via Supabase cron
// Polls CourtListener for new docket entries and pushes deadlines to the DB

import { createClient } from 'jsr:@supabase/supabase-js@2'

const COURTLISTENER_BASE = 'https://www.courtlistener.com/api/rest/v4'

interface DocketEntry {
  id: number
  date_filed: string
  description: string
  recap_documents: { id: number }[]
}

async function classifyDocketEntry(
  entry: DocketEntry,
  anthropicKey: string
): Promise<{ summary: string; responseDeadline: string | null; type: string }> {
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
      messages: [{ role: 'user', content: `Classify this docket entry: ${entry.description} (filed: ${entry.date_filed})` }],
    }),
  })
  const data = await res.json()
  try {
    const text = data.content[0].text
    return JSON.parse(text)
  } catch {
    return { summary: entry.description.slice(0, 200), responseDeadline: null, type: 'other' }
  }
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
    const since = c.docket_last_checked ?? new Date(Date.now() - 7 * 86400000).toISOString()

    const url = `${COURTLISTENER_BASE}/docket-entries/?docket=${c.courtlistener_docket_id}&date_filed__gte=${since.slice(0, 10)}&format=json`
    const clRes = await fetch(url, {
      headers: clApiToken ? { Authorization: `Token ${clApiToken}` } : {},
    })
    if (!clRes.ok) continue

    const { results: entries } = await clRes.json() as { results: DocketEntry[] }

    for (const entry of (entries ?? [])) {
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
