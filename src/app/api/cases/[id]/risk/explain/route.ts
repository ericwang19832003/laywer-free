import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { aiRiskExplanationSchema } from '@/lib/schemas/ai-risk-explanation'
import {
  isExplanationSafe,
  buildStaticExplanation,
  buildExplanationPrompt,
  RISK_EXPLANATION_SYSTEM_PROMPT,
} from '@/lib/risk/explain'

const PROMPT_VERSION = '1.0.0'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Load latest risk score for this case
    const { data: riskScore, error: riskError } = await supabase!
      .from('case_risk_scores')
      .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (riskError || !riskScore) {
      return NextResponse.json(
        { error: 'No risk score found. Run risk scoring first.' },
        { status: 404 }
      )
    }

    const breakdown = Array.isArray(riskScore.breakdown) ? riskScore.breakdown : []
    const riskInput = {
      overall_score: riskScore.overall_score,
      risk_level: riskScore.risk_level as 'low' | 'moderate' | 'elevated' | 'high',
      deadline_risk: riskScore.deadline_risk,
      response_risk: riskScore.response_risk,
      evidence_risk: riskScore.evidence_risk,
      activity_risk: riskScore.activity_risk,
      breakdown,
    }

    let explanation = buildStaticExplanation(riskInput)
    let source: 'ai' | 'static' = 'static'

    // Try AI generation if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const userPrompt = buildExplanationPrompt(riskInput)

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: RISK_EXPLANATION_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = completion.choices[0]?.message?.content
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = aiRiskExplanationSchema.safeParse(parsed)

          if (validated.success) {
            // Safety check all text fields
            const allText = [validated.data.summary, ...validated.data.focus_areas].join(' ')
            if (isExplanationSafe(allText)) {
              explanation = validated.data
              source = 'ai'
            }
          }
        }
      } catch {
        // AI failed — static fallback already set
      }
    }

    // Persist explanation into the breakdown JSONB
    const updatedBreakdown = {
      ...(typeof riskScore.breakdown === 'object' && !Array.isArray(riskScore.breakdown)
        ? riskScore.breakdown
        : { items: breakdown }),
      ai_explanation: explanation,
      _meta: {
        model: source === 'ai' ? 'gpt-4o-mini' : null,
        prompt_version: PROMPT_VERSION,
        source,
      },
    }

    await supabase!
      .from('case_risk_scores')
      .update({ breakdown: updatedBreakdown })
      .eq('id', riskScore.id)

    return NextResponse.json({
      ...explanation,
      _meta: {
        model: source === 'ai' ? 'gpt-4o-mini' : null,
        prompt_version: PROMPT_VERSION,
        source,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
