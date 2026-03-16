import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GenerateSessionsForm } from './_components/GenerateSessionsForm'

interface PageProps {
  params: Promise<{ id: string; programId: string; cohortId: string }>
}

export default async function GenerateSessionsPage({ params }: PageProps) {
  const { id, programId, cohortId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cohort, error: cohortError } = await supabase
    .from('cohorts')
    .select('id, name, start_date, end_date, org_id, program_id')
    .eq('id', cohortId)
    .eq('program_id', programId)
    .eq('org_id', id)
    .single()

  if (cohortError || !cohort) {
    redirect(`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`)
  }

  const { count: existingScheduledCount } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('cohort_id', cohortId)
    .eq('status', 'scheduled')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Sessions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Generate Sessions</h1>
        <p className="mt-1 text-sm text-gray-500">{cohort.name}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <GenerateSessionsForm
          cohortId={cohortId}
          programId={programId}
          orgId={id}
          cohortStartDate={cohort.start_date ?? ''}
          cohortEndDate={cohort.end_date ?? ''}
          cohortName={cohort.name}
          existingScheduledCount={existingScheduledCount ?? 0}
        />
      </div>
    </div>
  )
}
