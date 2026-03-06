import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { getGmailConnection, searchGmailMessages, getGmailMessage, parseHeaders } from '@/lib/gmail/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth
  const { id: caseId } = await params

  const gmail = await getGmailConnection(user.id)
  if (!gmail) {
    return NextResponse.json({ error: 'Gmail not connected' }, { status: 403 })
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
    const result = await searchGmailMessages(gmail.accessToken, fromQuery, pageToken)

    if (!result.messages || result.messages.length === 0) {
      return NextResponse.json({ emails: [], nextPageToken: null })
    }

    const emails = await Promise.all(
      result.messages.map(async (msg) => {
        const full = await getGmailMessage(gmail.accessToken, msg.id)
        const headers = parseHeaders(full.payload?.headers ?? [])
        return {
          id: msg.id,
          threadId: msg.threadId,
          from: headers.from ?? '',
          subject: headers.subject ?? '(no subject)',
          date: headers.date ?? '',
          snippet: full.snippet ?? '',
        }
      })
    )

    return NextResponse.json({
      emails,
      nextPageToken: result.nextPageToken ?? null,
    })
  } catch (err) {
    console.error('[gmail-fetch] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 502 })
  }
}
