import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { confirmServiceFactsSchema } from '@/lib/schemas/service-facts'
import { computeDeadlinesFromServiceFacts } from '@/lib/rules/tx-v1'
import { calculateReminderDates } from '@/lib/rules/reminders'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Validate body
    const body = await request.json()
    const parsed = confirmServiceFactsSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { extraction_id, served_at, return_filed_at, service_method, served_to, server_name } = parsed.data

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

    // Verify extraction exists and belongs to this case
    const { data: extraction, error: extractionError } = await supabase!
      .from('document_extractions')
      .select('id, case_id')
      .eq('id', extraction_id)
      .single()

    if (extractionError || !extraction) {
      return NextResponse.json(
        { error: 'Extraction not found' },
        { status: 404 }
      )
    }

    if (extraction.case_id !== caseId) {
      return NextResponse.json(
        { error: 'Extraction does not belong to this case' },
        { status: 422 }
      )
    }

    // Upsert service_facts (case_id has UNIQUE constraint — idempotent)
    const now = new Date().toISOString()
    const { data: serviceFacts, error: upsertError } = await supabase!
      .from('service_facts')
      .upsert(
        {
          case_id: caseId,
          served_at: served_at || null,
          return_filed_at: return_filed_at || null,
          service_method: service_method || null,
          served_to: served_to || null,
          server_name: server_name || null,
          source_extraction_id: extraction_id,
          user_confirmed_at: now,
        },
        { onConflict: 'case_id' }
      )
      .select()
      .single()

    if (upsertError) {
      return NextResponse.json(
        { error: 'Failed to save service facts', details: upsertError.message },
        { status: 500 }
      )
    }

    // Mark extraction as confirmed
    await supabase!
      .from('document_extractions')
      .update({
        confirmed_by_user: true,
        confirmed_fields: { served_at, return_filed_at, service_method, served_to, server_name },
      })
      .eq('id', extraction_id)

    // --- Generate deadlines (idempotent: delete old system deadlines first) ---
    // Delete existing system-generated deadlines for this case
    // (reminders cascade-delete via FK)
    await supabase!
      .from('deadlines')
      .delete()
      .eq('case_id', caseId)
      .eq('source', 'system')

    // Compute new deadlines from confirmed service facts
    const computed = computeDeadlinesFromServiceFacts({ served_at, return_filed_at })
    const createdDeadlines: { id: string; key: string; due_at: string }[] = []

    for (const dl of computed) {
      const { data: deadline, error: dlError } = await supabase!
        .from('deadlines')
        .insert({
          case_id: caseId,
          key: dl.key,
          due_at: dl.due_at,
          source: 'system',
          rationale: dl.rationale,
        })
        .select('id, key, due_at')
        .single()

      if (dlError || !deadline) {
        console.error(`Failed to create deadline ${dl.key}:`, dlError?.message)
        continue
      }

      createdDeadlines.push(deadline)

      // Create reminders at -7d, -3d, -1d (only future dates)
      const reminderDates = calculateReminderDates(dl.due_at)
      if (reminderDates.length > 0) {
        const remindersToInsert = reminderDates.map((sendAt) => ({
          case_id: caseId,
          deadline_id: deadline.id,
          channel: 'email' as const,
          send_at: sendAt.toISOString(),
          status: 'scheduled' as const,
        }))

        const { error: remErr } = await supabase!
          .from('reminders')
          .insert(remindersToInsert)

        if (remErr) {
          console.error(`Failed to create reminders for ${dl.key}:`, remErr.message)
        }
      }
    }

    // Write timeline events
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'service_facts_confirmed',
      payload: {
        service_facts_id: serviceFacts.id,
        extraction_id,
        served_at,
        return_filed_at,
        service_method,
        served_to,
        server_name,
      },
    })

    if (createdDeadlines.length > 0) {
      await supabase!.from('task_events').insert({
        case_id: caseId,
        kind: 'deadlines_generated',
        payload: {
          calc_version: 'TX_V1',
          deadlines: createdDeadlines.map((d) => ({
            id: d.id,
            key: d.key,
            due_at: d.due_at,
          })),
        },
      })
    }

    return NextResponse.json({ service_facts: serviceFacts, deadlines: createdDeadlines }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
