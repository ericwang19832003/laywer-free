import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateInsights } from '@/lib/insights/rules'
import { safeEquals } from '@/lib/security/timing-safe'

export const maxDuration = 300

const BATCH_SIZE = 50

export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (!safeEquals(authHeader ?? '', `Bearer ${process.env.CRON_SECRET ?? ''}`)) {
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

  const allCases = cases ?? []

  // Process in batches
  for (let i = 0; i < allCases.length; i += BATCH_SIZE) {
    const batch = allCases.slice(i, i + BATCH_SIZE)
    const batchIds = batch.map((c) => c.id)

    // Fetch tasks, deadlines, and evidence counts for the whole batch at once
    const [batchTasks, batchDeadlines, batchEvidence] = await Promise.all([
      supabase.from('tasks').select('case_id, task_key, status, completed_at').in('case_id', batchIds),
      supabase.from('deadlines').select('case_id, key, due_at').in('case_id', batchIds),
      supabase.from('evidence_items').select('case_id').in('case_id', batchIds),
    ])

    const tasksByCase = new Map<string, typeof batchTasks.data>()
    for (const t of batchTasks.data ?? []) {
      const arr = tasksByCase.get(t.case_id) ?? []
      arr.push(t)
      tasksByCase.set(t.case_id, arr)
    }

    const deadlinesByCase = new Map<string, typeof batchDeadlines.data>()
    for (const d of batchDeadlines.data ?? []) {
      const arr = deadlinesByCase.get(d.case_id) ?? []
      arr.push(d)
      deadlinesByCase.set(d.case_id, arr)
    }

    const evidenceCountByCase = new Map<string, number>()
    for (const e of batchEvidence.data ?? []) {
      evidenceCountByCase.set(e.case_id, (evidenceCountByCase.get(e.case_id) ?? 0) + 1)
    }

    for (const caseRow of batch) {
      const tasks = tasksByCase.get(caseRow.id) ?? []
      const deadlines = deadlinesByCase.get(caseRow.id) ?? []
      const evidenceCount = evidenceCountByCase.get(caseRow.id) ?? 0

      const insights = generateInsights({
        caseId: caseRow.id,
        disputeType: caseRow.dispute_type,
        createdAt: caseRow.created_at,
        tasks,
        deadlines,
        evidenceCount,
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
  }

  return NextResponse.json({ processed, insightsGenerated })
}
