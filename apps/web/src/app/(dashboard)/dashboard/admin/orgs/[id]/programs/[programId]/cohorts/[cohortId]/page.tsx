import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CohortForm } from '../_components/CohortForm'
import type { Cohort } from '@/types'

interface PageProps {
  params: Promise<{ id: string; programId: string; cohortId: string }>
}

export default async function EditCohortPage({ params }: PageProps) {
  const { id, programId, cohortId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program, error: programError } = await supabase
    .from('programs')
    .select('id, name')
    .eq('id', programId)
    .eq('org_id', id)
    .single()

  if (programError || !program) {
    redirect(`/dashboard/admin/orgs/${id}/programs`)
  }

  const { data: cohort, error: cohortError } = await supabase
    .from('cohorts')
    .select('*')
    .eq('id', cohortId)
    .eq('program_id', programId)
    .single()

  if (cohortError || !cohort) {
    redirect(`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Cohorts
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Cohort</h1>
        <p className="mt-1 text-sm text-gray-500">{program.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Details
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Sessions
        </Link>
      </div>

      <CohortForm orgId={id} programId={programId} cohort={cohort as Cohort} />
    </div>
  )
}
