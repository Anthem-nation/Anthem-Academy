import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionForm } from '../_components/SessionForm'

interface PageProps {
  params: Promise<{ id: string; programId: string; cohortId: string }>
}

export default async function NewSessionPage({ params }: PageProps) {
  const { id, programId, cohortId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cohort, error } = await supabase
    .from('cohorts')
    .select('id, name')
    .eq('id', cohortId)
    .eq('program_id', programId)
    .single()

  if (error || !cohort) {
    redirect(`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Sessions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Session</h1>
        <p className="mt-1 text-sm text-gray-500">{cohort.name}</p>
      </div>

      <SessionForm cohortId={cohortId} programId={programId} orgId={id} />
    </div>
  )
}
