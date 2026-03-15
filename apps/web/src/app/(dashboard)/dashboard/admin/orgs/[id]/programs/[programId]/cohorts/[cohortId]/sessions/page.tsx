import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Session } from '@/types'

interface PageProps {
  params: Promise<{ id: string; programId: string; cohortId: string }>
}

export default async function CohortSessionsPage({ params }: PageProps) {
  const { id, programId, cohortId } = await params
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

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('cohort_id', cohortId)
    .order('starts_at')

  const typedSessions = (sessions ?? []) as Session[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Cohorts
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Cohort</h1>
        <p className="mt-1 text-sm text-gray-500">{cohort.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Details
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Sessions
        </Link>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions/new`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          + New Session
        </Link>
      </div>

      {/* Session list */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {typedSessions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No sessions yet. Create the first session above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Starts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typedSessions.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(s.starts_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${cohortId}/sessions/${s.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
