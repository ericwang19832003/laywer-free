import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import { config, middleware } from '@/middleware'

const getUser = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser },
  }),
}))

const srcDir = join(process.cwd(), 'src')

describe('Next.js middleware convention', () => {
  it('keeps the Next.js middleware entrypoint for request-level auth', () => {
    expect(existsSync(join(srcDir, 'middleware.ts'))).toBe(true)
    expect(existsSync(join(srcDir, 'proxy.ts'))).toBe(false)
  })

  it('matches protected app routes', () => {
    expect(config.matcher[0]).toContain('_next/static')
    expect(config.matcher[0]).toContain('favicon.ico')
  })

  it('redirects unauthenticated users away from protected pages', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })

    const response = await middleware(new NextRequest('https://example.com/cases'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://example.com/')
  })

  it('returns 401 for unauthenticated protected API routes', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })

    const response = await middleware(new NextRequest('https://example.com/api/cases'))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })
})
