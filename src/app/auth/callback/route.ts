import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/services/supabase-server';

/**
 * PKCE callback handler. @supabase/ssr uses the PKCE flow for email
 * confirmation links and any future OAuth providers — both send the
 * browser here with a `code` query param that must be exchanged for a
 * session. Without this route, confirming a signup or completing an
 * OAuth login silently fails to establish a session.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_failed`);
}
