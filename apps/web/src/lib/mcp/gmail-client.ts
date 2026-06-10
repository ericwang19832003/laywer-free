// Gmail integration is not available in Edge Runtime deployments.
// StdioClientTransport requires spawning a subprocess which is unsupported in Cloudflare Workers.
// All callers check isGmailMcpConfigured() and return 503 when false.

export interface GmailProfile { email: string }
export interface GmailMessageSummary {
  id: string; threadId: string; from: string; subject: string; date: string; snippet: string
}
export interface GmailMessage {
  id: string; threadId: string; from: string; to: string; subject: string; date: string; body: string
}

export function isGmailMcpConfigured(): boolean {
  return false
}

export async function getGmailProfile(): Promise<GmailProfile | null> { return null }
export async function searchMessages(_query?: string, _maxResults?: number): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string }> { return { messages: [] } }
export async function readMessage(_id: string): Promise<GmailMessage> {
  throw new Error('Gmail not available in this deployment')
}
export async function readThread(_id: string): Promise<{ id: string; messages: GmailMessage[] }> {
  return { id: _id, messages: [] }
}
export async function getThreadTextForAI(_id: string): Promise<string> {
  return ''
}
