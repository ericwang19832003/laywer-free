import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/pricing', '/courts', '/help']
const PUBLIC_PATH_PREFIXES = ['/shared', '/api/cron', '/assess', '/api/webhooks', '/learn-more', '/learn']

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CSRF: Check Origin header on state-mutating requests
  // Skip CSRF for webhook endpoints (external services like Stripe send POSTs)
  const method = request.method
  const isWebhook = request.nextUrl.pathname.startsWith('/api/webhooks')
  if (!isWebhook && (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE')) {
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin === 'null') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (origin && host) {
      try {
        const originHost = new URL(origin).host
        if (originHost !== host) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users (pages and API routes alike)
  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    // API routes get 401, pages get redirected
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
