import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Cohort } from '@/types'

interface PageProps {
  params: Promise<{ id: string; programId: string }>
}

export default async function ProgramCohortsPage({ params }: PageProps) {
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
    .select('id, name')
    .eq('id', programId)
    .eq('org_id', id)
    .single()

  if (programError || !program) {
    redirect(`/dashboard/admin/orgs/${id}/programs`)
  }

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('*')
    .eq('program_id', programId)
    .order('name')

  const typedCohorts = (cohorts ?? []) as Cohort[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs`}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Programs
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Program</h1>
        <p className="mt-1 text-sm text-gray-500">{program.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Details
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Cohorts
        </Link>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Cohorts</h2>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/new`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          + New Cohort
        </Link>
      </div>

      {/* Cohort list */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {typedCohorts.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No cohorts yet. Create the first cohort above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typedCohorts.map((c) => (
                <tr key={c.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.start_date && c.end_date
                      ? `${c.start_date} – ${c.end_date}`
                      : c.start_date ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/dashboard/admin/orgs/${id}/programs/${programId}/cohorts/${c.id}`}
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
