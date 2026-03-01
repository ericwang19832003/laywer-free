import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { computeAndStoreCaseHealth } from '@/lib/rules/compute-case-health'
import { evaluateHealthAlert, insertHealthAlertIfNeeded } from '@/lib/rules/health-alert'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS handles ownership)
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

    const result = await computeAndStoreCaseHealth(supabase!, caseId)

    // Evaluate and insert health alert if score is concerning
    try {
      const action = evaluateHealthAlert(caseId, result.overall_score)
      if (action) {
        const inserted = await insertHealthAlertIfNeeded(supabase!, action)
        if (inserted) {
          await supabase!.from('task_events').insert({
            case_id: caseId,
            kind: 'health_alert_triggered',
            payload: {
              escalation_level: action.escalation_level,
              overall_score: result.overall_score,
            },
          })
        }
      }
    } catch (alertErr) {
      console.error(`[run-risk-score] Health alert failed for case ${caseId}:`, alertErr)
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
