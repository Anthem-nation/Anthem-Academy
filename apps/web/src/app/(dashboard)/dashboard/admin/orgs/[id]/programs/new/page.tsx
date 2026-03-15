import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgramForm } from '../_components/ProgramForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewProgramPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', id)
    .single()

  if (orgError || !org) {
    redirect('/dashboard/admin/orgs')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Programs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Program</h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      <ProgramForm orgId={id} />
    </div>
  )
}
