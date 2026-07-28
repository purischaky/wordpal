import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured, getSupabasePublicEnv } from '@/lib/env'
import { checkRoleAccess, pathToAdminSection, getRoleFromClaims } from '@/lib/services/role-service'

/**
 * Optimistic, cookie-only authorization check that runs on every request
 * (including prefetches). Per Next.js guidance, this must never touch the
 * database — it only reads the role Supabase already embedded in the JWT
 * (see supabase/migrations/0001_roles.sql: user_roles -> app_metadata.role).
 *
 * This is the FIRST line of defense, not the only one: every RLS policy
 * and every SECURITY DEFINER RPC re-checks the role against the
 * `user_roles` table, so a stale or tampered JWT can never grant real
 * access — it can only cause an unnecessary redirect here.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (!isSupabaseConfigured()) {
    // Fail closed: without Supabase configured, nothing in this app can
    // authenticate anyone, so admin/API/protected routes must not be
    // reachable. Only truly public marketing/demo routes pass through.
    if (isAdminRoute(pathname) || isProtectedRoute(pathname) || pathname.startsWith('/api/admin')) {
      return configErrorResponse(pathname)
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })
  const { url, anonKey } = getSupabasePublicEnv()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  try {
    const { data, error } = await supabase.auth.getClaims()
    const claims = error ? null : data?.claims ?? null

    const isApiAdminRoute = pathname.startsWith('/api/admin')

    if (!claims && (isProtectedRoute(pathname) || isAdminRoute(pathname))) {
      return redirectToSignIn(request)
    }

    if (!claims && isApiAdminRoute) {
      return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (claims && (isAdminRoute(pathname) || isApiAdminRoute)) {
      // Let /admin/denied render without a further role check.
      if (pathname === '/admin/denied') {
        return supabaseResponse
      }

      const role = getRoleFromClaims(claims)
      const section = isApiAdminRoute ? apiPathToAdminSection(pathname) : pathToAdminSection(pathname)
      const result = checkRoleAccess(role, section)

      if (!result.authorized) {
        if (isApiAdminRoute) {
          return new NextResponse(JSON.stringify({ error: 'Insufficient permissions' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        const deniedUrl = request.nextUrl.clone()
        deniedUrl.pathname = '/admin/denied'
        deniedUrl.search = ''
        return NextResponse.redirect(deniedUrl)
      }
    }
  } catch {
    // Supabase call failed (network/service outage). Fail closed on
    // anything that requires auth; let public routes through unaffected.
    if (isAdminRoute(pathname) || pathname.startsWith('/api/admin')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Service temporarily unavailable',
          message: 'Authentication service is temporarily unavailable. Please try again later.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (isProtectedRoute(pathname)) {
      return redirectToSignIn(request)
    }
    return NextResponse.next()
  }

  return supabaseResponse
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/leaderboard')
  )
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

/**
 * Maps an /api/admin/... path to the same AdminSection vocabulary used
 * for /admin/... pages, by stripping the /api prefix before delegating
 * to the single source of truth in role-service.ts.
 */
function apiPathToAdminSection(pathname: string) {
  return pathToAdminSection(pathname.replace(/^\/api/, ''))
}

function redirectToSignIn(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = '/auth/signin'
  url.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

function configErrorResponse(pathname: string): NextResponse {
  if (pathname.startsWith('/api')) {
    return new NextResponse(
      JSON.stringify({ error: 'Server misconfigured: Supabase environment variables are missing' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return NextResponse.redirect(new URL('/auth/signin?error=config', pathname))
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
