import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { isGmailMcpConfigured, getThreadTextForAI, readMessage } from '@/lib/mcp/gmail-client'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

const AI_MODEL = 'claude-sonnet-4-20250514'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth
  const { id: caseId, messageId } = await params

  // Rate limit
  const rl = checkRateLimit(user.id, 'ai_email_reply', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  if (!isGmailMcpConfigured()) {
    return NextResponse.json({ error: 'Gmail MCP not configured' }, { status: 503 })
  }

  // Get case context
  const { data: caseRow } = await supabase
    .from('cases')
    .select('dispute_type, role, county, court_type, status')
    .eq('id', caseId)
    .single()

  if (!caseRow) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  try {
    // Get the message to find its thread
    const message = await readMessage(messageId)

    // Get full thread text for AI context
    const threadText = await getThreadTextForAI(message.threadId)

    const roleLabel = caseRow.role === 'plaintiff' ? 'plaintiff' : 'defendant'
    const disputeLabel = (caseRow.dispute_type ?? 'civil').replace(/_/g, ' ')

    const systemPrompt = `You are a legal communication assistant helping a self-represented ${roleLabel} in a ${disputeLabel} case in ${caseRow.county ?? 'Texas'}. The user needs to reply to an email from opposing counsel.

Guidelines:
- Draft a professional, measured reply
- Never admit liability or fault
- Never make concessions or agree to terms without explicit instruction from the user
- Be factual and reference specific dates or facts when relevant
- Keep the tone professional but firm — not aggressive, not passive
- If the email contains a settlement offer, acknowledge receipt but do not accept or reject
- If the email contains a deadline or legal demand, note it clearly
- If the email contains anything potentially concerning (threats, misrepresentations, or complex legal issues), add a note at the end flagging it for the user
- Add "[REVIEW BEFORE SENDING - AI-generated draft]" at the very top
- Do not include legal citations or case law references
- Keep the reply concise — match the length and formality of the incoming email`

    const userPrompt = `Here is the email thread:\n\n${threadText}\n\nPlease draft a reply to the most recent message.`

    const anthropic = new Anthropic()
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const draft = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    // Audit log (no email content stored)
    console.log(`[email-reply-audit] user=${user.id} case=${caseId} subject="${message.subject ?? 'unknown'}"`)

    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[email-reply] Error:', err)
    return NextResponse.json({ error: 'Failed to generate reply' }, { status: 500 })
  }
}
