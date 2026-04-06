import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { isGmailMcpConfigured, readMessage, readThread } from '@/lib/mcp/gmail-client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { messageId } = await params

  if (!isGmailMcpConfigured()) {
    return NextResponse.json({ error: 'Gmail MCP not configured' }, { status: 503 })
  }

  try {
    const message = await readMessage(messageId)
    const thread = await readThread(message.threadId)

    return NextResponse.json({
      threadId: message.threadId,
      messages: thread.messages,
    })
  } catch (err) {
    console.error('[gmail-mcp] Read error:', err)
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 502 })
  }
}
