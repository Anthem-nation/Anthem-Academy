import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CohortForm } from '../_components/CohortForm'

interface PageProps {
  params: Promise<{ id: string; programId: string }>
}

export default async function NewCohortPage({ params }: PageProps) {
  const { id, programId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program, error } = await supabase
    .from('programs')
    .select('id, name')
    .eq('id', programId)
    .eq('org_id', id)
    .single()

  if (error || !program) {
    redirect(`/dashboard/admin/orgs/${id}/programs`)
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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">New Cohort</h1>
        <p className="mt-1 text-sm text-gray-500">{program.name}</p>
      </div>

      <CohortForm orgId={id} programId={programId} />
    </div>
  )
}
