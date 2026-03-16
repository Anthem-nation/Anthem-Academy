import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Program } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrgProgramsPage({ params }: PageProps) {
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

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .eq('org_id', id)
    .order('name')

  const typedPrograms = (programs ?? []) as Program[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          className="px-4 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
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
          className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
        >
          Enrollments
        </Link>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Programs</h2>
        <Link
          href={`/dashboard/admin/orgs/${id}/programs/new`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          + New Program
        </Link>
      </div>

      {/* Program list */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        {typedPrograms.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No programs yet. Create the first program above.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {typedPrograms.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {p.subject ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      p.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/dashboard/admin/orgs/${id}/programs/${p.id}`}
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
