import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Pagination from '../_components/Pagination'
import { getPaginationRange, PAGE_SIZE } from '@/lib/utils/pagination'

interface PageProps {
  searchParams: Promise<{ role?: string; page?: string }>
}

const ROLES = ['admin', 'staff', 'student', 'parent'] as const
type Role = (typeof ROLES)[number]

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800',
  parent: 'bg-yellow-100 text-yellow-800',
}

export default async function UsersPage({ searchParams }: PageProps) {
  const { role, page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const activeRole = ROLES.includes(role as Role) ? (role as Role) : undefined

  const supabase = await createClient()

  // Count query
  let countQuery = supabase
    .from('persons')
    .select('*', { count: 'exact', head: true })
  if (activeRole) {
    countQuery = countQuery.eq('role', activeRole)
  }
  const { count: total } = await countQuery

  const { offset, totalPages } = getPaginationRange(page, PAGE_SIZE, total ?? 0)

  // Data query
  let dataQuery = supabase
    .from('persons')
    .select('id, full_name, email, role, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  if (activeRole) {
    dataQuery = dataQuery.eq('role', activeRole)
  }
  const { data: persons, error } = await dataQuery

  const baseUrl = `/dashboard/admin/users?${activeRole ? `role=${activeRole}&` : ''}`

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        {!error && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {total ?? 0}
          </span>
        )}
      </div>

      {/* Role filter tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border">
        <Link
          href="/dashboard/admin/users"
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            !activeRole
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </Link>
        {ROLES.map((r) => (
          <Link
            key={r}
            href={`/dashboard/admin/users?role=${r}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeRole === r
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </Link>
        ))}
      </div>

      {/* Error state */}
      {error ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Failed to load users. Please try again.
        </div>
      ) : !persons || persons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {persons.map((person) => (
                  <tr key={person.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {person.full_name ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {person.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          roleBadgeClass[person.role] ?? 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {person.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(person.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} baseUrl={baseUrl} />
        </>
      )}
    </div>
  )
}
