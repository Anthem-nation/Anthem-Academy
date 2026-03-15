import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ archived?: string }>
}

export default async function OrgsPage({ searchParams }: PageProps) {
  const { archived } = await searchParams
  const showArchived = archived === '1'

  const supabase = await createClient()

  const query = supabase
    .from('organizations')
    .select('id, name, slug, logo_url, is_active, archived_at, created_at')
    .order('name')

  if (showArchived) {
    query.not('archived_at', 'is', null)
  } else {
    query.is('archived_at', null)
  }

  const { data: orgs, error } = await query

  if (error) {
    redirect('/dashboard/admin')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all organizations on the platform.
          </p>
        </div>
        <Link
          href="/dashboard/admin/orgs/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          + New Organization
        </Link>
      </div>

      {/* Active / Archived tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <Link
          href="/dashboard/admin/orgs"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            !showArchived
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
        </Link>
        <Link
          href="/dashboard/admin/orgs?archived=1"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            showArchived
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Archived
        </Link>
      </div>

      {/* Org list */}
      {!orgs || orgs.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {showArchived ? 'No archived organizations.' : 'No organizations yet. Create one to get started.'}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{org.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono">{org.slug}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        org.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/dashboard/admin/orgs/${org.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
