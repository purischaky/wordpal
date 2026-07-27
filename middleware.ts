import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  checkRoleAccess,
  getUserRoleFromMetadata,
  pathToAdminSection,
  withRoleVerificationTimeout,
  RoleVerificationTimeoutError,
} from '@/lib/services/role-service'

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, skip auth checks entirely (allows demo to work)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your-supabase-url') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
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

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Define protected routes (learner-facing)
    const isProtectedRoute =
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/lessons') ||
      request.nextUrl.pathname.startsWith('/progress') ||
      request.nextUrl.pathname.startsWith('/leaderboard')

    if (!user && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/signin'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // ─── Admin Route Gating ─────────────────────────────────────────────
    if (isAdminRoute) {
      // Requirement 2.2: Unauthenticated users → redirect to sign-in with redirect param
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
      }

      // Allow the /admin/denied page to render without further role checks
      if (request.nextUrl.pathname === '/admin/denied') {
        return supabaseResponse
      }

      // Wrap role verification in a 5-second timeout (Req 2.8)
      try {
        const roleCheckResult = await withRoleVerificationTimeout(
          performRoleCheck(user, request.nextUrl.pathname)
        )

        if (!roleCheckResult.authorized) {
          // Requirement 2.3, 2.10: Students, no-role, invalid-role → redirect to denied
          const url = request.nextUrl.clone()
          url.pathname = '/admin/denied'
          url.search = ''
          return NextResponse.redirect(url)
        }
      } catch (error) {
        // Requirement 2.8: Timeout → deny access, return 503
        if (error instanceof RoleVerificationTimeoutError) {
          return new NextResponse(
            JSON.stringify({
              error: 'Service temporarily unavailable',
              message: 'Role verification service did not respond in time. Please try again later.',
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
        // For other errors during role check, deny access
        const url = request.nextUrl.clone()
        url.pathname = '/admin/denied'
        url.search = ''
        return NextResponse.redirect(url)
      }
    }
  } catch {
    // If Supabase call fails and it's an admin route, deny access
    if (isAdminRoute) {
      return new NextResponse(
        JSON.stringify({
          error: 'Service temporarily unavailable',
          message: 'Authentication service is temporarily unavailable. Please try again later.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    // For non-admin routes, allow through (existing behavior)
    return NextResponse.next()
  }

  return supabaseResponse
}

/**
 * Performs the role check for an authenticated user on an admin route.
 * This is extracted as an async function so it can be wrapped in a timeout.
 */
async function performRoleCheck(
  user: { user_metadata?: Record<string, unknown> },
  pathname: string,
) {
  // Get the user's role from their metadata
  const role = getUserRoleFromMetadata(user.user_metadata)

  // Map the URL path to an admin section
  const section = pathToAdminSection(pathname)

  // Check access
  return checkRoleAccess(role, section)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
