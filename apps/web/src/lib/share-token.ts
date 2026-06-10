import { secureRandomBase64url } from '@/lib/edge-crypto'

export const SHARE_TOKEN_BYTES = 32
export const SHARE_TTL_MS = 30 * 24 * 60 * 60 * 1000

export function generateShareToken(): string {
  return secureRandomBase64url(SHARE_TOKEN_BYTES)
}

export function shareExpiresAt(): string {
  return new Date(Date.now() + SHARE_TTL_MS).toISOString()
}
