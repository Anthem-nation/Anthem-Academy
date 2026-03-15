import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgramForm } from '../_components/ProgramForm'
import type { Program } from '@/types'

interface PageProps {
  params: Promise<{ id: string; programId: string }>
}

export default async function EditProgramPage({ params }: PageProps) {
  const { id, programId } = await params
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

  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .eq('org_id', id)
    .single()

  if (programError || !program) {
    redirect(`/dashboard/admin/orgs/${id}/programs`)
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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Program</h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Details
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Cohorts
        </Link>
      </div>

      <ProgramForm orgId={id} program={program as Program} />
    </div>
  )
}
