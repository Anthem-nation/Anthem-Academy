import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: person } = await supabase
    .from('persons')
    .select('role')
    .eq('id', user.id)
    .single()

  if (person?.role !== 'admin') {
    redirect('/dashboard/student')
  }

  return <>{children}</>
}
