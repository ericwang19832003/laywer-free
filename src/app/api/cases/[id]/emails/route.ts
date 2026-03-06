import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { isGmailMcpConfigured, searchMessages, readMessage } from '@/lib/mcp/gmail-client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { id: caseId } = await params

  if (!isGmailMcpConfigured()) {
    return NextResponse.json({ error: 'Gmail MCP not configured' }, { status: 503 })
  }

  const { data: filters } = await supabase
    .from('case_email_filters')
    .select('email_address')
    .eq('case_id', caseId)

  if (!filters || filters.length === 0) {
    return NextResponse.json({ emails: [], nextPageToken: null })
  }

  const fromQuery = filters.map((f) => `from:${f.email_address}`).join(' OR ')
  const pageToken = request.nextUrl.searchParams.get('pageToken') ?? undefined

  try {
    const result = await searchMessages(fromQuery, 20, pageToken)

    // If the MCP server returned summaries with IDs but missing details,
    // fetch individual messages to fill in the data
    const emails = await Promise.all(
      result.messages.map(async (msg) => {
        if (msg.from && msg.subject && msg.date) return msg
        // MCP server returned only IDs — fetch details
        try {
          const full = await readMessage(msg.id)
          return {
            id: msg.id,
            threadId: msg.threadId || full.threadId,
            from: full.from,
            subject: full.subject || '(no subject)',
            date: full.date,
            snippet: msg.snippet || full.body.slice(0, 120),
          }
        } catch {
          return msg
        }
      })
    )

    return NextResponse.json({
      emails,
      nextPageToken: result.nextPageToken ?? null,
    })
  } catch (err) {
    console.error('[gmail-mcp] Search error:', err)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 502 })
  }
}
