import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleRedirect } from '@/app/(auth)/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const path = await getRoleRedirect(user.id)
  redirect(path)
}
