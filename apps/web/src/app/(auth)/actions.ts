'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types'

/**
 * Returns the role-specific dashboard path for a given user ID.
 * Exported for use in the OAuth callback route.
 */
export async function getRoleRedirect(userId: string): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('persons')
    .select('role')
    .eq('id', userId)
    .single()

  const role = (data?.role ?? 'student') as UserRole
  return `/dashboard/${role}`
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  const path = await getRoleRedirect(data.user.id)
  redirect(path)
}

export async function signUpWithEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'student'

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Passed to raw_user_meta_data; trigger reads this to set role in persons table
      data: { role },
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=check-email')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')}/api/auth/callback`,
    },
  })

  if (error || !data.url) {
    redirect('/login?error=oauth_failed')
  }

  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
