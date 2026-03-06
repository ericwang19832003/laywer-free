import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getGmailConnection, getGmailMessage, getGmailThread, parseHeaders, parseEmailBody } from '@/lib/gmail/client'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { user } = auth
  const { messageId } = await params

  const gmail = await getGmailConnection(user.id)
  if (!gmail) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 })
  }

  try {
    const message = await getGmailMessage(gmail.accessToken, messageId)
    const threadId = message.threadId
    const thread = await getGmailThread(gmail.accessToken, threadId)

    const messages = (thread.messages ?? []).map((msg: Record<string, unknown>) => {
      const payload = msg.payload as Record<string, unknown>
      const headers = parseHeaders((payload?.headers ?? []) as Array<{ name: string; value: string }>)
      return {
        id: msg.id as string,
        from: headers.from ?? '',
        to: headers.to ?? '',
        subject: headers.subject ?? '',
        date: headers.date ?? '',
        body: parseEmailBody(payload),
      }
    })

    return NextResponse.json({ threadId, messages })
  } catch (err) {
    console.error('[gmail-thread] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch email' }, { status: 502 })
  }
}
