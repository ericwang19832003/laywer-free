/**
 * Log an error safely — only the message, never the full error object.
 * Prevents API keys and stack traces from leaking into log systems.
 */
export function safeError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err)
  console.error(`[${context}]`, message)
}
