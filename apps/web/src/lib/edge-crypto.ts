// Edge Runtime (Cloudflare Workers / Next.js edge) crypto utilities.
// These replace Node.js `crypto` module APIs with Web Crypto API equivalents.

export async function sha256Hex(data: string | Uint8Array | ArrayBuffer): Promise<string> {
  let source: ArrayBuffer
  if (typeof data === 'string') {
    source = new TextEncoder().encode(data).buffer as ArrayBuffer
  } else if (data instanceof ArrayBuffer) {
    source = data
  } else {
    source = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  }
  const buf = await crypto.subtle.digest('SHA-256', source)
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function hmacSha256Hex(key: string, data: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(key)
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export function secureRandomBase64url(byteLength: number): string {
  const arr = crypto.getRandomValues(new Uint8Array(byteLength))
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function safeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
