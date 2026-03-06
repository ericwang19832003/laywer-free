import { createAdminClient } from '@/lib/supabase/admin'
import { encryptToken, decryptToken } from '@/lib/crypto/tokens'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me'

interface GmailConnection {
  accessToken: string
  accountId: string
}

export async function getGmailConnection(userId: string): Promise<GmailConnection | null> {
  const admin = createAdminClient()

  const { data: account } = await admin
    .from('connected_accounts')
    .select('id, access_token_encrypted, refresh_token_encrypted, token_expires_at')
    .eq('user_id', userId)
    .eq('provider', 'gmail')
    .is('revoked_at', null)
    .single()

  if (!account) return null

  const expiresAt = new Date(account.token_expires_at).getTime()
  const needsRefresh = Date.now() > expiresAt - 5 * 60 * 1000

  if (needsRefresh) {
    const refreshToken = decryptToken(account.refresh_token_encrypted)
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) {
      console.error('[gmail] Token refresh failed:', await res.text())
      await admin
        .from('connected_accounts')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', account.id)
      return null
    }

    const tokens = await res.json()
    await admin
      .from('connected_accounts')
      .update({
        access_token_encrypted: encryptToken(tokens.access_token),
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      })
      .eq('id', account.id)

    return { accessToken: tokens.access_token, accountId: account.id }
  }

  return {
    accessToken: decryptToken(account.access_token_encrypted),
    accountId: account.id,
  }
}

export async function searchGmailMessages(
  accessToken: string,
  query: string,
  pageToken?: string,
  maxResults = 20
) {
  const params = new URLSearchParams({
    q: query,
    maxResults: String(maxResults),
  })
  if (pageToken) params.set('pageToken', pageToken)

  const res = await fetch(`${GMAIL_API_BASE}/messages?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json() as Promise<{
    messages?: { id: string; threadId: string }[]
    nextPageToken?: string
    resultSizeEstimate?: number
  }>
}

export async function getGmailMessage(accessToken: string, messageId: string) {
  const res = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

export async function getGmailThread(accessToken: string, threadId: string) {
  const res = await fetch(`${GMAIL_API_BASE}/threads/${threadId}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Gmail API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

export function parseEmailBody(payload: Record<string, unknown>): string {
  const body = payload.body as { data?: string; size?: number } | undefined
  if (body?.data) {
    return Buffer.from(body.data, 'base64url').toString('utf8')
  }

  const parts = payload.parts as Array<{
    mimeType: string
    body?: { data?: string }
    parts?: Array<{ mimeType: string; body?: { data?: string } }>
  }> | undefined

  if (!parts) return ''

  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      return Buffer.from(part.body.data, 'base64url').toString('utf8')
    }
    if (part.parts) {
      for (const sub of part.parts) {
        if (sub.mimeType === 'text/plain' && sub.body?.data) {
          return Buffer.from(sub.body.data, 'base64url').toString('utf8')
        }
      }
    }
  }

  for (const part of parts) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      return Buffer.from(part.body.data, 'base64url').toString('utf8')
    }
  }

  return ''
}

export function parseHeaders(
  headers: Array<{ name: string; value: string }>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const h of headers) {
    const key = h.name.toLowerCase()
    if (['from', 'to', 'subject', 'date', 'cc', 'message-id'].includes(key)) {
      result[key] = h.value
    }
  }
  return result
}
