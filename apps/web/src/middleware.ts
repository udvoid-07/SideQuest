import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/quests', '/profile']
const AUTH_ONLY = ['/login', '/signup']

// ─── Simple in-memory rate limiter ───────────────────────
// Replace with @upstash/ratelimit + Redis in production
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((v, k) => {
    if (now > v.resetAt) rateLimitStore.delete(k)
  })
}, 300_000)

export async function middleware(request: NextRequest) {
  const ip  = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const path = request.nextUrl.pathname

  // ── Rate limiting ─────────────────────────────────────
  // Auth endpoints: 10 attempts per minute
  if (path === '/login' || path === '/signup' || path === '/api/auth') {
    if (checkRateLimit(`auth:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
  }

  // AI endpoints: strict 15 requests per minute (each call is expensive)
  if (path.startsWith('/api/ai/')) {
    if (checkRateLimit(`ai:${ip}`, 15, 60_000)) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded. Please wait a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
  }

  // Other API routes: 60 requests per minute
  if (path.startsWith('/api/') && !path.startsWith('/api/ai/')) {
    if (checkRateLimit(`api:${ip}`, 60, 60_000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }
  }

  // ── Auth guard ────────────────────────────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && PROTECTED.some(r => path.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && AUTH_ONLY.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
