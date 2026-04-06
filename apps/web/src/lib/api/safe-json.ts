import { NextRequest, NextResponse } from 'next/server'
import type { z } from 'zod'

type SafeJsonSuccess<T> = { ok: true; data: T }
type SafeJsonFailure = { ok: false; error: NextResponse }
export type SafeJsonResult<T> = SafeJsonSuccess<T> | SafeJsonFailure

export async function safeJson<T>(
  request: NextRequest,
  schema?: z.ZodType<T>
): Promise<SafeJsonResult<T>> {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return {
      ok: false,
      error: NextResponse.json(
        { error: 'We couldn\'t understand the request. Please try again.' },
        { status: 400 }
      ),
    }
  }

  if (!schema) {
    return { ok: true, data: body as T }
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    return {
      ok: false,
      error: NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 422 }
      ),
    }
  }

  return { ok: true, data: result.data }
}
