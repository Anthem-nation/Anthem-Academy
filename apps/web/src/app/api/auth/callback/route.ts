import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRoleRedirect } from '@/app/(auth)/actions'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const rolePath = await getRoleRedirect(data.user.id)
      return NextResponse.redirect(`${origin}${rolePath}`)
    }
  }

  // Auth code exchange failed — redirect to error page
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
