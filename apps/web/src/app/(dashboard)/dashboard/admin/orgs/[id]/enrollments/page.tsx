import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrgPendingEnrollments } from '@/lib/queries/enrollments'
import { AssignCohortForm } from './_components/AssignCohortForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrgEnrollmentsPage({ params }: PageProps) {
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

  const { data: enrollments } = await getOrgPendingEnrollments(supabase, id)

  const { data: cohorts } = await supabase
    .from('cohorts')
    .select('id, name, program_id, capacity')
    .eq('org_id', id)
    .in('status', ['upcoming', 'active'])
    .order('name')

  const openCohorts = (cohorts ?? []) as {
    id: string
    name: string
    program_id: string
    capacity: number | null
  }[]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Organization</h1>
        <p className="mt-1 text-sm text-gray-500">{org.name}</p>
      </div>

      {/* Tab nav */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href={`/dashboard/admin/orgs/${id}`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Settings
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/members`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Members
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Programs
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/events`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Events
        </Link>
        <Link
          href={`/dashboard/admin/orgs/${id}/enrollments`}
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
        >
          Enrollments
        </Link>
      </div>

      {/* Pending enrollments table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {!enrollments || enrollments.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No pending enrollments.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Cohort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => {
                const programCohorts = openCohorts.filter(
                  (c) => c.program_id === enrollment.cohort.program_id,
                )
                const enrolledDate = new Date(enrollment.enrolled_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enrollment.person.full_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrollment.person.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enrollment.cohort.program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {enrollment.cohort.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrolledDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <AssignCohortForm
                        enrollmentId={enrollment.id}
                        orgId={id}
                        currentCohortId={enrollment.cohort_id}
                        cohorts={programCohorts}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
