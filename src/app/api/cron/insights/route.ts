import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInsights } from '@/lib/insights/rules'

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Get all active cases (not archived)
  const { data: cases } = await supabase
    .from('cases')
    .select('id, dispute_type, created_at, incident_date')
    .neq('status', 'archived')

  let processed = 0
  let insightsGenerated = 0

  for (const caseRow of cases ?? []) {
    const [
      { data: tasks },
      { data: deadlines },
      { count: evidenceCount },
    ] = await Promise.all([
      supabase.from('tasks').select('task_key, status, completed_at').eq('case_id', caseRow.id),
      supabase.from('deadlines').select('key, due_at').eq('case_id', caseRow.id),
      supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseRow.id),
    ])

    const insights = generateInsights({
      caseId: caseRow.id,
      disputeType: caseRow.dispute_type,
      createdAt: caseRow.created_at,
      tasks: tasks ?? [],
      deadlines: deadlines ?? [],
      evidenceCount: evidenceCount ?? 0,
      incidentDate: caseRow.incident_date,
    })

    const activeInsightTypes = new Set(insights.map(i => i.insight_type))

    // Upsert insights — update existing or insert new, but respect dismissed ones
    for (const insight of insights) {
      // Check if this insight_type was previously dismissed — don't recreate it
      const { data: dismissed } = await supabase
        .from('case_insights')
        .select('id')
        .eq('case_id', caseRow.id)
        .eq('insight_type', insight.insight_type)
        .eq('dismissed', true)
        .limit(1)
        .maybeSingle()

      if (dismissed) continue // User dismissed this — respect their choice

      const { data: existing } = await supabase
        .from('case_insights')
        .select('id, title, body, priority')
        .eq('case_id', caseRow.id)
        .eq('insight_type', insight.insight_type)
        .eq('dismissed', false)
        .maybeSingle()

      if (existing) {
        // Update if content changed (e.g. countdown text)
        if (existing.title !== insight.title || existing.body !== insight.body || existing.priority !== insight.priority) {
          await supabase.from('case_insights').update({
            title: insight.title,
            body: insight.body,
            priority: insight.priority,
          }).eq('id', existing.id)
          insightsGenerated++
        }
      } else {
        await supabase.from('case_insights').insert({
          case_id: caseRow.id,
          ...insight,
        })
        insightsGenerated++
      }
    }

    // Retire stale insights whose rules no longer fire
    const { data: staleInsights } = await supabase
      .from('case_insights')
      .select('id, insight_type')
      .eq('case_id', caseRow.id)
      .eq('dismissed', false)

    for (const stale of staleInsights ?? []) {
      if (!activeInsightTypes.has(stale.insight_type)) {
        await supabase.from('case_insights').update({ dismissed: true }).eq('id', stale.id)
      }
    }

    processed++
  }

  return NextResponse.json({ processed, insightsGenerated })
}
