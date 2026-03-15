import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { UserRole } from '@/types'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  const role = (person?.role ?? 'student') as UserRole

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} email={user.email ?? ''} />
      <main className="flex-1 overflow-auto bg-background p-8">{children}</main>
    </div>
  )
}
