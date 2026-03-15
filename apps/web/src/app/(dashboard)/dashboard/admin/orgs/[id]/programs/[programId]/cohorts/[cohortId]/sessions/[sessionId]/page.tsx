import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionForm } from '../_components/SessionForm'
import type { Session } from '@/types'

interface PageProps {
  params: Promise<{ id: string; programId: string; cohortId: string; sessionId: string }>
}

export default async function EditSessionPage({ params }: PageProps) {
  const { id, programId, cohortId, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cohort, error: cohortError } = await supabase
    .from('cohorts')
    .select('id, name')
    .eq('id', cohortId)
    .eq('program_id', programId)
    .single()

  if (cohortError || !cohort) {
    redirect(`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`)
  }

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('cohort_id', cohortId)
    .single()

  if (sessionError || !session) {
    redirect(`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions`)
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
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Session</h1>
        <p className="mt-1 text-sm text-gray-500">{cohort.name}</p>
      </div>

      <SessionForm
        cohortId={cohortId}
        programId={programId}
        orgId={id}
        session={session as Session}
      />
    </div>
  )
}
