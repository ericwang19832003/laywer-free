import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import OpenAI from 'openai'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Check cache first
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content')
      .eq('case_id', caseId)
      .eq('cache_key', 'courtroom_script')
      .maybeSingle()

    if (cached) return NextResponse.json({ script: cached.content })

    // Get case details
    const { data: caseData } = await supabase
      .from('cases')
      .select('dispute_type, court_type, county, state')
      .eq('id', caseId)
      .single()

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Get evidence summary
    const { count: evidenceCount } = await supabase
      .from('evidence_items')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `Create a step-by-step courtroom script for a self-represented litigant in a ${caseData.dispute_type.replace(/_/g, ' ')} case in ${caseData.state ?? 'Texas'}, ${caseData.court_type?.replace(/_/g, ' ') ?? 'county'} court. They have ${evidenceCount ?? 0} evidence items.

Return a JSON object with this structure:
{
  "steps": [
    { "phase": "Arrival", "instruction": "...", "tip": "..." },
    { "phase": "Check In", "instruction": "...", "tip": "..." },
    ...
  ]
}

Include phases: Arrival, Check In, Opening Statement, Presenting Evidence, Cross-Examination, Closing Statement, Awaiting Decision. Keep each instruction under 50 words. Make tips practical and encouraging.`
      }],
    })

    const text = completion.choices[0]?.message?.content ?? ''
    let script
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      script = jsonMatch ? JSON.parse(jsonMatch[0]) : { steps: [] }
    } catch {
      script = { steps: [] }
    }

    // Cache the result
    await supabase.from('ai_cache').upsert({
      case_id: caseId,
      cache_key: 'courtroom_script',
      content: script,
    }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({ script })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
