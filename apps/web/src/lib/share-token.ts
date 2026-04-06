import { randomBytes } from 'crypto'

/** Length of the random bytes used for share tokens. */
export const SHARE_TOKEN_BYTES = 32

/** Default share link lifetime in milliseconds (30 days). */
export const SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Generate a cryptographically secure, URL-safe share token.
 * Produces a 43-character base64url string (256 bits of entropy).
 */
export function generateShareToken(): string {
  return randomBytes(SHARE_TOKEN_BYTES).toString('base64url')
}

/**
 * Return an ISO-8601 expiration timestamp `SHARE_TTL_MS` from now.
 */
export function shareExpiresAt(): string {
  return new Date(Date.now() + SHARE_TTL_MS).toISOString()
}
