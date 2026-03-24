import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

// Singleton MCP client — persists across requests in the same Node process
let mcpClient: Client | null = null

export function isGmailMcpConfigured(): boolean {
  return !!process.env.GMAIL_MCP_COMMAND
}

async function getClient(): Promise<Client> {
  if (mcpClient) return mcpClient

  const command = process.env.GMAIL_MCP_COMMAND
  if (!command) {
    throw new Error('GMAIL_MCP_COMMAND not configured')
  }

  const args = process.env.GMAIL_MCP_ARGS
    ? process.env.GMAIL_MCP_ARGS.split(',').map((s) => s.trim())
    : []

  const transport = new StdioClientTransport({ command, args })
  const client = new Client({ name: 'lawyer-free', version: '1.0.0' })
  await client.connect(transport)
  mcpClient = client
  return client
}

function extractText(result: Awaited<ReturnType<Client['callTool']>>): string {
  if (!('content' in result) || !Array.isArray(result.content)) {
    return JSON.stringify(result)
  }
  return (result.content as Array<{ type: string; text?: string }>)
    .filter((c) => c.type === 'text')
    .map((c) => c.text ?? '')
    .join('\n')
}

/**
 * Call an MCP tool with automatic reconnection on failure.
 */
async function callTool(name: string, args: Record<string, unknown> = {}): Promise<string> {
  try {
    const client = await getClient()
    const result = await client.callTool({ name, arguments: args })
    if (result.isError) {
      throw new Error(extractText(result))
    }
    return extractText(result)
  } catch {
    // Connection might be stale — reconnect once
    mcpClient = null
    const client = await getClient()
    const result = await client.callTool({ name, arguments: args })
    if (result.isError) {
      throw new Error(extractText(result))
    }
    return extractText(result)
  }
}

// ----- Typed wrappers -----

export interface GmailProfile {
  email: string
}

export interface GmailMessageSummary {
  id: string
  threadId: string
  from: string
  subject: string
  date: string
  snippet: string
}

export interface GmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  date: string
  body: string
}

export async function getGmailProfile(): Promise<GmailProfile | null> {
  try {
    const text = await callTool('gmail_get_profile')
    const data = JSON.parse(text)
    return { email: data.emailAddress ?? data.email ?? 'unknown' }
  } catch {
    return null
  }
}

export async function searchMessages(
  query: string,
  maxResults = 20,
  pageToken?: string
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string }> {
  const args: Record<string, unknown> = { q: query, maxResults }
  if (pageToken) args.pageToken = pageToken

  const text = await callTool('gmail_search_messages', args)

  try {
    const data = JSON.parse(text)
    const messages: GmailMessageSummary[] = (data.messages ?? []).map(
      (msg: Record<string, unknown>) => ({
        id: msg.id ?? '',
        threadId: msg.threadId ?? '',
        from: (msg.from ?? '') as string,
        subject: (msg.subject ?? '(no subject)') as string,
        date: (msg.date ?? '') as string,
        snippet: (msg.snippet ?? '') as string,
      })
    )
    return { messages, nextPageToken: data.nextPageToken }
  } catch {
    // Non-JSON response — return empty with raw text for debugging
    console.warn('[gmail-mcp] Non-JSON search response:', text.slice(0, 200))
    return { messages: [] }
  }
}

export async function readMessage(messageId: string): Promise<GmailMessage> {
  const text = await callTool('gmail_read_message', { messageId })

  try {
    const data = JSON.parse(text)
    return {
      id: data.id ?? messageId,
      threadId: data.threadId ?? '',
      from: data.from ?? '',
      to: data.to ?? '',
      subject: data.subject ?? '',
      date: data.date ?? '',
      body: data.body ?? data.text ?? text,
    }
  } catch {
    // Non-JSON — use raw text as body
    return {
      id: messageId,
      threadId: '',
      from: '',
      to: '',
      subject: '',
      date: '',
      body: text,
    }
  }
}

export async function readThread(threadId: string): Promise<{ id: string; messages: GmailMessage[] }> {
  const text = await callTool('gmail_read_thread', { threadId })

  try {
    const data = JSON.parse(text)
    const messages: GmailMessage[] = (data.messages ?? []).map(
      (msg: Record<string, unknown>) => ({
        id: (msg.id ?? '') as string,
        threadId,
        from: (msg.from ?? '') as string,
        to: (msg.to ?? '') as string,
        subject: (msg.subject ?? '') as string,
        date: (msg.date ?? '') as string,
        body: (msg.body ?? msg.text ?? '') as string,
      })
    )
    return { id: threadId, messages }
  } catch {
    // Non-JSON — return single message with raw text
    return {
      id: threadId,
      messages: [
        { id: threadId, threadId, from: '', to: '', subject: '', date: '', body: text },
      ],
    }
  }
}

/**
 * Get raw thread text for AI context (no parsing needed).
 */
export async function getThreadTextForAI(threadId: string): Promise<string> {
  return callTool('gmail_read_thread', { threadId })
}
