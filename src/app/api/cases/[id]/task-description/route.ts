import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  taskDescriptionSchema,
  isTaskDescriptionSafe,
  getStaticTaskDescription,
  buildTaskDescriptionPrompt,
  TASK_DESCRIPTION_SYSTEM_PROMPT,
} from '@/lib/ai/task-descriptions'

export const runtime = 'nodejs'
export const maxDuration = 30

const AI_MODEL = 'gpt-4o-mini'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const taskKey = request.nextUrl.searchParams.get('task_key')
    if (!taskKey) {
      return NextResponse.json({ error: 'task_key is required' }, { status: 400 })
    }

    // Fetch case context
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, role, court_type, dispute_type')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Fetch task title
    const { data: task } = await supabase
      .from('tasks')
      .select('title, metadata')
      .eq('case_id', caseId)
      .eq('task_key', taskKey)
      .single()

    // Check if we already have a cached AI description in task metadata
    const existing = task?.metadata as Record<string, unknown> | null
    if (existing?.ai_description) {
      return NextResponse.json({
        ...(existing.ai_description as Record<string, unknown>),
        _meta: { source: 'cached' },
      })
    }

    // Build static fallback first
    let result = getStaticTaskDescription(taskKey)
    let source: 'ai' | 'static' = 'static'

    // Fetch completed tasks for context
    const { data: completedTasks } = await supabase
      .from('tasks')
      .select('task_key')
      .eq('case_id', caseId)
      .eq('status', 'completed')

    // Try AI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildTaskDescriptionPrompt({
          task_key: taskKey,
          task_title: task?.title ?? taskKey,
          court_type: caseData.court_type ?? 'unknown',
          dispute_type: caseData.dispute_type,
          role: caseData.role ?? 'plaintiff',
          completed_tasks: (completedTasks ?? []).map((t) => t.task_key),
        })

        const completion = await openai.chat.completions.create({
          model: AI_MODEL,
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: TASK_DESCRIPTION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = taskDescriptionSchema.safeParse(parsed)
          if (validated.success && isTaskDescriptionSafe(validated.data.description)) {
            result = validated.data
            source = 'ai'
          }
        }
      } catch (err) {
        console.error('[task-description] AI call failed, using static fallback:', err)
      }
    }

    // Cache in task metadata (fire-and-forget)
    if (task && source === 'ai') {
      supabase
        .from('tasks')
        .update({
          metadata: { ...(existing ?? {}), ai_description: result },
        })
        .eq('case_id', caseId)
        .eq('task_key', taskKey)
        .then(() => {})
    }

    return NextResponse.json({
      ...result,
      _meta: { source, model: source === 'ai' ? AI_MODEL : null },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
