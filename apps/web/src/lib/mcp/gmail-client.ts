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

// ----- Text format parsers for @gongrzhe/server-gmail-autoauth-mcp -----
// search_emails response: repeated blocks of "ID: ...\nSubject: ...\nFrom: ...\nDate: ...\n"
// read_email response:    "Thread ID: ...\nSubject: ...\nFrom: ...\nTo: ...\nDate: ...\n\n<body>"

function parseHeaderLine(text: string, key: string): string {
  const regex = new RegExp(`^${key}:\\s*(.*)$`, 'm')
  return text.match(regex)?.[1]?.trim() ?? ''
}

function parseSearchResults(text: string): GmailMessageSummary[] {
  // Each message block ends with a blank line; split on double-newline
  const blocks = text.split(/\n{2,}/).filter((b) => b.includes('ID:'))
  return blocks.map((block) => ({
    id: parseHeaderLine(block, 'ID'),
    threadId: parseHeaderLine(block, 'Thread ID') || parseHeaderLine(block, 'ID'),
    from: parseHeaderLine(block, 'From'),
    subject: parseHeaderLine(block, 'Subject') || '(no subject)',
    date: parseHeaderLine(block, 'Date'),
    snippet: '',
  }))
}

function parseReadEmail(text: string, fallbackId: string): GmailMessage {
  // Header block ends at first blank line; everything after is body
  const blankIdx = text.indexOf('\n\n')
  const header = blankIdx !== -1 ? text.slice(0, blankIdx) : text
  const body = blankIdx !== -1 ? text.slice(blankIdx + 2) : ''

  return {
    id: fallbackId,
    threadId: parseHeaderLine(header, 'Thread ID') || fallbackId,
    from: parseHeaderLine(header, 'From'),
    to: parseHeaderLine(header, 'To'),
    subject: parseHeaderLine(header, 'Subject') || '(no subject)',
    date: parseHeaderLine(header, 'Date'),
    body: body.trim(),
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
    // Fetch one sent message to read the user's own From address
    const text = await callTool('search_emails', { query: 'in:sent', maxResults: 1 })
    const from = parseHeaderLine(text, 'From')
    // Extract bare email from "Display Name <email>" or plain "email"
    const match = from.match(/<([^>]+)>/) ?? from.match(/\S+@\S+/)
    const email = match ? (match[1] ?? match[0]) : from
    return { email: email || 'unknown' }
  } catch {
    return null
  }
}

export async function searchMessages(
  query: string,
  maxResults = 20,
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string }> {
  const text = await callTool('search_emails', { query, maxResults })
  return { messages: parseSearchResults(text) }
}

export async function readMessage(messageId: string): Promise<GmailMessage> {
  const text = await callTool('read_email', { messageId })
  return parseReadEmail(text, messageId)
}

export async function readThread(threadId: string): Promise<{ id: string; messages: GmailMessage[] }> {
  // Phase 1: read_email fetches a single message; treat it as a one-message thread
  const text = await callTool('read_email', { messageId: threadId })
  const msg = parseReadEmail(text, threadId)
  return { id: threadId, messages: [msg] }
}

/**
 * Get raw thread text for AI context (no parsing needed).
 */
export async function getThreadTextForAI(threadId: string): Promise<string> {
  return callTool('read_email', { messageId: threadId })
}
