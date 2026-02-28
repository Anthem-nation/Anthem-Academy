import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — populated in issue #2 */}
      <aside className="w-64 border-r bg-card" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
